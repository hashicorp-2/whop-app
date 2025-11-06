import { Whop } from "@whop/sdk";

export const whopsdk = new Whop({
	appID: process.env.NEXT_PUBLIC_WHOP_APP_ID,
	apiKey: process.env.WHOP_API_KEY,
	webhookKey: btoa(process.env.WHOP_WEBHOOK_SECRET || ""),
});

/**
 * Get Whop user ID from email
 */
export async function getWhopUserFromEmail(email: string): Promise<string | null> {
	try {
		// Note: Whop API may not have a direct email lookup endpoint
		// This is a placeholder that assumes we can query by email
		// You may need to adjust based on actual Whop API documentation
		const response = await fetch(`https://api.whop.com/api/v2/users?email=${encodeURIComponent(email)}`, {
			headers: {
				'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			console.error('Failed to fetch Whop user:', response.statusText);
			return null;
		}

		const data = await response.json();
		// Adjust based on actual API response structure
		return data.id || null;
	} catch (error) {
		console.error('Error fetching Whop user:', error);
		return null;
	}
}

/**
 * Check if a Whop user has an active subscription
 */
export async function checkSubscription(whopUserId: string): Promise<{
	isSubscribed: boolean;
	expiresAt: Date | null;
}> {
	try {
		const response = await fetch(`https://api.whop.com/api/v2/users/${whopUserId}/memberships`, {
			headers: {
				'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			console.error('Failed to check subscription:', response.statusText);
			return { isSubscribed: false, expiresAt: null };
		}

		const data = await response.json();
		
		// Check if user has any active memberships
		const activeMemberships = data.data?.filter((membership: any) => {
			return membership.status === 'active';
		}) || [];

		if (activeMemberships.length === 0) {
			return { isSubscribed: false, expiresAt: null };
		}

		// Get the most recent membership
		const latestMembership = activeMemberships[0];
		const expiresAt = latestMembership.expires_at 
			? new Date(latestMembership.expires_at) 
			: null;

		return {
			isSubscribed: true,
			expiresAt,
		};
	} catch (error) {
		console.error('Error checking subscription:', error);
		return { isSubscribed: false, expiresAt: null };
	}
}
