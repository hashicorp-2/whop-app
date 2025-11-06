import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/generate-assets
 * HEPHAESTUS FORGE: Asset Forge
 * Generates 3 hyper-optimized image prompts for visual assets
 */
export async function POST(req: NextRequest) {
	try {
		const { productName, productDescription, marketingAngle, coreCurriculumOutline } = await req.json();

		if (!productName || !productDescription || !marketingAngle) {
			return NextResponse.json(
				{ error: "productName, productDescription, and marketingAngle are required" },
				{ status: 400 }
			);
		}

		console.log(`[Hephaestus Forge] Generating image prompts for: ${productName}`);

		// Extract angle type if marketingAngle is an object
		const angleType = typeof marketingAngle === 'object' && marketingAngle?.angleType 
			? marketingAngle.angleType 
			: (typeof marketingAngle === 'string' ? marketingAngle : 'Authority');

		const hephaestusPrompt = `**TASK: Generate a set of 3 hyper-optimized image prompts for a high-conversion Whop product launch.**

**Persona:** You are "Hephaestus," the Master Forger. Your task is to take the finalized product and marketing blueprint and generate all necessary, high-quality visual assets. Your output must be optimized for Whop's platform and designed for maximum conversion.

**Input Variables:**
1.  PRODUCT_NAME: ${productName}
2.  PRODUCT_DESCRIPTION: ${productDescription}
3.  MARKETING_ANGLE: ${angleType} (${typeof marketingAngle === 'object' ? JSON.stringify(marketingAngle, null, 2) : marketingAngle})
4.  CORE_CURRICULUM_OUTLINE: ${JSON.stringify(coreCurriculumOutline || [], null, 2)}

**Constraint:** Your output **MUST** be a structured JSON object containing a set of highly specific, optimized image prompts for the AI Image API (e.g., DALL-E 3, Midjourney, Stable Diffusion).

**STEP 1: Deconstruct & Define Visual Identity**
1.  **Analyze PRODUCT_NAME and PRODUCT_DESCRIPTION:** Determine the core visual metaphor (e.g., "rocket launch," "blueprint," "treasure map," "digital brain").
2.  **Define Style & Mood:** Based on the MARKETING_ANGLE, define the required visual mood:
    *   **Urgency:** High contrast, dynamic motion, bold colors (red/yellow accents).
    *   **Authority:** Minimalist, dark mode, sharp lines, blue/white/gold accents, focus on a single, powerful object.
    *   **Social Proof:** Warm lighting, diverse people, subtle technology integration, focus on community and results.

**STEP 2: Generate Optimized Image Prompts**
Generate three distinct, high-fidelity image prompts. Each prompt must be a single, detailed string ready for direct input into a modern AI Image API.

1.  **Prompt 1: The Whop Product Thumbnail (Aspect Ratio 1:1)**
    *   **Goal:** Maximize click-through rate (CTR) on the Whop marketplace.
    *   **Content:** A visually striking, abstract representation of the core visual metaphor, incorporating the product's name as a subtle, futuristic UI element. **MUST** be clean and legible at small sizes.
    *   **Style:** [Style & Mood from Step 1], 3D render, volumetric lighting, hyper-detailed, no text overlay (except for subtle UI elements).

2.  **Prompt 2: The Sales Page Hero Image (Aspect Ratio 16:9)**
    *   **Goal:** Establish trust and communicate the product's value proposition immediately.
    *   **Content:** A scene depicting the **result** of using the product (e.g., a person calmly viewing a complex, successful dashboard, or a stack of money next to a laptop). The scene must subtly integrate the CORE_CURRICULUM_OUTLINE as holographic projections or data streams.
    *   **Style:** [Style & Mood from Step 1], cinematic lighting, depth of field, photorealistic, high-end commercial photography style.

3.  **Prompt 3: The Social Media Ad Creative (Aspect Ratio 4:5)**
    *   **Goal:** Stop the scroll and drive traffic from platforms like Instagram/Facebook.
    *   **Content:** A close-up, emotionally resonant image that captures the **core psychological driver** of the trend (e.g., a person's relieved face, a hand reaching for a glowing object). The image must be highly engaging and slightly mysterious.
    *   **Style:** [Style & Mood from Step 1], vibrant colors, shallow depth of field, portrait orientation, designed for mobile feed scrolling.

**OUTPUT FORMAT:**
Return ONLY valid JSON with this exact structure:
{
  "visualMetaphor": "...",
  "styleMood": "...",
  "imagePrompts": {
    "productThumbnail_1x1": "...",
    "heroImage_16x9": "...",
    "socialAdCreative_4x5": "..."
  }
}`;

		const result = await openai.chat.completions.create({
			model: "gpt-4-turbo-preview",
			messages: [{ role: "user", content: hephaestusPrompt }],
			max_tokens: 2000,
			temperature: 0.8,
			response_format: { type: "json_object" },
		});

		const assetPrompts = JSON.parse(result.choices[0].message.content || '{}');

		// Validate structure - ensure all required fields are present
		if (!assetPrompts.imagePrompts || !assetPrompts.visualMetaphor || !assetPrompts.styleMood) {
			throw new Error("Invalid Asset Prompts structure received from Hephaestus");
		}

		// Validate all three image prompts are present
		if (!assetPrompts.imagePrompts.productThumbnail_1x1 || 
			!assetPrompts.imagePrompts.heroImage_16x9 || 
			!assetPrompts.imagePrompts.socialAdCreative_4x5) {
			throw new Error("Missing required image prompts in Hephaestus output");
		}

		return NextResponse.json({
			...assetPrompts,
			generatedAt: new Date().toISOString(),
			agent: "Hephaestus",
		});
	} catch (error) {
		console.error('[Hephaestus Forge] Error:', error);
		return NextResponse.json(
			{ error: "Failed to generate asset prompts" },
			{ status: 500 }
		);
	}
}

