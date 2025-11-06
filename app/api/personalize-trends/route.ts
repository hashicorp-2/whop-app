import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

type UserGoal = "Build App" | "Create Content" | "Sell Knowledge" | "Run Agency";

interface PersonalizedTrend {
	trendId: string;
	matchedGoal: UserGoal;
	potentialProducts: Array<{
		type: string;
		description: string;
	}>;
	relevanceScore: number;
}

/**
 * POST /api/personalize-trends
 * Personalizes trends based on user goals
 */
export async function POST(req: NextRequest) {
	try {
		const { goal, trends } = await req.json();

		if (!goal || !trends || !Array.isArray(trends)) {
			return NextResponse.json(
				{ error: "Goal and trends array are required" },
				{ status: 400 }
			);
		}

		console.log(`[Personalization Engine] Personalizing ${trends.length} trends for goal: ${goal}`);

		const personalizationPrompt = `You are a strategic product advisor. A user with the goal "${goal}" wants to convert trends into profitable products.

For each trend provided, generate personalized product suggestions that match their goal.

For each trend, return:
- matchedGoal: The user's goal
- potentialProducts: Array of 3 product ideas with:
  - type: One of: "App", "Ebook", "Course", "Automation", "Community", "Service"
  - description: Specific product idea (1-2 sentences)
- relevanceScore: 1-100 (how well this trend matches their goal)

Trends:
${JSON.stringify(trends.slice(0, 5), null, 2)}

Return ONLY valid JSON:
{
  "personalizedTrends": [
    {
      "trendId": "trend-1",
      "matchedGoal": "${goal}",
      "potentialProducts": [
        {"type": "App", "description": "..."},
        {"type": "Ebook", "description": "..."},
        {"type": "Automation", "description": "..."}
      ],
      "relevanceScore": 85
    }
  ]
}`;

		const result = await openai.chat.completions.create({
			model: "gpt-4-turbo-preview",
			messages: [{ role: "user", content: personalizationPrompt }],
			max_tokens: 3000,
			temperature: 0.7,
			response_format: { type: "json_object" },
		});

		const data = JSON.parse(result.choices[0].message.content || '{}');
		const personalizedTrends: PersonalizedTrend[] = data.personalizedTrends || [];

		// Merge with original trend data
		const enrichedTrends = trends.map((trend: any) => {
			const personalized = personalizedTrends.find(p => p.trendId === trend.id);
			return {
				...trend,
				personalization: personalized || {
					matchedGoal: goal,
					potentialProducts: [],
					relevanceScore: 50,
				},
			};
		});

		// Sort by relevance score
		enrichedTrends.sort((a: any, b: any) => 
			(b.personalization?.relevanceScore || 0) - (a.personalization?.relevanceScore || 0)
		);

		return NextResponse.json({
			goal,
			trends: enrichedTrends,
			personalizedAt: new Date().toISOString(),
		});
	} catch (error) {
		console.error('[Personalization Engine] Error:', error);
		return NextResponse.json(
			{ error: "Failed to personalize trends" },
			{ status: 500 }
		);
	}
}
