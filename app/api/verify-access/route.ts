import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
	try {
		const { userId } = await req.json();

		if (!userId) {
			return NextResponse.json(
				{ error: 'User ID is required' },
				{ status: 400 }
			);
		}

		// Get user from Supabase
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json(
				{ hasAccess: false },
				{ status: 401 }
			);
		}

		// Check subscription status
		const { data: subscription } = await supabase
			.from('subscriptions')
			.select('*')
			.eq('user_id', userId)
			.single();

		const hasAccess = subscription?.is_subscribed || false;

		return NextResponse.json({ hasAccess });
	} catch (error) {
		console.error('Error in verify-access API:', error);
		return NextResponse.json(
			{ error: 'Failed to verify access' },
			{ status: 500 }
		);
	}
}
