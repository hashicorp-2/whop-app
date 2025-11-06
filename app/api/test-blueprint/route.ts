import { NextRequest, NextResponse } from "next/server";

/**
 * TEST ENDPOINT - Returns hardcoded data to verify frontend works
 */
export async function GET() {
	// Return hardcoded test data matching the exact structure
	const testData = {
		product_blueprint: {
			product_title: "Test Product: AI Writing Mastery",
			core_concept: "A comprehensive guide to using AI writing assistants to create and sell digital products. This ebook teaches creators how to leverage AI tools to streamline content creation, improve quality, and maximize sales.",
			problem_solved: "Many creators struggle to produce high-quality content efficiently. They spend hours writing when AI could help them create better content in minutes. This guide solves that problem.",
			primary_audience: "Content creators, educators, and entrepreneurs looking to sell digital products",
			key_features: [
				"Step-by-step guide to selecting the right AI writing tool",
				"Strategies for integrating AI into your content workflow",
				"Case studies of successful creators using AI",
				"Templates and prompts you can use immediately",
				"Marketing strategies for AI-assisted content"
			],
			value_proposition: "Users will pay because this provides a clear, actionable path to 10x their content creation speed while maintaining quality.",
			business_model_pricing: "One-time purchase at $49.99. Premium tier at $99.99 includes bonus templates and community access.",
			recommended_format_or_stack: "PDF and ePub formats for maximum compatibility across devices",
			validation_angle: "Offer a free chapter on 'AI Prompt Engineering Basics' to gauge interest and build email list"
		},
		marketing_playbook: {
			tagline: "Transform Your Content Creation with AI - Write 10x Faster, Sell 10x More",
			core_hooks: [
				"Stop spending 10 hours writing when AI can do it in 10 minutes",
				"Join 5,000+ creators already using AI to scale their content",
				"The exact system that helped one creator make $50K in 30 days"
			],
			launch_channels: [
				"Twitter/X - Post about AI writing tools and tag relevant communities",
				"LinkedIn - Target professional content creators and educators",
				"Email list - Send to existing subscribers interested in productivity tools"
			],
			content_sequence_plan: {
				day_1: "Post: 'I used AI to write 10 blog posts in 1 hour. Here's how.'",
				day_2: "Post: 'The 5 AI writing tools every creator should know'",
				day_3: "Post: 'How I made $50K selling AI-assisted content (case study)'",
				day_4: "Post: 'The biggest mistake creators make with AI writing tools'",
				day_5: "Post: 'Free template: My exact AI prompt for writing sales pages'",
				day_6: "Post: 'Behind the scenes: How I use AI to write faster'",
				day_7: "Post: 'Launch day! Get 50% off for the first 100 buyers'"
			},
			email_sequence: [
				{
					subject: "Stop Writing the Hard Way",
					body: "AI can write 10x faster than you. Here's how to get started."
				},
				{
					subject: "The AI Writing System That Changed Everything",
					body: "See how one creator used this system to make $50K in 30 days."
				},
				{
					subject: "Last Chance: 50% Off Ends Tonight",
					body: "Don't miss out on transforming your content creation process."
				}
			],
			ad_copy_samples: [
				{
					headline: "Write 10x Faster with AI",
					cta: "Get Started Now"
				},
				{
					headline: "The AI Writing Guide Creators Love",
					cta: "Learn More"
				}
			],
			visual_asset_prompts: [
				"A modern workspace with a laptop showing AI writing interface, surrounded by glowing particles representing content creation",
				"Before and after comparison: messy handwritten notes vs. polished AI-generated content on a screen"
			],
			early_conversion_tactic: "First 100 buyers get 50% off + bonus templates worth $99",
			metrics_to_track: [
				"Email open rates",
				"Conversion rate from landing page",
				"Social media engagement (likes, shares, comments)",
				"Time to first purchase"
			]
		},
		export_metadata: {
			generated_at: new Date().toISOString(),
			trend_source: "Test Data",
			user_goal: "Test"
		}
	};

	return NextResponse.json(testData);
}

