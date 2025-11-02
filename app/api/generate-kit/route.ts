import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
	try {
		const { trend } = await req.json();

		if (!trend) {
			return NextResponse.json(
				{ error: "Trend keyword is required" },
				{ status: 400 }
			);
		}

		const systemPrompt = `You are a world-class product launch strategist and Whop expert. Your sole function is to act as the "Trend-to-Product Engine".

A creator has given you a trending keyword: "{trend}".

Your task is to generate a complete "Product Launch Kit" in a JSON format. Do not deviate.

1. **Analyze the Trend:** Briefly identify the target audience and the core value proposition.
2. **Generate Product Details:**
   * productName: A catchy, SEO-friendly name for the digital product.
   * productDescription: A 2-3 sentence description of the product.
   * productContent: The full content of the product, formatted in Markdown. If it's a Notion template, provide the structure. If it's a guide, write the guide. If it's prompts, list them.
3. **Generate Whop Listing Copy:**
   * whopListingCopy: A complete, ready-to-publish Whop listing. Include a compelling title, a detailed description with bullet points of what's inside, and 5 relevant SEO tags.

Here is the JSON structure you must follow. Fill it with the generated content:
{
  "productName": "Your Generated Product Name",
  "productDescription": "Your generated product description.",
  "productContent": "# Your Product Title\\n\\n## Section 1\\n\\nYour detailed product content in Markdown...",
  "whopListingCopy": "## Whop Listing Title\\n\\n### Description\\n\\n- Benefit 1\\n- Benefit 2\\n\\n### Tags\\n\\n- tag1, tag2, tag3, tag4, tag5"
}`;

		const userPrompt = `Generate the product kit for trend: ${trend}`;

		const completion = await openai.chat.completions.create({
			model: "gpt-4-turbo-preview",
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			],
			max_tokens: 3000,
			temperature: 0.8,
			response_format: { type: "json_object" },
		});

		const response = completion.choices[0]?.message?.content || "";
		
		let productKit;
		try {
			productKit = JSON.parse(response);
		} catch (error) {
			console.error("Failed to parse JSON:", error);
			return NextResponse.json(
				{ error: "Failed to generate product kit" },
				{ status: 500 }
			);
		}

		return NextResponse.json(productKit);
	} catch (error) {
		console.error("Error generating kit:", error);
		return NextResponse.json(
			{ error: "Failed to generate product kit" },
			{ status: 500 }
		);
	}
}
