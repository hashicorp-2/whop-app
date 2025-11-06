import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@/lib/supabase-server';
import { getUserProfile } from '@/lib/database-service';

export async function GET(req: NextRequest) {
	// TEMPORARY: Skip auth for local testing
	const ENABLE_AUTH = false;
	
	try {
		let userId: string | undefined;

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
			userId = 'local-test-user'; // For local testing
		}

		const profile = await getUserProfile(userId);
		
		if (!profile) {
			return NextResponse.json(
				{ error: "Profile not found" },
				{ status: 404 }
			);
		}

		// Return launches_remaining as -1 for unlimited (pro/agency), or the actual count
		const launchesRemaining = profile.subscriptionTier === 'pro' || profile.subscriptionTier === 'agency'
			? -1 // -1 means unlimited
			: profile.launchesRemaining;

		return NextResponse.json({
			launchesRemaining,
			subscriptionTier: profile.subscriptionTier,
		});
	} catch (error) {
		console.error("[User Profile] Error:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Failed to fetch profile" },
			{ status: 500 }
		);
	}
}
