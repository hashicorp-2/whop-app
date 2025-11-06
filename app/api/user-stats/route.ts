import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { getUserStats, getGenerationHistory } from '@/lib/database-service';

export async function GET(req: NextRequest) {
	try {
		// Get authenticated user
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		// Get user stats
		const stats = await getUserStats(user.id);
		
		if (!stats) {
			return NextResponse.json(
				{ error: 'Failed to fetch stats' },
				{ status: 500 }
			);
		}

		// Get recent generation history
		const history = await getGenerationHistory(user.id, 10);

		return NextResponse.json({
			stats,
			recentGenerations: history,
		});
	} catch (error) {
		console.error('Error in user-stats API:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch user stats' },
			{ status: 500 }
		);
	}
}
