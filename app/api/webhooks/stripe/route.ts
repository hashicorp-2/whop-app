import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from '@/lib/supabase-server';
import { updateSubscriptionTier } from '@/lib/database-service';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
	apiVersion: '2025-10-29.clover',
}) : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * Stripe Webhook Handler
 * Handles checkout.session.completed and customer.subscription.updated events
 */
export async function POST(req: NextRequest) {
	if (!stripe) {
		console.error('[Stripe Webhook] Stripe not configured');
		return NextResponse.json(
			{ error: "Webhook configuration error" },
			{ status: 500 }
		);
	}

	try {
		const body = await req.text();
		const signature = req.headers.get('stripe-signature');

		if (!signature || !webhookSecret) {
			console.error('[Stripe Webhook] Missing signature or webhook secret');
			return NextResponse.json(
				{ error: "Webhook configuration error" },
				{ status: 400 }
			);
		}

		// Verify webhook signature
		let event: Stripe.Event;
		try {
			event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
		} catch (err) {
			console.error('[Stripe Webhook] Signature verification failed:', err);
			return NextResponse.json(
				{ error: "Webhook signature verification failed" },
				{ status: 400 }
			);
		}

		// Handle checkout.session.completed (new subscription)
		if (event.type === 'checkout.session.completed') {
			const session = event.data.object as Stripe.Checkout.Session;
			
			if (session.mode === 'subscription' && session.customer_email && session.subscription) {
				console.log(`[Stripe Webhook] Checkout completed for: ${session.customer_email}`);
				
				// Get subscription details to determine tier
				const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
				const priceId = subscription.items.data[0]?.price.id;
				
				// Map Stripe price IDs to tiers
				const tier = getTierFromPriceId(priceId);
				
				if (tier) {
					// Find user by email and update tier
					const supabase = await createClient();
					const { data: users } = await supabase.auth.admin.listUsers();
					const user = users.users.find(u => u.email === session.customer_email);
					
					if (user) {
						await updateSubscriptionTier(user.id, tier);
						console.log(`[Stripe Webhook] Updated ${session.customer_email} to ${tier} tier`);
					} else {
						console.warn(`[Stripe Webhook] User not found for email: ${session.customer_email}`);
					}
				}
			}
		}

		// Handle customer.subscription.updated (tier changes, cancellations)
		if (event.type === 'customer.subscription.updated') {
			const subscription = event.data.object as Stripe.Subscription;
			
			if (subscription.status === 'active' || subscription.status === 'trialing') {
				const priceId = subscription.items.data[0]?.price.id;
				const tier = getTierFromPriceId(priceId);
				
				if (tier && subscription.customer) {
					// Find user by Stripe customer ID (stored in metadata or email)
					const customer = await stripe.customers.retrieve(subscription.customer as string);
					const email = typeof customer === 'object' && !customer.deleted ? customer.email : null;
					
					if (email) {
						const supabase = await createClient();
						const { data: users } = await supabase.auth.admin.listUsers();
						const user = users.users.find(u => u.email === email);
						
						if (user) {
							await updateSubscriptionTier(user.id, tier);
							console.log(`[Stripe Webhook] Updated subscription for ${email} to ${tier} tier`);
						}
					}
				}
			} else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
				// Downgrade to free tier
				const customer = await stripe.customers.retrieve(subscription.customer as string);
				const email = typeof customer === 'object' && !customer.deleted ? customer.email : null;
				
				if (email) {
					const supabase = await createClient();
					const { data: users } = await supabase.auth.admin.listUsers();
					const user = users.users.find(u => u.email === email);
					
					if (user) {
						await updateSubscriptionTier(user.id, 'trial');
						console.log(`[Stripe Webhook] Downgraded ${email} to free tier`);
					}
				}
			}
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		console.error("[Stripe Webhook] Error:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Webhook handler failed" },
			{ status: 500 }
		);
	}
}

/**
 * Map Stripe price ID to subscription tier
 * Update these with your actual Stripe price IDs
 */
function getTierFromPriceId(priceId: string | undefined): 'trial' | 'pro' | 'agency' | null {
	if (!priceId) return null;
	
	// Get price IDs from environment or use defaults
	const proPriceId = process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly';
	const agencyPriceId = process.env.STRIPE_AGENCY_PRICE_ID || 'price_agency_monthly';
	
	if (priceId === proPriceId) {
		return 'pro';
	} else if (priceId === agencyPriceId) {
		return 'agency';
	}
	
	return null;
}
