import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Blueprint Supremacy Engine
 * Three-agent workflow: Strategist → CopyArchitect → Designer
 */

interface BlueprintOutput {
	positioning: {
		targetAudience: string;
		marketPosition: string;
		demandAnalysis: string;
		competitiveLandscape: string;
	};
	promise: {
		headline: string;
		subheadline: string;
		valueProposition: string;
		keyBenefits: string[];
	};
	pricing: {
		pricePoint: number;
		pricingStrategy: string;
		justification: string;
		packageOptions?: string[];
	};
	plan: {
		creativeBrief: string;
		designSpec: string;
		contentStrategy: string;
		launchSequence: string[];
	};
}

/**
 * Agent 1: Strategist - Positioning + Demand Analysis
 */
async function executeStrategist(rawIdea: string): Promise<any> {
	console.log('[Strategist] Analyzing positioning and demand...');
	
	const prompt = `You are a world-class market strategist. Analyze this raw idea: "${rawIdea}"

Perform comprehensive market analysis and return ONLY valid JSON:
{
  "targetAudience": "Detailed description of ideal customer",
  "marketPosition": "Where this product sits in the market",
  "demandAnalysis": "Current demand signals and market validation",
  "competitiveLandscape": "Key competitors and differentiation opportunities"
}`;

	const response = await openai.chat.completions.create({
		model: "gpt-4-turbo-preview",
		messages: [{ role: "user", content: prompt }],
		max_tokens: 1000,
		temperature: 0.7,
		response_format: { type: "json_object" },
	});

	return JSON.parse(response.choices[0].message.content || '{}');
}

/**
 * Agent 2: CopyArchitect - Headlines + Pricing
 */
async function executeCopyArchitect(rawIdea: string, positioning: any): Promise<any> {
	console.log('[CopyArchitect] Crafting headlines and pricing...');
	
	const prompt = `You are a world-class copywriter and pricing strategist. Based on this idea and positioning:

Idea: "${rawIdea}"
Target Audience: ${positioning.targetAudience}
Market Position: ${positioning.marketPosition}

Create compelling copy and pricing strategy. Return ONLY valid JSON:
{
  "headline": "Powerful, benefit-driven headline",
  "subheadline": "Supporting subheadline that expands on headline",
  "valueProposition": "Clear value proposition in 2-3 sentences",
  "keyBenefits": ["Benefit 1", "Benefit 2", "Benefit 3", "Benefit 4"],
  "pricePoint": 47,
  "pricingStrategy": "Strategy name (e.g., 'Value-Based', 'Competitive', 'Premium')",
  "justification": "Why this price point is optimal",
  "packageOptions": ["Basic option", "Premium option", "Enterprise option"]
}`;

	const response = await openai.chat.completions.create({
		model: "gpt-4-turbo-preview",
		messages: [{ role: "user", content: prompt }],
		max_tokens: 1500,
		temperature: 0.8,
		response_format: { type: "json_object" },
	});

	return JSON.parse(response.choices[0].message.content || '{}');
}

/**
 * Agent 3: Designer - Creative Brief Spec
 */
async function executeDesigner(rawIdea: string, positioning: any, promise: any): Promise<any> {
	console.log('[Designer] Creating creative brief...');
	
	const prompt = `You are a world-class creative director. Based on this complete blueprint:

Idea: "${rawIdea}"
Positioning: ${JSON.stringify(positioning)}
Promise: ${JSON.stringify(promise)}

Create a comprehensive creative brief. Return ONLY valid JSON:
{
  "creativeBrief": "Full creative brief with brand voice, visual direction, and messaging guidelines",
  "designSpec": "Detailed design specifications including color palette, typography, imagery style",
  "contentStrategy": "Content strategy for marketing and distribution",
  "launchSequence": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"]
}`;

	const response = await openai.chat.completions.create({
		model: "gpt-4-turbo-preview",
		messages: [{ role: "user", content: prompt }],
		max_tokens: 2000,
		temperature: 0.7,
		response_format: { type: "json_object" },
	});

	return JSON.parse(response.choices[0].message.content || '{}');
}

export async function POST(req: NextRequest) {
	try {
		const { rawIdea } = await req.json();

		if (!rawIdea || !rawIdea.trim()) {
			return NextResponse.json(
				{ error: "Raw idea is required" },
				{ status: 400 }
			);
		}

		console.log('[Blueprint Supremacy] Starting engine...');

		// Phase 1: Strategist
		const positioning = await executeStrategist(rawIdea.trim());
		console.log('[Blueprint Supremacy] Phase 1/3 complete - Strategist');

		// Phase 2: CopyArchitect
		const copyArchitectResult = await executeCopyArchitect(rawIdea.trim(), positioning);
		const { headline, subheadline, valueProposition, keyBenefits, pricePoint, pricingStrategy, justification, packageOptions } = copyArchitectResult;
		
		const promise = { headline, subheadline, valueProposition, keyBenefits };
		const pricing = { pricePoint, pricingStrategy, justification, packageOptions };
		
		console.log('[Blueprint Supremacy] Phase 2/3 complete - CopyArchitect');

		// Phase 3: Designer
		const plan = await executeDesigner(rawIdea.trim(), positioning, promise);
		console.log('[Blueprint Supremacy] Phase 3/3 complete - Designer');

		// Assemble complete blueprint
		const blueprint: BlueprintOutput = {
			positioning,
			promise,
			pricing,
			plan,
		};

		return NextResponse.json({
			success: true,
			blueprint,
			rawIdea: rawIdea.trim(),
			generatedAt: new Date().toISOString(),
		});
	} catch (error) {
		console.error("[Blueprint Supremacy] Error:", error);
		
		const errorMessage = error instanceof OpenAI.APIError 
			? "AI service temporarily unavailable" 
			: error instanceof Error
			? error.message
			: "Failed to generate blueprint";
		
		return NextResponse.json(
			{ error: errorMessage },
			{ status: 500 }
		);
	}
}
