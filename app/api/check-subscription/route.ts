import { NextRequest, NextResponse } from 'next/server';
import { getWhopUserFromEmail, checkSubscription } from '@/lib/whop-sdk';

export async function POST(req: NextRequest) {
	try {
		const { email } = await req.json();

		if (!email) {
			return NextResponse.json(
				{ error: 'Email is required' },
				{ status: 400 }
			);
		}

		// Get Whop user ID from email
		const whopUserId = await getWhopUserFromEmail(email);

		if (!whopUserId) {
			return NextResponse.json(
				{ error: 'User not found in Whop' },
				{ status: 401 }
			);
		}

		// Check subscription status
		const subscriptionStatus = await checkSubscription(whopUserId);

		return NextResponse.json(subscriptionStatus);
	} catch (error) {
		console.error('Error in check-subscription API:', error);
		return NextResponse.json(
			{ error: 'Failed to check subscription' },
			{ status: 500 }
		);
	}
}
