import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import Replicate from "replicate";
import { createClient } from '@/lib/supabase-server';
import { recordGeneration, getUserStats, canUserLaunch, decrementLaunch, getUserProfile } from '@/lib/database-service';
import { checkTier } from '@/lib/tier-check';

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const replicate = new Replicate({
	auth: process.env.REPLICATE_API_TOKEN || '',
});

// Rate limiting: in-memory store
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 10;
const MONTHLY_LIMIT = 100;

function checkMinuteRateLimit(userId: string): { allowed: boolean; remaining: number } {
	const now = Date.now();
	const userLimit = rateLimitStore.get(userId);
	
	if (userLimit && now > userLimit.resetAt) {
		rateLimitStore.delete(userId);
	}
	
	const current = rateLimitStore.get(userId);
	
	if (!current) {
		rateLimitStore.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
		return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
	}
	
	if (current.count >= RATE_LIMIT_MAX) {
		return { allowed: false, remaining: 0 };
	}
	
	current.count++;
	rateLimitStore.set(userId, current);
	return { allowed: true, remaining: RATE_LIMIT_MAX - current.count };
}

/**
 * Ares Engine: Simulate battle with AI focus group
 */
async function simulateBattle(
	variations: { A: string; B: string; C: string },
	targetAudience: string,
	assetType: string
): Promise<{ winner: 'A' | 'B' | 'C'; winnerContent: string; scores: any; reasoning: string }> {
	console.log(`[Ares] Simulating battle for ${assetType}...`);
	
	const battlePrompt = `You are a focus group of 100 ${targetAudience}. Rate each marketing message from 1-10 on "Purchase Intent" and "Attention-Grabbing Power". Provide your #1 choice.

Variation A (The Hook):
${variations.A}

Variation B (The Benefit):
${variations.B}

Variation C (The Social Proof):
${variations.C}

Return ONLY valid JSON:
{
  "scores": {
    "A": { "purchaseIntent": 8, "attentionGrabbing": 9, "average": 8.5 },
    "B": { "purchaseIntent": 7, "attentionGrabbing": 6, "average": 6.5 },
    "C": { "purchaseIntent": 9, "attentionGrabbing": 8, "average": 8.5 }
  },
  "winner": "A",
  "reasoning": "Variation A scored highest because..."
}`;

	const battleResult = await openai.chat.completions.create({
		model: "gpt-4o",
		messages: [{ role: "user", content: battlePrompt }],
		max_tokens: 1000,
		temperature: 0.7,
		response_format: { type: "json_object" },
	});

	const battleData = JSON.parse(battleResult.choices[0].message.content || '{}');
	const winner = battleData.winner || 'A';
	const winnerContent = variations[winner as 'A' | 'B' | 'C'];
	
	console.log(`[Ares] Winner: Variation ${winner}`);
	return {
		winner: winner as 'A' | 'B' | 'C',
		winnerContent,
		scores: battleData.scores,
		reasoning: battleData.reasoning || `Variation ${winner} performed best.`,
	};
}

/**
 * Athena Core Engine: Multi-step agentic workflow
 * Returns a Launchpad Mission JSON object
 */
