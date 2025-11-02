import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
	try {
		const { niche, goals, bottleneck } = await req.json();

		if (!niche || !goals || !bottleneck) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Construct the prompt for OpenAI
		const systemPrompt = `Act as an expert business strategist and Whop ecosystem specialist. Your task is to create a "30-Day Ironclad Blueprint" for a creator.

Generate a step-by-step system that includes the following four sections. Format the entire output in clean Markdown.

# 1. 30-Day Content Calendar
- Provide a week-by-week breakdown of content themes (e.g., "Week 1: Foundational Content," "Week 2: Advanced Tips").
- Suggest 3 specific content ideas per week.

# 2. Monetization Engine
- Suggest 3 new digital products the creator can sell on their Whop store, based on their niche.
- For each product, provide a name, a one-sentence description, and a recommended price point.

# 3. Fan Engagement System
- Provide 2 scripts for engaging fans on Discord or via email (e.g., a welcome message for new fans, a re-engagement message for inactive ones).

# 4. Growth Lever
- Give one high-impact tip for growing their Whop store, leveraging a current trend.

Make the advice actionable, specific, and easy to understand.`;

		const userPrompt = `Here is the creator's information:
- Niche: ${niche}
- Goals: ${goals}
- Biggest Bottleneck: ${bottleneck}`;

		const completion = await openai.chat.completions.create({
			model: "gpt-4-turbo-preview",
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			],
			max_tokens: 2000,
			temperature: 0.7,
		});

		const blueprint = completion.choices[0]?.message?.content || "";

		return NextResponse.json({ blueprint });
	} catch (error) {
		console.error("Error generating blueprint:", error);
		return NextResponse.json(
			{ error: "Failed to generate blueprint" },
			{ status: 500 }
		);
	}
}
