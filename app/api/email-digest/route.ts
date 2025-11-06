import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

/**
 * POST /api/email-digest
 * Generate weekly trend digest email for users
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

		// Get user goals for personalization
		const { data: profile } = await supabase
			.from('profiles')
			.select('primary_goal, goals')
			.eq('id', user.id)
			.single();

		const primaryGoal = profile?.primary_goal || "Build App";

		// Fetch top trends (from cache or fresh)
		const trendsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/trends`);
		const trendsData = await trendsResponse.json();
		const trends = trendsData.trends || [];

		// Get top 5 trends by momentum score
		const topTrends = trends.slice(0, 5);

		// Personalize trends for user's goal
		const personalizeResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/personalize-trends`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ goal: primaryGoal, trends: topTrends }),
		});

		const personalizedData = await personalizeResponse.json();
		const personalizedTrends = personalizedData.trends || topTrends;

		// Generate digest content
		const digest = {
			userId: user.id,
			userEmail: user.email,
			goal: primaryGoal,
			trends: personalizedTrends.map((t: any) => ({
				topic: t.topic,
				category: t.category,
				momentumScore: t.momentumScore,
				summary: t.summary || t.personalization?.potentialProducts?.[0]?.description,
				relevanceScore: t.personalization?.relevanceScore || t.momentumScore,
			})),
			generatedAt: new Date().toISOString(),
			week: new Date().toISOString().split('T')[0], // YYYY-MM-DD
		};

		// In production, this would trigger an email service (SendGrid, Resend, etc.)
		// For now, return the digest content
		console.log(`[Email Digest] Generated digest for ${user.email}`);

		return NextResponse.json({
			success: true,
			digest,
			message: "Digest generated. Email would be sent in production.",
		});
	} catch (error) {
		console.error('[Email Digest] Error:', error);
		return NextResponse.json(
			{ error: "Failed to generate email digest" },
			{ status: 500 }
		);
	}
}
