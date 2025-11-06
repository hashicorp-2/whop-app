import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/compile-blueprint
 * HERMES AGENT: Execution Agent
 * Compiles a complete, deployable Launch Blueprint for Whop
 */
export async function POST(req: NextRequest) {
	try {
		const { selectedConcept, selectedAngle, trendSummary, goal, trendAnalysis } = await req.json();

		if (!selectedConcept || !selectedAngle) {
			return NextResponse.json(
				{ error: "selectedConcept and selectedAngle are required" },
				{ status: 400 }
			);
		}

		console.log(`[Hermes Agent] Compiling Launch Blueprint for: ${selectedConcept.productName}`);

		// Extract superiorityVector from trendAnalysis if available
		const superiorityVector = trendAnalysis?.superiorityVector || "High-value, comprehensive solution";

		const hermesPrompt = `**TASK: Compile a complete, deployable Launch Blueprint for Whop.**

**Persona:** You are "Hermes," the Execution Agent. Your task is to take the raw, strategic output from Athena and format it into a flawless, deployable asset package. Precision and adherence to Whop's best practices are paramount.

**Input Variables:**
1.  SELECTED_CONCEPT: ${JSON.stringify(selectedConcept, null, 2)}
2.  SELECTED_ANGLE: ${JSON.stringify(selectedAngle, null, 2)}
3.  USER_GOAL: ${goal || "Not specified"}
4.  TREND_SUMMARY: ${JSON.stringify(trendSummary || {}, null, 2)}
5.  SUPERIORITY_VECTOR: ${superiorityVector}

**STEP 1: Whop Product Page Optimization**
1.  **Long-Form Description:** Expand the productDescription from the SELECTED_CONCEPT into a **5-paragraph, high-conversion Whop product page description**.
    *   Paragraph 1: The Hook (Use the SELECTED_ANGLE's hook).
    *   Paragraph 2: The Problem (Agitate the pain point related to the TREND_SUMMARY).
    *   Paragraph 3: The Solution (Introduce the product, highlighting the Superiority Vector).
    *   Paragraph 4: The Proof (Detail the 5-point coreCurriculumOutline / coreFeatureSet as bullet points).
    *   Paragraph 5: The Call to Action (A strong, urgent closing statement).
2.  **Pricing Strategy:** Suggest a **premium pricing tier** (e.g., $97, $197, $497) and justify it based on the product's high-value Superiority Vector.

**STEP 2: Community Asset Generation**
1.  **Welcome Post:** Draft a **Community Welcome Post** (for Discord/Telegram/Whop Community) that immediately engages new buyers. The tone should be high-energy and exclusive. It must include a clear **next step** (e.g., "Go to #start-here channel").
2.  **Launch Announcement:** Draft a **Whop Community Announcement** post using the SELECTED_ANGLE's headline and hook. This post should be designed to drive immediate sales from existing members.

**STEP 3: Technical Implementation Snippet**
1.  **API Payload:** Generate the exact JSON payload required to create the product via the Whop API, using the generated long-form description and product name. The payload should be a complete, valid Whop API request with all required fields.

**OUTPUT FORMAT:**
Return ONLY valid JSON with this exact structure (no additional fields):
{
  "whopProductPayload": {
    "productName": "...",
    "longDescription": "...",
    "suggestedPriceUSD": 97,
    "priceJustification": "..."
  },
  "marketingAssets": {
    "launchAnnouncementHeadline": "...",
    "launchAnnouncementBody": "...",
    "communityWelcomePost": "..."
  },
  "whopApiSnippet": {
    "endpoint": "/api/v1/products",
    "method": "POST",
    "payload": {
      // Complete JSON payload for Whop API product creation
      // Include all required fields: name, description, price, currency, type, etc.
    }
  }
}`;

		const result = await openai.chat.completions.create({
			model: "gpt-4-turbo-preview",
			messages: [{ role: "user", content: hermesPrompt }],
			max_tokens: 3000,
			temperature: 0.7,
			response_format: { type: "json_object" },
		});

		const blueprint = JSON.parse(result.choices[0].message.content || '{}');

		// Validate structure
		if (!blueprint.whopProductPayload || !blueprint.marketingAssets) {
			throw new Error("Invalid Launch Blueprint structure received from Hermes");
		}

		// Ensure suggestedPriceUSD is a number, not a string
		if (blueprint.whopProductPayload?.suggestedPriceUSD) {
			blueprint.whopProductPayload.suggestedPriceUSD = typeof blueprint.whopProductPayload.suggestedPriceUSD === 'string' 
				? parseInt(blueprint.whopProductPayload.suggestedPriceUSD.replace(/[^0-9]/g, '')) || 97
				: blueprint.whopProductPayload.suggestedPriceUSD;
		}

		return NextResponse.json({
			...blueprint,
			generatedAt: new Date().toISOString(),
			agent: "Hermes",
		});
	} catch (error) {
		console.error('[Hermes Agent] Error:', error);
		return NextResponse.json(
			{ error: "Failed to compile Launch Blueprint" },
			{ status: 500 }
		);
	}
}
