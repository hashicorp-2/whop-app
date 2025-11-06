import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/campaign
 * Generate campaign assets from blueprint using agentic system
 */
export async function POST(req: NextRequest) {
	try {
		const { blueprint } = await req.json();

		if (!blueprint || !blueprint.product || !blueprint.marketing) {
			return NextResponse.json(
				{ error: "Valid blueprint is required" },
				{ status: 400 }
			);
		}

		console.log('[Campaign Engine] Generating campaign assets from blueprint');

		// Multi-agent prompt: Strategist, CopyArchitect, VisualDesigner
		const campaignPrompt = `You are a campaign orchestration system with three specialized agents:

1. Strategist - Validates positioning and identifies optimal channels
2. CopyArchitect - Crafts compelling copy across formats
3. VisualDesigner - Creates visual briefs and creative direction

Blueprint Context:
${JSON.stringify({
	product: blueprint.product,
	trend: blueprint.trendContext,
	goal: blueprint.metadata.goal,
}, null, 2)}

Generate comprehensive campaign assets:

1. emails: Array of 3 email templates
   - Subject line
   - Preview text
   - Body copy (structured)
   - CTA text

2. ads: Array of 5 ad variations
   - Platform (Facebook, Instagram, Twitter, Google, TikTok)
   - Headline
   - Description/copy
   - CTA
   - Target audience notes

3. posts: Array of 5 social media posts
   - Platform (Twitter, LinkedIn, Instagram, TikTok, Reddit)
   - Post copy
   - Hashtags (if applicable)
   - Visual notes

4. visualPrompts: Array of 3 visual asset briefs
   - Type (Hero Image, Social Graphic, Ad Creative)
   - Description for AI image generation
   - Aspect ratio
   - Style notes

Tone: Confident precision, clear value proposition, no hyperbole.

Return ONLY valid JSON:
{
  "campaignAssets": {
    "emails": [...],
    "ads": [...],
    "posts": [...],
    "visualPrompts": [...]
  },
  "strategicRecommendations": {
    "primaryChannel": "...",
    "launchSequence": [...],
    "budgetAllocation": {...}
  }
}`;

		const result = await openai.chat.completions.create({
			model: "gpt-4-turbo-preview",
			messages: [{ role: "user", content: campaignPrompt }],
			max_tokens: 4000,
			temperature: 0.7,
			response_format: { type: "json_object" },
		});

		const campaignData = JSON.parse(result.choices[0].message.content || '{}');
		const assets = campaignData.campaignAssets || {};
		const strategy = campaignData.strategicRecommendations || {};

		return NextResponse.json({
			campaignAssets: {
				emails: assets.emails || [],
				ads: assets.ads || [],
				posts: assets.posts || [],
				visualPrompts: assets.visualPrompts || [],
			},
			strategicRecommendations: strategy,
			generatedAt: new Date().toISOString(),
			blueprintId: blueprint.id,
		});
	} catch (error) {
		console.error('[Campaign Engine] Error:', error);
		return NextResponse.json(
			{ error: "Failed to generate campaign assets" },
			{ status: 500 }
		);
	}
}
