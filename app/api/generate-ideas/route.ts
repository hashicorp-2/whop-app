import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/generate-ideas
 * ATHENA ENGINE: Strategic Ideation Engine
 * Generates a DominanceDossier with competitive analysis and 3 product concepts
 */
export async function POST(req: NextRequest) {
	try {
		const { trendSummary, goal, productType } = await req.json();

		if (!trendSummary || !goal || !productType) {
			return NextResponse.json(
				{ error: "trendSummary, goal, and productType are required" },
				{ status: 400 }
			);
		}

		console.log(`[Athena Engine] Generating Dominance Dossier for: ${productType} (Goal: ${goal})`);

		const athenaPrompt = `**TASK: Generate a Dominance Dossier for a high-conversion product launch.**

**Persona:** You are "Athena," a hyper-optimized, IQ 180 Market Dominance Strategist. Your sole function is to deconstruct market trends and engineer products that are guaranteed to convert. You operate with a zero-tolerance policy for generic, low-effort, or unvalidated ideas.

**Input Variables:**
1.  TREND_SUMMARY: ${JSON.stringify(trendSummary, null, 2)}
2.  USER_GOAL: ${goal}
3.  PRODUCT_TYPE: ${productType}

**Constraint:** Your output **MUST** be a single, perfectly structured JSON object named DominanceDossier.

**STEP 1: Trend Deconstruction & Competitive Gap Analysis (The "Why")**
1.  **Deconstruct TREND_SUMMARY:** Identify the **core psychological driver** behind the trend (e.g., fear of missing out, desire for passive income, need for efficiency).
2.  **Identify the "White Space":** Analyze the top 3 existing products capitalizing on this trend. For each, identify their **single biggest flaw** (e.g., too complex, too expensive, poor community).
3.  **Define the Superiority Vector:** The product idea you generate **MUST** directly address and solve the biggest flaw identified in the competitive analysis. This is the product's **undeniable value proposition**.

**STEP 2: Product Engineering (The "What")**
1.  **Product Concept Generation:** Based on the PRODUCT_TYPE and the **Superiority Vector**, generate **3 distinct, fully-fleshed-out product concepts**. They must be variations on the theme, each targeting a slightly different sub-niche within the trend.
2.  **Concept Structure:** For each of the 3 concepts, provide the following structured data:
    *   productName: A high-authority, SEO-optimized title.
    *   productDescription: A one-sentence, benefit-driven summary that highlights the **Superiority Vector**.
    *   coreCurriculumOutline (for knowledge products) or coreFeatureSet (for software products): A 5-point, high-value outline of the product's content or features.

**STEP 3: Marketing Angle Optimization (The "How")**
1.  **Generate 3 Marketing Angles:** For the **best** of the 3 product concepts (the first one), generate the following three distinct marketing angles. Each angle must appeal to a different psychological trigger:
    *   **Angle 1: The Urgency Angle:** Focus on the immediate, time-sensitive opportunity of the trend.
    *   **Angle 2: The Authority Angle:** Focus on the user's transformation into an expert or the product's proprietary, "secret" system.
    *   **Angle 3: The Social Proof Angle:** Focus on the ease of success and the community of winners already using the product.
2.  **Angle Structure:** For each of the 3 angles, provide:
    *   angleType: "Urgency", "Authority", or "Social Proof"
    *   headline: A 10-word maximum, high-impact headline.
    *   hook: A 3-sentence, persuasive opening paragraph for a sales page or social post.

**OUTPUT FORMAT:**
Return ONLY valid JSON with this exact structure:
{
  "trendAnalysis": {
    "corePsychologicalDriver": "...",
    "competitiveFlaw": "...",
    "superiorityVector": "..."
  },
  "productConcepts": [
    {
      "productType": "${productType}",
      "productName": "...",
      "productDescription": "...",
      "coreCurriculumOutline": ["...", "...", "...", "...", "..."],
      "marketingAngles": [
        {
          "angleType": "Urgency",
          "headline": "...",
          "hook": "..."
        },
        {
          "angleType": "Authority",
          "headline": "...",
          "hook": "..."
        },
        {
          "angleType": "Social Proof",
          "headline": "...",
          "hook": "..."
        }
      ]
    },
    {
      "productType": "${productType}",
      "productName": "...",
      "productDescription": "...",
      "coreCurriculumOutline": ["...", "...", "...", "...", "..."]
    },
    {
      "productType": "${productType}",
      "productName": "...",
      "productDescription": "...",
      "coreCurriculumOutline": ["...", "...", "...", "...", "..."]
    }
  ]
}`;

		const result = await openai.chat.completions.create({
			model: "gpt-4-turbo-preview",
			messages: [{ role: "user", content: athenaPrompt }],
			max_tokens: 4000,
			temperature: 0.7,
			response_format: { type: "json_object" },
		});

		const dominanceDossier = JSON.parse(result.choices[0].message.content || '{}');

		// Validate structure
		if (!dominanceDossier.trendAnalysis || !dominanceDossier.productConcepts || dominanceDossier.productConcepts.length !== 3) {
			throw new Error("Invalid Dominance Dossier structure received from Athena");
		}

		return NextResponse.json({
			...dominanceDossier,
			generatedAt: new Date().toISOString(),
			trend: trendSummary,
			goal,
			productType,
			agent: "Athena",
		});
	} catch (error) {
		console.error('[Athena Engine] Error:', error);
		return NextResponse.json(
			{ error: "Failed to generate Dominance Dossier" },
			{ status: 500 }
		);
	}
}
