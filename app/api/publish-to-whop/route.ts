import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@/lib/supabase-server';
import { getUserWhopCredentials, recordPublishedProduct } from '@/lib/database-service';
import { createWhopProduct, createWhopDraftPost } from '@/lib/whop-publish';

export async function POST(req: NextRequest) {
	const ENABLE_AUTH = false;
	let userId: string | undefined;

	try {
		const body = await req.json();
		const { launchKit, whopApiKey, whopStoreId, whopCommunityId } = body;

		if (!launchKit) {
			return NextResponse.json(
				{ error: "Launch kit is required" },
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

			const credentials = await getUserWhopCredentials(user.id);
			const apiKey = whopApiKey || credentials.whopApiKey;
			const storeId = whopStoreId || credentials.whopStoreId;

			if (!apiKey || !storeId) {
				return NextResponse.json(
					{ 
						error: "Whop API key and Store ID required",
						needsCredentials: true 
					},
					{ status: 400 }
				);
			}

			const productResult = await createWhopProduct(apiKey, storeId, {
				name: launchKit.productName || launchKit.whopListing?.title || 'Untitled Product',
				description: launchKit.whopListing?.description || launchKit.productDescription || '',
				content: launchKit.productContent || '',
				tags: launchKit.whopListing?.tags || [],
			});

			let postResult = null;
			if (whopCommunityId && launchKit.marketingAssets) {
				try {
					postResult = await createWhopDraftPost(
						apiKey,
						whopCommunityId,
						{
							title: `New Product Launch: ${launchKit.productName}`,
							content: `🎉 **New Product Launch!**\n\n${launchKit.marketingAssets.tweet}\n\n**Video Script:**\n${launchKit.marketingAssets.videoScript}\n\n[View Product](${productResult.productUrl})`,
						}
					);
				} catch (postError) {
					console.warn('[Hermes] Failed to create draft post (non-critical):', postError);
				}
			}

			await recordPublishedProduct(
				user.id,
				null,
				launchKit.productName,
				productResult.productId,
				productResult.productUrl,
				postResult?.postId,
				postResult?.postUrl
			);

			return NextResponse.json({
				success: true,
				message: "Product published to Whop successfully!",
				product: {
					id: productResult.productId,
					url: productResult.productUrl,
					name: launchKit.productName,
				},
				post: postResult ? {
					id: postResult.postId,
					url: postResult.postUrl,
				} : null,
			});
		} else {
			if (!whopApiKey || !whopStoreId) {
				return NextResponse.json(
					{ 
						error: "For local testing, please provide whopApiKey and whopStoreId in the request",
						needsCredentials: true 
					},
					{ status: 400 }
				);
			}

			userId = 'local-test-user';

			const productResult = await createWhopProduct(
				whopApiKey,
				whopStoreId,
				{
					name: launchKit.productName || launchKit.whopListing?.title || 'Untitled Product',
					description: launchKit.whopListing?.description || launchKit.productDescription || '',
					content: launchKit.productContent || '',
					tags: launchKit.whopListing?.tags || [],
				}
			);

			let postResult = null;
			if (whopCommunityId && launchKit.marketingAssets) {
				try {
					postResult = await createWhopDraftPost(
						whopApiKey,
						whopCommunityId,
						{
							title: `New Product Launch: ${launchKit.productName}`,
							content: `🎉 **New Product Launch!**\n\n${launchKit.marketingAssets.tweet}\n\n**Video Script:**\n${launchKit.marketingAssets.videoScript}\n\n[View Product](${productResult.productUrl})`,
						}
					);
				} catch (postError) {
					console.warn('[Hermes] Failed to create draft post (non-critical):', postError);
				}
			}

			return NextResponse.json({
				success: true,
				message: "Product published to Whop successfully!",
				product: {
					id: productResult.productId,
					url: productResult.productUrl,
					name: launchKit.productName,
				},
				post: postResult ? {
					id: postResult.postId,
					url: postResult.postUrl,
				} : null,
			});
		}
	} catch (error) {
		console.error("[Hermes] Error publishing to Whop:", error);
		
		const errorMessage = error instanceof Error
			? error.message
			: "Failed to publish product to Whop";
		
		return NextResponse.json(
			{ error: errorMessage },
			{ status: 500 }
		);
	}
}