async function executeAthenaWorkflow(niche: string, selectedTrend?: string, enableProFeatures: boolean = true): Promise<any> {
	console.log(`[Athena] Starting workflow for niche: ${niche}`);
	
	let winner: any;
	
	if (selectedTrend) {
		console.log(`[Athena] Using selected trend: ${selectedTrend}`);
		winner = {
			trendName: selectedTrend,
			whyItMatters: "User-selected trend",
			monetizationPotential: "High",
			competitionLevel: "Medium",
		};
	} else {
		// STEP 1: Trend Reconnaissance
		console.log('[Athena] Step 1: Trend reconnaissance...');
		const trendPrompt = `Analyze niche "${niche}". Identify 3 EMERGING trends for profitable digital products.
Return JSON with trends: [{"trendName": "Name", "whyItMatters": "Why now", "monetizationPotential": "High/Medium/Low", "competitionLevel": "Low/Medium/High"}]`;

		const trendAnalysis = await openai.chat.completions.create({
			model: "gpt-4-turbo-preview",
			messages: [{ role: "user", content: trendPrompt }],
			max_tokens: 1000,
			temperature: 0.8,
			response_format: { type: "json_object" },
		});

		const trendsData = JSON.parse(trendAnalysis.choices[0].message.content || '{}');
		const trends = trendsData.trends || [];
		console.log(`[Athena] Found ${trends.length} trends`);

		// STEP 2: Trend Selection
		console.log('[Athena] Step 2: Selecting best trend...');
		const selectionPrompt = `Select the BEST trend from: ${JSON.stringify(trends)}. 
Return JSON: {"selectedTrend": "Name", "reasoning": "Why"}`;

		const selectionResult = await openai.chat.completions.create({
			model: "gpt-4-turbo-preview",
			messages: [{ role: "user", content: selectionPrompt }],
			max_tokens: 500,
			temperature: 0.7,
			response_format: { type: "json_object" },
		});

		const selectedData = JSON.parse(selectionResult.choices[0].message.content || '{}');
		winner = trends.find((t: any) => t.trendName === selectedData.selectedTrend) || trends[0];
		console.log(`[Athena] Selected: ${winner.trendName}`);
	}

	// STEP 3: Mission Generation
	console.log('[Athena] Step 3: Generating Launchpad Mission...');
	const missionPrompt = `Create a Launchpad Mission for:
Trend: ${winner.trendName}
Niche: ${niche}
Why: ${winner.whyItMatters}

Return ONLY this JSON structure:
{
  "productBlueprint": {
    "productName": "Compelling name",
    "productDescription": "2-3 sentence description",
    "productContent": "# Product Title\\n\\nFull markdown content...",
    "whopListing": {
      "title": "Listing title",
      "description": "Bullet points\\n- Point 1\\n- Point 2",
      "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
    }
  },
  "marketingArsenal": {
    "tweet": "Viral tweet text",
    "videoScript": "30-sec script: hook, body, CTA",
    "blogPostOutline": "# Blog outline in markdown"
  },
  "visualIdentity": {
    "visualPrompt": "Detailed DALL-E prompt for hero image"
  }
}`;

	const missionResult = await openai.chat.completions.create({
		model: "gpt-4-turbo-preview",
		messages: [{ role: "user", content: missionPrompt }],
		max_tokens: 4000,
		temperature: 0.7,
		response_format: { type: "json_object" },
	});

	const mission = JSON.parse(missionResult.choices[0].message.content || '{}');
	console.log('[Athena] Mission generated');

	// STEP 4: Visual Asset Creation
	let heroImageURL = null;
	if (process.env.REPLICATE_API_TOKEN && mission.visualIdentity?.visualPrompt) {
		try {
			console.log('[Athena] Step 4: Generating hero image...');
			const output = await replicate.run(
				"stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
				{
					input: {
						prompt: mission.visualIdentity.visualPrompt,
						width: 1024,
						height: 1024,
					}
				}
			);
			heroImageURL = Array.isArray(output) ? output[0] : output;
			console.log('[Athena] Hero image generated');
		} catch (error) {
			console.error('[Athena] Image generation failed:', error);
		}
	}
	
	mission.visualIdentity = mission.visualIdentity || {};
	mission.visualIdentity.heroImageURL = heroImageURL;

	// STEP 5: Ares Battle-Testing (PRO TIER ONLY)
	let winningArsenal: any = null;
	
	if (enableProFeatures) {
		console.log('[Ares] Step 5: Battle-testing marketing assets...');
		
		// Generate 3 variations for tweet and videoScript
		const variationsPrompt = `Create 3 variations for each asset:
Product: ${mission.productBlueprint.productName}
Niche: ${niche}

For TWEET: A=Hook (bold/controversial), B=Benefit (direct/logical), C=Social Proof (story)
For VIDEO SCRIPT: A=Shocking stat, B=Problem-solution, C=Before/after story

Return JSON:
{
  "tweetVariations": {"A": "text", "B": "text", "C": "text"},
  "videoScriptVariations": {"A": "text", "B": "text", "C": "text"}
}`;

		const variationsResult = await openai.chat.completions.create({
			model: "gpt-4-turbo-preview",
			messages: [{ role: "user", content: variationsPrompt }],
			max_tokens: 2000,
			temperature: 0.9,
			response_format: { type: "json_object" },
		});

		const variations = JSON.parse(variationsResult.choices[0].message.content || '{}');
		
		// Battle test
		const targetAudience = `${niche} creators`;
		const tweetBattle = await simulateBattle(variations.tweetVariations, targetAudience, 'tweet');
		const videoBattle = await simulateBattle(variations.videoScriptVariations, targetAudience, 'video');

		winningArsenal = {
			tweet: {
				winner: tweetBattle.winner,
				content: tweetBattle.winnerContent,
				reasoning: tweetBattle.reasoning,
				scores: tweetBattle.scores,
				allVariations: variations.tweetVariations,
			},
			videoScript: {
				winner: videoBattle.winner,
				content: videoBattle.winnerContent,
				reasoning: videoBattle.reasoning,
				scores: videoBattle.scores,
				allVariations: variations.videoScriptVariations,
			},
		};
		console.log('[Ares] Battle complete');
	}

	// Return Launchpad Mission
	return {
		...mission,
		selectedTrend: winner?.trendName,
		winningArsenal,
	};
}

