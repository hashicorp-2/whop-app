import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI Media Arsenal Engine
 * Generates 3 visual concepts + 1 motion clip from brief
 */

interface MediaOutput {
	images: {
		url: string;
		tag: string;
		concept: string;
	}[];
	video?: {
		url: string;
		tag: string;
	};
}

/**
 * Generate 3 visual concepts with OpenAI Images v3
 */
async function generateVisualConcepts(brief: string, brandColors?: string[]): Promise<any[]> {
	console.log('[Media Arsenal] Generating 3 visual concepts...');
	
	const concepts = [
		{
			tag: "hero",
			description: "Hero image - main product showcase with professional lighting",
			prompt: `Create a stunning hero image: ${brief}. Professional studio lighting, premium quality, ${brandColors ? `brand colors: ${brandColors.join(', ')}` : 'modern aesthetic'}, 1080x1080, high detail`,
		},
		{
			tag: "ad",
			description: "Advertisement image - marketing-focused with clear messaging space",
			prompt: `Create an advertisement image: ${brief}. Clean layout with space for text overlay, professional marketing aesthetic, ${brandColors ? `brand colors: ${brandColors.join(', ')}` : 'bold and eye-catching'}, 1080x1080`,
		},
		{
			tag: "social",
			description: "Social media image - optimized for engagement, vibrant and shareable",
			prompt: `Create a social media image: ${brief}. Vibrant, engaging, optimized for social platforms, ${brandColors ? `brand colors: ${brandColors.join(', ')}` : 'trendy and modern'}, 1080x1080, high contrast`,
		},
	];

	const imagePromises = concepts.map(async (concept) => {
		try {
			const response = await openai.images.generate({
				model: "dall-e-3",
				prompt: concept.prompt,
				size: "1024x1024",
				quality: "hd",
				n: 1,
			});

			if (!response.data?.[0]?.url) return null;
			return {
				url: response.data[0].url,
				tag: concept.tag,
				concept: concept.description,
			};
		} catch (error) {
			console.error(`[Media Arsenal] Error generating ${concept.tag} image:`, error);
			return null;
		}
	});

	const results = await Promise.all(imagePromises);
	return results.filter((r) => r !== null);
}

/**
 * Generate motion clip from 3 slides (using Replicate for video generation)
 * Note: ffmpeg-wasm would require client-side processing, so we'll use a service
 */
async function generateMotionClip(brief: string, images: any[]): Promise<any | null> {
	console.log('[Media Arsenal] Generating motion clip...');
	
	// For now, we'll create a video prompt for Replicate or similar service
	// In production, you'd use ffmpeg-wasm on the client or a video generation API
	try {
		// Using Replicate for video generation (alternative to ffmpeg-wasm)
		const Replicate = require('replicate');
		const replicate = new Replicate({
			auth: process.env.REPLICATE_API_TOKEN || '',
		});

		if (!process.env.REPLICATE_API_TOKEN) {
			console.warn('[Media Arsenal] Replicate API token not configured, skipping video generation');
			return null;
		}

		// Create a video prompt from the brief
		const videoPrompt = `Create a short 3-second motion clip: ${brief}. Professional, smooth transitions, brand-aligned colors`;

		// Use a video generation model (adjust model ID as needed)
		const output = await replicate.run(
			"anotherjesse/zeroscope-v2-xl:9f5c6b6a8c6b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5",
			{
				input: {
					prompt: videoPrompt,
					num_frames: 24,
					fps: 8,
				}
			}
		);

		return {
			url: Array.isArray(output) ? output[0] : output,
			tag: "promo",
		};
	} catch (error) {
		console.error('[Media Arsenal] Video generation error:', error);
		return null;
	}
}

export async function POST(req: NextRequest) {
	try {
		const { brief, brandColors, tags } = await req.json();

		if (!brief || !brief.trim()) {
			return NextResponse.json(
				{ error: "Brief is required" },
				{ status: 400 }
			);
		}

		console.log('[Media Arsenal] Starting generation...');

		// Generate 3 visual concepts
		const images = await generateVisualConcepts(brief.trim(), brandColors);

		if (images.length === 0) {
			return NextResponse.json(
				{ error: "Failed to generate images" },
				{ status: 500 }
			);
		}

		// Generate motion clip
		let video = null;
		try {
			video = await generateMotionClip(brief.trim(), images);
		} catch (videoError) {
			console.warn('[Media Arsenal] Video generation failed, continuing with images only:', videoError);
		}

		const output: MediaOutput = {
			images,
			video: video || undefined,
		};

		return NextResponse.json({
			success: true,
			media: output,
			brief: brief.trim(),
			generatedAt: new Date().toISOString(),
		});
	} catch (error) {
		console.error("[Media Arsenal] Error:", error);
		
		const errorMessage = error instanceof OpenAI.APIError 
			? "AI service temporarily unavailable" 
			: error instanceof Error
			? error.message
			: "Failed to generate media";
		
		return NextResponse.json(
			{ error: errorMessage },
			{ status: 500 }
		);
	}
}
