import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

type UserGoal = "Build App" | "Create Content" | "Sell Knowledge" | "Run Agency";

/**
 * GET /api/user-goals
 * Get user's goals from profile
 */
export async function GET(req: NextRequest) {
	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Get user profile
		const { data: profile, error } = await supabase
			.from('profiles')
			.select('goals, primary_goal')
			.eq('id', user.id)
			.single();

		if (error && error.code !== 'PGRST116') { // Not found is OK
			console.error('Error fetching goals:', error);
			return NextResponse.json(
				{ error: "Failed to fetch goals" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			goals: profile?.goals || [],
			primaryGoal: profile?.primary_goal || null,
		});
	} catch (error) {
		console.error('Error in GET /api/user-goals:', error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

/**
 * POST /api/user-goals
 * Update user's goals
 */
export async function POST(req: NextRequest) {
	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { goals, primaryGoal } = await req.json();

		if (!goals || !Array.isArray(goals)) {
			return NextResponse.json(
				{ error: "Goals array is required" },
				{ status: 400 }
			);
		}

		// Validate goals
		const validGoals: UserGoal[] = ["Build App", "Create Content", "Sell Knowledge", "Run Agency"];
		const filteredGoals = goals.filter((g: string) => validGoals.includes(g as UserGoal));

		// Upsert profile
		const { error } = await supabase
			.from('profiles')
			.upsert({
				id: user.id,
				goals: filteredGoals,
				primary_goal: primaryGoal || filteredGoals[0] || null,
				updated_at: new Date().toISOString(),
			}, {
				onConflict: 'id',
			});

		if (error) {
			console.error('Error updating goals:', error);
			return NextResponse.json(
				{ error: "Failed to update goals" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			goals: filteredGoals,
			primaryGoal: primaryGoal || filteredGoals[0] || null,
		});
	} catch (error) {
		console.error('Error in POST /api/user-goals:', error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
