import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateSubscriptionStatus } from '@/lib/subscription-service';

export async function POST(req: NextRequest) {
	try {
		const rawBody = await req.text();
		const signature = req.headers.get('x-whop-signature');

		if (!signature) {
			return NextResponse.json(
				{ error: 'Missing signature' },
				{ status: 401 }
			);
		}

		// Verify webhook signature
		const webhookSecret = process.env.WHOP_WEBHOOK_SECRET;
		if (!webhookSecret) {
			console.error('WHOP_WEBHOOK_SECRET not configured');
			return NextResponse.json(
				{ error: 'Webhook not configured' },
				{ status: 500 }
			);
		}

		const expectedSignature = crypto
			.createHmac('sha256', webhookSecret)
			.update(rawBody)
			.digest('hex');

		if (signature !== expectedSignature) {
			return NextResponse.json(
				{ error: 'Invalid signature' },
				{ status: 401 }
			);
		}

		// Parse webhook payload
		const payload = JSON.parse(rawBody);
		const event = payload.event;

		console.log('Received Whop webhook event:', event);

		// Handle subscription events
		switch (event) {
			case 'subscription.created': {
				const subscription = payload.data;
				const userId = subscription.user_id;
				const expiresAt = subscription.expires_at 
					? new Date(subscription.expires_at) 
					: undefined;

				await updateSubscriptionStatus(userId, true, expiresAt);
				console.log('Subscription created for user:', userId);
				break;
			}

			case 'subscription.cancelled': {
				const subscription = payload.data;
				const userId = subscription.user_id;

				await updateSubscriptionStatus(userId, false);
				console.log('Subscription cancelled for user:', userId);
				break;
			}

			case 'subscription.updated': {
				const subscription = payload.data;
				const userId = subscription.user_id;
				const expiresAt = subscription.expires_at 
					? new Date(subscription.expires_at) 
					: undefined;
				const isActive = subscription.status === 'active';

				await updateSubscriptionStatus(userId, isActive, expiresAt);
				console.log('Subscription updated for user:', userId);
				break;
			}

			default:
				console.log('Unhandled webhook event:', event);
		}

		return NextResponse.json({ message: 'Webhook processed' });
	} catch (error) {
		console.error('Error processing Whop webhook:', error);
		return NextResponse.json(
			{ error: 'Failed to process webhook' },
			{ status: 500 }
		);
	}
}
