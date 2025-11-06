import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

/**
 * POST /api/notifications
 * Create notification for user (e.g., new trend detected)
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

		const {
			type, // 'trend_match', 'blueprint_ready', 'campaign_deployed', etc.
			message,
			trendId,
			actionUrl,
		} = await req.json();

		if (!type || !message) {
			return NextResponse.json(
				{ error: "type and message are required" },
				{ status: 400 }
			);
		}

		// Store notification (could use a notifications table)
		// For now, return success
		console.log(`[Notifications] Created ${type} notification for ${user.id}`);

		const notification = {
			id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			userId: user.id,
			type,
			message,
			trendId: trendId || null,
			actionUrl: actionUrl || null,
			createdAt: new Date().toISOString(),
			read: false,
		};

		return NextResponse.json({
			success: true,
			notification,
		});
	} catch (error) {
		console.error('[Notifications] Error:', error);
		return NextResponse.json(
			{ error: "Failed to create notification" },
			{ status: 500 }
		);
	}
}

/**
 * GET /api/notifications
 * Get user notifications
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

		// In production, fetch from notifications table
		// For now, return empty array
		return NextResponse.json({
			notifications: [],
			count: 0,
		});
	} catch (error) {
		console.error('[Notifications] Error:', error);
		return NextResponse.json(
			{ error: "Failed to fetch notifications" },
			{ status: 500 }
		);
	}
}
