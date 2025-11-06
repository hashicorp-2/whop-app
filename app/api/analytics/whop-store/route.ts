import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@/lib/supabase-server';
import { checkTier } from '@/lib/tier-check';
import { getUserWhopCredentials } from '@/lib/database-service';

/**
 * Agency Tier Analytics Endpoint
 * Fetches Whop store sales data for Agency tier users
 */
export async function GET(req: NextRequest) {
	try {
		const supabase = await createClient();
		const { data: { user }, error: authError } = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Check if user is on Agency tier
		const tierCheck = await checkTier(user.id, 'agency');
		if (!tierCheck.allowed) {
			return NextResponse.json(
				{ 
					error: "UPGRADE_REQUIRED",
					message: "Analytics dashboard requires Agency tier. Upgrade to unlock store analytics.",
					requiredTier: "agency",
					currentTier: tierCheck.currentTier,
				},
				{ status: 403 }
			);
		}

		// Get user's Whop API credentials
		const credentials = await getUserWhopCredentials(user.id);
		if (!credentials.whopApiKey || !credentials.whopStoreId) {
			return NextResponse.json(
				{ error: "Whop credentials not configured. Please add your API key in settings." },
				{ status: 400 }
			);
		}

		// Fetch analytics from Whop API
		// Note: Adjust API endpoint based on Whop's actual analytics API
		const analyticsResponse = await fetch(`https://api.whop.com/api/v2/stores/${credentials.whopStoreId}/analytics`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${credentials.whopApiKey}`,
				'Content-Type': 'application/json',
			},
		});

		if (!analyticsResponse.ok) {
			const errorText = await analyticsResponse.text();
			console.error('[Analytics] Whop API error:', errorText);
			return NextResponse.json(
				{ error: "Failed to fetch analytics from Whop" },
				{ status: 500 }
			);
		}

		const analyticsData = await analyticsResponse.json();

		return NextResponse.json({
			storeId: credentials.whopStoreId,
			analytics: analyticsData,
			generatedAt: new Date().toISOString(),
		});
	} catch (error) {
		console.error("[Analytics] Error:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Failed to fetch analytics" },
			{ status: 500 }
		);
	}
}