export async function POST(req: NextRequest) {
	const ENABLE_AUTH = false;
	let userId: string | undefined;
	let rateLimit = { allowed: true, remaining: 10 };
	
	try {
		const { niche, trend, selectedTrend } = await req.json();

		const input = niche?.trim() || trend?.trim();
		
		if (!input) {
			return NextResponse.json(
				{ error: "Niche or trend is required" },
				{ status: 400 }
			);
		}

		if (input.length > 200) {
			return NextResponse.json(
				{ error: "Input must be 200 characters or less" },
				{ status: 400 }
			);
		}

		if (ENABLE_AUTH) {
			const supabase = await createClient();
			const { data: { user }, error: authError } = await supabase.auth.getUser();

			if (authError || !user) {
				return NextResponse.json(
					{ error: "Unauthorized" },
					{ status: 401 }
				);
			}
			userId = user.id;

			const stats = await getUserStats(user.id);
			if (!stats) {
				return NextResponse.json(
					{ error: "Failed to fetch user data" },
					{ status: 500 }
				);
			}

			if (stats.subscription_status !== 'active') {
				return NextResponse.json(
					{ error: "Subscription required" },
					{ status: 403 }
				);
			}

			if (stats.monthly_generations >= MONTHLY_LIMIT) {
				return NextResponse.json(
					{ error: "Monthly limit reached" },
					{ status: 429 }
				);
			}

			rateLimit = checkMinuteRateLimit(user.id);
			if (!rateLimit.allowed) {
				return NextResponse.json(
					{ error: "Rate limit exceeded" },
					{ 
						status: 429,
						headers: { 'X-Rate-Limit-Remaining': '0' },
					}
				);
			}
		} else {
			userId = 'local-test-user';
		}

		// Check if user can launch
		if (ENABLE_AUTH && userId && userId !== 'local-test-user') {
			const canLaunch = await canUserLaunch(userId);
			if (!canLaunch) {
				return NextResponse.json(
					{ error: "TRIAL_EXPIRED", message: "Your free launch has been used. Upgrade to Pro for unlimited." },
					{ status: 403 }
				);
			}
		}

		// Check tier for Pro features
		let enableProFeatures = true;
		if (ENABLE_AUTH && userId && userId !== 'local-test-user') {
			const tierCheck = await checkTier(userId, 'pro');
			enableProFeatures = tierCheck.allowed;
		}

		// Execute Athena workflow
		const launchpadMission = await executeAthenaWorkflow(input, selectedTrend, enableProFeatures);

		// Decrement launch count
		if (ENABLE_AUTH && userId && userId !== 'local-test-user') {
			await decrementLaunch(userId);
			const profile = await getUserProfile(userId);
			if (profile) {
				launchpadMission.launchesRemaining = profile.launchesRemaining;
				launchpadMission.subscriptionTier = profile.subscriptionTier;
			}
		}

		if (ENABLE_AUTH && userId) {
			await recordGeneration(
				userId,
				launchpadMission.selectedTrend || input,
				launchpadMission.productBlueprint.productName,
				launchpadMission.productBlueprint.productDescription,
				'success'
			);
		}

		let updatedStats = null;
		if (ENABLE_AUTH && userId) {
			updatedStats = await getUserStats(userId);
		}

		return NextResponse.json(
			{
				...launchpadMission,
				stats: {
					totalGenerations: updatedStats?.total_generations || 0,
					monthlyGenerations: updatedStats?.monthly_generations || 0,
				},
			},
			{
				headers: {
					'X-Generation-Count': '100',
					'X-Rate-Limit-Remaining': rateLimit.remaining.toString(),
				},
			}
		);
	} catch (error) {
		console.error("[Athena] Error:", error);
		
		const errorMessage = error instanceof OpenAI.APIError 
			? "AI service unavailable" 
			: error instanceof Error
			? error.message
			: "Failed to generate mission";
		
		return NextResponse.json(
			{ error: errorMessage },
			{ status: 500 }
		);
	}
}
