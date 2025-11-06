import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
	apiVersion: '2025-10-29.clover',
}) : null;

export async function POST(req: NextRequest) {
	if (!stripe) {
		return NextResponse.json(
			{ error: "Stripe not configured" },
			{ status: 500 }
		);
	}

	try {
		const { email } = await req.json();

		if (!email) {
			return NextResponse.json(
				{ error: "Email is required" },
				{ status: 400 }
			);
		}

		// Find customer by email
		const customers = await stripe.customers.list({
			email,
			limit: 1,
		});

		if (customers.data.length === 0) {
			return NextResponse.json(
				{ error: "No Stripe customer found for this email" },
				{ status: 404 }
			);
		}

		const customer = customers.data[0];

		// Create portal session
		const session = await stripe.billingPortal.sessions.create({
			customer: customer.id,
			return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings/billing`,
		});

		return NextResponse.json({ url: session.url });
	} catch (error) {
		console.error("[Stripe Portal] Error:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Failed to create portal session" },
			{ status: 500 }
		);
	}
}
