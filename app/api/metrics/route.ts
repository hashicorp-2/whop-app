import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

/**
 * GET /api/metrics
 * Get executive metrics for idea-to-revenue pipeline
 */
export async function GET(req: NextRequest) {
	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Check if admin (for now, just return user-specific metrics)
		const isAdmin = false; // TODO: Add admin check

		console.log('[Metrics] Fetching pipeline metrics');

		// Get user-specific metrics
		const [
			generationsResult,
			blueprintsResult,
			campaignsResult,
			feedbackResult,
		] = await Promise.all([
			// Trends processed (generations count)
			supabase
				.from('generations')
				.select('id, created_at', { count: 'exact' })
				.eq('user_id', user.id)
				.order('created_at', { ascending: false }),
			
			// Blueprints built
			supabase
				.from('blueprints')
				.select('id, created_at', { count: 'exact' })
				.eq('user_id', user.id)
				.order('created_at', { ascending: false })
				.catch(() => ({ data: [], count: 0 })), // Table may not exist
			
			// Campaigns deployed (using generations as proxy for now)
			supabase
				.from('generations')
				.select('id, created_at', { count: 'exact' })
				.eq('user_id', user.id)
				.eq('status', 'success')
				.catch(() => ({ data: [], count: 0 })),
			
			// Average feedback score
			supabase
				.from('feedback')
				.select('score')
				.eq('user_id', user.id)
				.catch(() => ({ data: [] })),
		]);

		const trendsProcessed = generationsResult.count || 0;
		const blueprintsBuilt = (blueprintsResult as any).count || 0;
		const campaignsDeployed = (campaignsResult as any).count || 0;
		
		// Calculate conversion rate
		const conversionRate = trendsProcessed > 0
			? Math.round((campaignsDeployed / trendsProcessed) * 100)
			: 0;

		// Calculate average launch time (time from generation to blueprint)
		let averageLaunchTime = 0;
		if (blueprintsBuilt > 0 && generationsResult.data) {
			// Simplified: assume average time between first generation and blueprint
			// In production, track timestamps more accurately
			averageLaunchTime = 24; // Placeholder: 24 hours
		}

		// Calculate average feedback score
		const feedback = (feedbackResult as any).data || [];
		const averageFeedback = feedback.length > 0
			? feedback.reduce((sum: number, f: any) => sum + (f.score || 0), 0) / feedback.length
			: 0;

		// Monthly breakdown
		const thisMonth = new Date();
		thisMonth.setDate(1);
		const thisMonthGenerations = generationsResult.data?.filter((g: any) => 
			new Date(g.created_at) >= thisMonth
		).length || 0;

		const metrics = {
			trendsProcessed,
			blueprintsBuilt,
			campaignsDeployed,
			conversionRate,
			averageLaunchTime, // in hours
			averageFeedback: Math.round(averageFeedback * 10) / 10,
			thisMonthTrends: thisMonthGenerations,
			calculatedAt: new Date().toISOString(),
		};

		return NextResponse.json(metrics);
	} catch (error) {
		console.error('[Metrics] Error:', error);
		return NextResponse.json(
			{ error: "Failed to fetch metrics" },
			{ status: 500 }
		);
	}
}
