import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/optimize-blueprint
 * ARES ENGINE: Dominance Engine
 * Generates statistically superior A/B test variants based on performance data
 */
export async function POST(req: NextRequest) {
	try {
		const { liveMarketingAsset, performanceData, productConcept } = await req.json();

		if (!liveMarketingAsset || !performanceData || !productConcept) {
			return NextResponse.json(
				{ error: "liveMarketingAsset, performanceData, and productConcept are required" },
				{ status: 400 }
			);
		}

		console.log(`[Ares Engine] Generating optimization variant for: ${productConcept.productName}`);

		const aresPrompt = `**TASK: Generate a statistically superior alternative marketing angle (A/B Test Variant B).**

**Persona:** You are "Ares," the God of War and Optimization. Your task is to ruthlessly analyze the performance of a live launch and generate a statistically superior alternative for A/B testing. You only deal in measurable improvements.

**Input Variables:**
1.  LIVE_MARKETING_ASSET: ${JSON.stringify(liveMarketingAsset, null, 2)}
2.  PERFORMANCE_DATA: ${JSON.stringify(performanceData, null, 2)}
3.  PRODUCT_CONCEPT: ${JSON.stringify(productConcept, null, 2)}

**Constraint:** Your output **MUST** be a single, statistically superior alternative marketing angle.

**STEP 1: Performance Deconstruction**
1.  **Analyze PERFORMANCE_DATA:** Identify the primary failure point.
    *   If CTR is low (< 1.5%), the **Headline** is the failure point. The new headline must be more provocative or benefit-driven.
    *   If Conversion Rate is low (< 1.0%), the **Hook** is the failure point. The new hook must increase urgency or credibility.
2.  **Deconstruct LIVE_MARKETING_ASSET:** Determine the current angle's psychological trigger (Urgency, Authority, or Social Proof). The new variant **MUST** switch to one of the other two triggers to provide a statistically valid A/B test.

**STEP 2: Generate Superior Variant B**
1.  **Select New Angle:** Choose the most statistically promising alternative angle (e.g., if current is Urgency, switch to Authority).
2.  **Generate New Headline:** Create a new headline (max 10 words) that directly addresses the failure point identified in Step 1 and leverages the new angle's psychological trigger.
3.  **Generate New Hook:** Create a new 3-sentence hook that is statistically superior to the live one by being more direct, more credible, or more urgent, depending on the chosen new angle.

**OUTPUT FORMAT:**
Return ONLY valid JSON with this exact structure:
{
  "optimizationAnalysis": {
    "failurePoint": "...",
    "newPsychologicalTrigger": "..."
  },
  "variantB": {
    "angleType": "...",
    "headline": "...",
    "hook": "..."
  }
}`;

		const result = await openai.chat.completions.create({
			model: "gpt-4-turbo-preview",
			messages: [{ role: "user", content: aresPrompt }],
			max_tokens: 1500,
			temperature: 0.8,
			response_format: { type: "json_object" },
		});

		const optimization = JSON.parse(result.choices[0].message.content || '{}');

		// Validate structure - ensure all required fields are present
		if (!optimization.variantB || !optimization.optimizationAnalysis) {
			throw new Error("Invalid Optimization structure received from Ares");
		}

		// Validate optimizationAnalysis required fields
		if (!optimization.optimizationAnalysis.failurePoint || 
			!optimization.optimizationAnalysis.newPsychologicalTrigger) {
			throw new Error("Missing required fields in optimizationAnalysis");
		}

		// Validate variantB required fields
		if (!optimization.variantB.angleType || 
			!optimization.variantB.headline || 
			!optimization.variantB.hook) {
			throw new Error("Missing required fields in variantB");
		}

		// Validate headline is max 10 words
		const headlineWordCount = optimization.variantB.headline.split(/\s+/).length;
		if (headlineWordCount > 10) {
			console.warn(`[Ares Engine] Headline exceeds 10 words (${headlineWordCount}), truncating...`);
			optimization.variantB.headline = optimization.variantB.headline.split(/\s+/).slice(0, 10).join(' ');
		}

		return NextResponse.json({
			...optimization,
			generatedAt: new Date().toISOString(),
			agent: "Ares",
		});
	} catch (error) {
		console.error('[Ares Engine] Error:', error);
		return NextResponse.json(
			{ error: "Failed to generate optimization variant" },
			{ status: 500 }
		);
	}
}
