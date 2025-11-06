import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { getUserStats, getGenerationHistory } from '@/lib/database-service';

export async function GET(req: NextRequest) {
	try {
		// Get authenticated user
		const supabase = await createClient();
		const { data: { user }, error: authError } = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		// Get user stats
		const stats = await getUserStats(user.id);
		
		if (!stats) {
			return NextResponse.json(
				{ error: 'Failed to fetch user data' },
				{ status: 500 }
			);
		}

		// Get generation history
		const history = await getGenerationHistory(user.id, 10);

		// Get full user profile
		const { data: userProfile } = await supabase
			.from('users')
			.select('*')
			.eq('id', user.id)
			.single();

		return NextResponse.json({
			profile: {
				email: user.email,
				createdAt: userProfile?.created_at,
				subscriptionStatus: stats.subscription_status,
				subscriptionExpiresAt: stats.subscription_expires_at,
			},
			stats: {
				totalGenerations: stats.total_generations || 0,
				monthlyGenerations: stats.monthly_generations || 0,
			},
			history,
		});
	} catch (error) {
		console.error('Error in user-dashboard API:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch dashboard data' },
			{ status: 500 }
		);
	}
}
