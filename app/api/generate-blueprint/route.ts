import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/generate-blueprint
 * Launchpad Content Generator
 * Returns structured JSON following the exact specification
 */
export async function POST(req: NextRequest) {
	try {
		const { trend_summary, user_goal, product_type } = await req.json();

		if (!trend_summary || !user_goal || !product_type) {
			return NextResponse.json(
				{ error: "trend_summary, user_goal, and product_type are required" },
				{ status: 400 }
			);
		}

		console.log(`[Launchpad Generator] Generating blueprint for: ${product_type} (Goal: ${user_goal})`);

		const systemPrompt = `You are Launchpad's content generator.

Input fields:
- trend_summary: short plain‑text summary of the current trend.
- user_goal: what the customer wants to do (e.g., "build a fitness app", "write a wellness ebook").
- product_type: app | ebook | guide | automation | community | course.

Output must be valid JSON following this schema exactly.
Do NOT include commentary or markdown, only raw JSON.`;

		const userPrompt = `Generate a complete product blueprint and marketing playbook for:

trend_summary: ${typeof trend_summary === 'string' ? trend_summary : JSON.stringify(trend_summary)}
user_goal: ${user_goal}
product_type: ${product_type}

Return ONLY valid JSON with this exact structure:
{
  "product_blueprint": {
    "product_title": "string – short brandable name that fits the trend",
    "core_concept": "string – 2‑3 sentences summarizing what the product is and why it exists",
    "problem_solved": "string – short paragraph explaining the user pain point",
    "primary_audience": "string – who the product targets",
    "key_features": [
      "feature 1",
      "feature 2",
      "feature 3"
    ],
    "value_proposition": "string – one line finishing: 'Users will pay because…'",
    "business_model_pricing": "string – monetization strategy and suggested price",
    "recommended_format_or_stack": "string – ebook format or tech stack suggestion",
    "validation_angle": "string – quick way to test market interest"
  },

  "marketing_playbook": {
    "tagline": "string – 10‑15 word elevator pitch",
    "core_hooks": [
      "hook idea 1",
      "hook idea 2",
      "hook idea 3"
    ],
    "launch_channels": [
      "channel 1 with short reason",
      "channel 2 with short reason",
      "channel 3 with short reason"
    ],
    "content_sequence_plan": {
      "day_1": "post idea",
      "day_2": "post idea",
      "day_3": "post idea",
      "day_4": "post idea",
      "day_5": "post idea",
      "day_6": "post idea",
      "day_7": "post idea"
    },
    "email_sequence": [
      {
        "subject": "string",
        "body": "string – one‑sentence body copy"
      },
      {
        "subject": "string",
        "body": "string"
      },
      {
        "subject": "string",
        "body": "string"
      }
    ],
    "ad_copy_samples": [
      {
        "headline": "string – short headline <50 chars",
        "cta": "string"
      },
      {
        "headline": "string",
        "cta": "string"
      }
    ],
    "visual_asset_prompts": [
      "prompt 1 for AI image generation",
      "prompt 2 for AI image generation"
    ],
    "early_conversion_tactic": "string – incentive for first buyers",
    "metrics_to_track": [
      "metric 1",
      "metric 2",
      "metric 3"
    ]
  },

  "export_metadata": {
    "generated_at": "ISO timestamp",
    "trend_source": "string – where the trend was sourced",
    "user_goal": "string – echo the input goal"
  }
}`;

		const completion = await openai.chat.completions.create({
			model: "gpt-4-turbo-preview",
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt }
			],
			response_format: { type: "json_object" },
			max_tokens: 4000,
			temperature: 0.7,
		});

		const rawContent = completion.choices[0].message.content;
		if (!rawContent) {
			throw new Error("No content returned from OpenAI");
		}

		let data;
		try {
			data = JSON.parse(rawContent);
		} catch (parseError) {
			console.error("Failed to parse JSON response:", rawContent);
			throw new Error("Invalid JSON response from OpenAI");
		}

		// Validate required structure
		if (!data.product_blueprint || !data.marketing_playbook) {
			console.error("Invalid response structure:", data);
			throw new Error("Response missing required fields: product_blueprint or marketing_playbook");
		}

		// Ensure export_metadata is set
		if (!data.export_metadata) {
			data.export_metadata = {
				generated_at: new Date().toISOString(),
				trend_source: "Launchpad Trend Engine",
				user_goal: user_goal,
			};
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error('[Launchpad Generator] Error:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Failed to generate blueprint" },
			{ status: 500 }
		);
	}
}
