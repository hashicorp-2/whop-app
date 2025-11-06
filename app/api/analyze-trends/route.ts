import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Oracle: Calculate Market Potential Score for a trend
 */
async function calculateMarketPotentialScore(
	trendName: string,
	trendData: any,
	niche: string
): Promise<{ score: number; justification: string }> {
	console.log(`[Oracle] Calculating Market Potential Score for: ${trendName}`);
	
	const scorePrompt = `Analyze the trend: "${trendName}".

Trend Details:
- Why It Matters: ${trendData.whyItMatters}
- Monetization Potential: ${trendData.monetizationPotential}
- Competition Level: ${trendData.competitionLevel}
- Target Niche: ${niche}

Based on:
1. Novelty (how new/emerging is this?)
2. Audience size (how many people are interested?)
3. Monetization signals (presence of paid ads, high-engagement discussions)
4. Content saturation (how much content already exists?)
5. Competition level (how many products already serve this?)

Provide a "Market Potential Score" from 1-100 and a one-sentence justification.

Return ONLY valid JSON:
{
  "score": 85,
  "justification": "High score because this trend shows strong monetization signals with low competition in a growing market."
}`;

	try {
		const scoreResult = await openai.chat.completions.create({
			model: "gpt-4-turbo-preview",
			messages: [{ role: "user", content: scorePrompt }],
			max_tokens: 200,
			temperature: 0.7,
			response_format: { type: "json_object" },
		});

		const scoreData = JSON.parse(scoreResult.choices[0].message.content || '{}');
		return {
			score: Math.min(100, Math.max(1, scoreData.score || 50)),
			justification: scoreData.justification || "Market potential analyzed based on current signals.",
		};
	} catch (error) {
		console.error('[Oracle] Error calculating score:', error);
		return {
			score: 50,
			justification: "Score calculation unavailable. Proceed with caution.",
		};
	}
}

/**
 * Analyze trends with Market Potential Scores
 */
export async function POST(req: NextRequest) {
	try {
		const { niche } = await req.json();

		if (!niche || !niche.trim()) {
			return NextResponse.json(
				{ error: "Niche is required" },
				{ status: 400 }
			);
		}

		console.log(`[Oracle] Analyzing trends for niche: ${niche}`);

		// STEP 1: Find trends
		const trendAnalysisPrompt = `You are a world-class trend analyst. Analyze the niche "${niche.trim()}" and identify 3-5 EMERGING, CURRENT trends that would make profitable digital products.

For each trend, provide:
- trendName: A catchy trend name
- whyItMatters: Why this is relevant RIGHT NOW
- monetizationPotential: Low/Medium/High
- competitionLevel: Low/Medium/High

Return ONLY valid JSON with this structure:
{
  "trends": [
    {
      "trendName": "Trend 1",
      "whyItMatters": "Brief explanation",
      "monetizationPotential": "High",
      "competitionLevel": "Low"
    },
    ...more trends
  ]
}`;

		const trendAnalysis = await openai.chat.completions.create({
			model: "gpt-4-turbo-preview",
			messages: [{ role: "user", content: trendAnalysisPrompt }],
			max_tokens: 1500,
			temperature: 0.8,
			response_format: { type: "json_object" },
		});

		const trendsData = JSON.parse(trendAnalysis.choices[0].message.content || '{}');
		const trends = trendsData.trends || [];
		console.log(`[Oracle] Found ${trends.length} trends`);

		// STEP 2: Calculate Market Potential Score for each trend
		console.log('[Oracle] Calculating Market Potential Scores...');
		const trendsWithScores = await Promise.all(
			trends.map(async (trend: any) => {
				const scoreData = await calculateMarketPotentialScore(trend.trendName, trend, niche.trim());
				return {
					...trend,
					marketPotentialScore: scoreData.score,
					scoreJustification: scoreData.justification,
				};
			})
		);

		// Sort by score (highest first)
		trendsWithScores.sort((a: any, b: any) => b.marketPotentialScore - a.marketPotentialScore);

		console.log('[Oracle] Analysis complete');

		return NextResponse.json({
			niche: niche.trim(),
			trends: trendsWithScores,
			analyzedAt: new Date().toISOString(),
		});
	} catch (error) {
		console.error("[Oracle] Error:", error);
		
		const errorMessage = error instanceof OpenAI.APIError 
			? "AI service temporarily unavailable" 
			: error instanceof Error
			? error.message
			: "Failed to analyze trends";
		
		return NextResponse.json(
			{ error: errorMessage },
			{ status: 500 }
		);
	}
}
