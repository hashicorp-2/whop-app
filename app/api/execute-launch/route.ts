import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@/lib/supabase-server';
import { getUserWhopCredentials, recordPublishedProduct } from '@/lib/database-service';
import { createWhopProduct, createWhopDraftPost } from '@/lib/whop-publish';

/**
 * Hermes Publishing Agent
 * Executes a Launchpad Mission by publishing to Whop
 */
export async function POST(req: NextRequest) {
	const ENABLE_AUTH = false;
	let userId: string | undefined;

	try {
		const body = await req.json();
		const { launchpadMission, whopApiKey, whopStoreId, whopCommunityId } = body;

		if (!launchpadMission) {
			return NextResponse.json(
				{ error: "Launchpad Mission is required" },
				{ status: 400 }
			);
		}

		// Get authenticated user
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
		} else {
			userId = 'local-test-user';
		}

		// Determine which API key to use
		let finalApiKey = whopApiKey;
		let finalStoreId = whopStoreId;
		let finalCommunityId = whopCommunityId;

		if (ENABLE_AUTH && !whopApiKey && userId) {
			// Try to get stored credentials
			const credentials = await getUserWhopCredentials(userId);
			finalApiKey = credentials.whopApiKey || '';
			finalStoreId = credentials.whopStoreId || '';
		}

		if (!finalApiKey || !finalStoreId) {
			return NextResponse.json(
				{ error: "Whop API credentials required. Please provide API key and Store ID." },
				{ status: 400 }
			);
		}

		const productBlueprint = launchpadMission.productBlueprint;
		const marketingArsenal = launchpadMission.marketingArsenal;
		const winningArsenal = launchpadMission.winningArsenal;

		// STEP 1: Create Whop Product
		console.log('[Hermes] Step 1: Creating Whop product...');
		const productResult = await createWhopProduct(
			finalApiKey,
			finalStoreId,
			{
				name: productBlueprint.productName || 'Untitled Product',
				description: productBlueprint.whopListing?.description || productBlueprint.productDescription || '',
				content: productBlueprint.productContent || '',
				price: 0, // User can edit in Whop dashboard
				tags: productBlueprint.whopListing?.tags || [],
			}
		);

		console.log('[Hermes] Product created:', productResult.productUrl);

		// STEP 2: Create Draft Community Post (if community ID provided)
		let postResult: { postId: string; postUrl: string } | null = null;
		
		if (finalCommunityId) {
			console.log('[Hermes] Step 2: Creating draft community post...');
			try {
				// Use winning arsenal if available (Pro tier), otherwise use original
				const tweetContent = winningArsenal?.tweet?.content || marketingArsenal?.tweet || '';
				const videoContent = winningArsenal?.videoScript?.content || marketingArsenal?.videoScript || '';

				const postContent = `🚀 **New Product Launch!**

${tweetContent}

**Video Script:**
${videoContent}

[View Product](${productResult.productUrl})`;

				postResult = await createWhopDraftPost(
					finalApiKey,
					finalCommunityId,
					{
						title: `New Launch: ${productBlueprint.productName}`,
						content: postContent,
					}
				);

				console.log('[Hermes] Draft post created:', postResult.postUrl);
			} catch (postError) {
				console.warn('[Hermes] Failed to create draft post (non-critical):', postError);
				// Continue even if post creation fails
			}
		}

		// STEP 3: Record publication
		if (ENABLE_AUTH && userId) {
						await recordPublishedProduct(
				userId,
				null,
				productBlueprint.productName,
				productResult.productId,
				productResult.productUrl,
				postResult?.postId || undefined,
				postResult?.postUrl || undefined
			);
		}

		console.log('[Hermes] Launch sequence complete! ✅');

		return NextResponse.json(
			{
				success: true,
				message: "Launchpad Mission executed successfully!",
				product: {
					id: productResult.productId,
					url: productResult.productUrl,
					name: productBlueprint.productName,
				},
				post: postResult ? {
					id: postResult.postId,
					url: postResult.postUrl,
				} : null,
			},
			{ status: 200 }
		);

	} catch (error) {
		console.error("[Hermes] Error executing launch:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Failed to execute launch" },
			{ status: 500 }
		);
	}
}
