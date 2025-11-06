import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

/**
 * GET /api/top-launches
 * Get top user launches for community page (social proof)
 */
export async function GET(req: NextRequest) {
	try {
		const supabase = await createClient();
		
		// Get top blueprints by creation date (public launches)
		const { data: blueprints, error } = await supabase
			.from('blueprints')
			.select(`
				id,
				trend_id,
				blueprint_data,
				created_at,
				user_id
			`)
			.order('created_at', { ascending: false })
			.limit(10)
			.catch(() => ({ data: [], error: null }));

		if (error) {
			console.warn('[Top Launches] Could not fetch blueprints:', error);
		}

		// Transform to public format
		const topLaunches = (blueprints || []).map((bp: any) => ({
			id: bp.id,
			trendTopic: bp.blueprint_data?.trendTopic || 'Trend',
			productName: bp.blueprint_data?.product?.overview?.substring(0, 60) + '...' || 'Product',
			category: bp.blueprint_data?.metadata?.category || 'General',
			createdAt: bp.created_at,
			goal: bp.blueprint_data?.metadata?.goal || 'Unknown',
		}));

		return NextResponse.json({
			launches: topLaunches,
			count: topLaunches.length,
			period: 'this_week',
		});
	} catch (error) {
		console.error('[Top Launches] Error:', error);
		return NextResponse.json(
			{ error: "Failed to fetch top launches" },
			{ status: 500 }
		);
	}
}
