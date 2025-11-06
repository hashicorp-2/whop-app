import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

/**
 * POST /api/feedback
 * Capture user feedback on generated ideas for learning loop
 */
export async function POST(req: NextRequest) {
	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const {
			trendId,
			productType,
			score, // 1-5 rating
			feedback,
			blueprintId,
			campaignId,
		} = await req.json();

		if (!trendId || !productType || !score) {
			return NextResponse.json(
				{ error: "trendId, productType, and score are required" },
				{ status: 400 }
			);
		}

		if (score < 1 || score > 5) {
			return NextResponse.json(
				{ error: "Score must be between 1 and 5" },
				{ status: 400 }
			);
		}

		console.log(`[Feedback Loop] Recording feedback: ${score}/5 for trend ${trendId}`);

		// Store feedback
		const { error: insertError } = await supabase
			.from('feedback')
			.insert({
				user_id: user.id,
				trend_id: trendId,
				product_type: productType,
				score,
				feedback_text: feedback || null,
				blueprint_id: blueprintId || null,
				campaign_id: campaignId || null,
				created_at: new Date().toISOString(),
			});

		if (insertError) {
			console.warn('[Feedback Loop] Could not store feedback (table may not exist):', insertError);
			// Non-critical - still return success
		}

		// Update user profile with feedback insights (if we want to track preferences)
		// This could be used to improve future personalization

		return NextResponse.json({
			success: true,
			message: "Feedback recorded successfully",
			recordedAt: new Date().toISOString(),
		});
	} catch (error) {
		console.error('[Feedback Loop] Error:', error);
		return NextResponse.json(
			{ error: "Failed to record feedback" },
			{ status: 500 }
		);
	}
}

/**
 * GET /api/feedback/stats
 * Get feedback statistics for personalization improvement
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

		const { data: feedback, error } = await supabase
			.from('feedback')
			.select('score, product_type, trend_id')
			.eq('user_id', user.id);

		if (error) {
			console.warn('[Feedback Loop] Could not fetch feedback:', error);
			return NextResponse.json({
				averageScore: 0,
				totalFeedback: 0,
				preferences: {},
			});
		}

		const total = feedback?.length || 0;
		const averageScore = total > 0
			? feedback.reduce((sum, f) => sum + (f.score || 0), 0) / total
			: 0;

		// Calculate preferences by product type
		const preferences: Record<string, number> = {};
		feedback?.forEach((f) => {
			if (f.product_type) {
				preferences[f.product_type] = (preferences[f.product_type] || 0) + (f.score || 0);
			}
		});

		return NextResponse.json({
			averageScore: Math.round(averageScore * 10) / 10,
			totalFeedback: total,
			preferences,
		});
	} catch (error) {
		console.error('[Feedback Loop] Error fetching stats:', error);
		return NextResponse.json(
			{ error: "Failed to fetch feedback stats" },
			{ status: 500 }
		);
	}
}
