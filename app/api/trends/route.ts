import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

interface TrendData {
	id: string;
	topic: string;
	category: string;
	momentumScore: number;
	summary: {
		whyItMatters: string;
		whoItServes: string;
		monetizationWindow: "short" | "medium" | "long";
	};
	source?: string;
	timestamp: string;
}

// In-memory cache (6 hours)
const trendCache: Map<string, { data: TrendData[]; expiresAt: number }> = new Map();
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

/**
 * Fetch and analyze trends from multiple sources
 */
async function fetchTrendsFromSources(): Promise<TrendData[]> {
	console.log('[Trend Engine] Fetching trends from sources...');

	// Since we don't have direct API access to Twitter/Reddit/Google Trends,
	// we use LLM to simulate trend analysis based on current knowledge
	const trendPrompt = `You are a trend analyst. Identify 10 CURRENT, EMERGING trends from the tech/creator economy that would make profitable digital products.

For each trend, provide:
- topic: The trend name (e.g., "AI Writing Assistants for E-commerce")
- category: One of: Tech, Business, Creative, Lifestyle, Education, Productivity
- momentumScore: 1-100 (higher = more momentum)
- whyItMatters: 2-3 sentence explanation
- whoItServes: Target audience description
- monetizationWindow: "short" (0-3 months), "medium" (3-12 months), or "long" (12+ months)

Focus on trends from:
- X/Twitter trending topics
- Reddit r/entrepreneur, r/SideProject hot posts
- Google Trends rising searches
- Product Hunt new launches

Return ONLY valid JSON:
{
  "trends": [
    {
      "topic": "Trend Name",
      "category": "Tech",
      "momentumScore": 85,
      "whyItMatters": "Explanation...",
      "whoItServes": "Target audience...",
      "monetizationWindow": "short"
    }
  ]
}`;

	try {
		const result = await openai.chat.completions.create({
			model: "gpt-4-turbo-preview",
			messages: [{ role: "user", content: trendPrompt }],
			max_tokens: 3000,
			temperature: 0.7,
			response_format: { type: "json_object" },
		});

		const data = JSON.parse(result.choices[0].message.content || '{}');
		const trends = (data.trends || []).map((trend: any, index: number) => ({
			id: `trend-${Date.now()}-${index}`,
			topic: trend.topic,
			category: trend.category,
			momentumScore: trend.momentumScore || 50,
			summary: {
				whyItMatters: trend.whyItMatters,
				whoItServes: trend.whoItServes,
				monetizationWindow: trend.monetizationWindow || "medium",
			},
			source: "aggregated",
			timestamp: new Date().toISOString(),
		}));

		// Sort by momentum score (highest first)
		trends.sort((a, b) => b.momentumScore - a.momentumScore);

		return trends;
	} catch (error) {
		console.error('[Trend Engine] Error fetching trends:', error);
		return [];
	}
}

/**
 * GET /api/trends
 * Returns cached or fresh trend data
 */
export async function GET(req: NextRequest) {
	try {
		const cacheKey = "global";
		const cached = trendCache.get(cacheKey);

		// Return cached data if still valid
		if (cached && cached.expiresAt > Date.now()) {
			console.log('[Trend Engine] Returning cached trends');
			return NextResponse.json({
				trends: cached.data,
				cached: true,
				expiresAt: new Date(cached.expiresAt).toISOString(),
			});
		}

		// Fetch fresh trends
		console.log('[Trend Engine] Fetching fresh trends...');
		const trends = await fetchTrendsFromSources();

		// Cache the results
		trendCache.set(cacheKey, {
			data: trends,
			expiresAt: Date.now() + CACHE_DURATION,
		});

		return NextResponse.json({
			trends,
			cached: false,
			expiresAt: new Date(Date.now() + CACHE_DURATION).toISOString(),
		});
	} catch (error) {
		console.error('[Trend Engine] Error:', error);
		return NextResponse.json(
			{ error: "Failed to fetch trends" },
			{ status: 500 }
		);
	}
}

/**
 * POST /api/trends/refresh
 * Force refresh the trend cache
 */
export async function POST(req: NextRequest) {
	try {
		const { action } = await req.json();
		
		if (action === "refresh") {
			trendCache.clear();
			const trends = await fetchTrendsFromSources();
			
			trendCache.set("global", {
				data: trends,
				expiresAt: Date.now() + CACHE_DURATION,
			});

			return NextResponse.json({
				trends,
				refreshed: true,
				expiresAt: new Date(Date.now() + CACHE_DURATION).toISOString(),
			});
		}

		return NextResponse.json({ error: "Invalid action" }, { status: 400 });
	} catch (error) {
		console.error('[Trend Engine] Error refreshing:', error);
		return NextResponse.json(
			{ error: "Failed to refresh trends" },
			{ status: 500 }
		);
	}
}
