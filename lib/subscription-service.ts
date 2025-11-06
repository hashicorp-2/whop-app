import { createClient } from './supabase-server';

interface SubscriptionStatus {
	isSubscribed: boolean;
	expiresAt: Date | null;
	updatedAt: Date;
}

/**
 * Get subscription status from Supabase
 */
export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null> {
	try {
		const supabase = await createClient();
		
		const { data, error } = await supabase
			.from('subscriptions')
			.select('*')
			.eq('user_id', userId)
			.single();

		if (error) {
			console.error('Error fetching subscription status:', error);
			return null;
		}

		if (!data) {
			return null;
		}

		return {
			isSubscribed: data.is_subscribed,
			expiresAt: data.expires_at ? new Date(data.expires_at) : null,
			updatedAt: new Date(data.updated_at),
		};
	} catch (error) {
		console.error('Error getting subscription status:', error);
		return null;
	}
}

/**
 * Update subscription status in Supabase
 */
export async function updateSubscriptionStatus(
	userId: string,
	isSubscribed: boolean,
	expiresAt?: Date
): Promise<boolean> {
	try {
		const supabase = await createClient();
		
		const { error } = await supabase
			.from('subscriptions')
			.upsert({
				user_id: userId,
				is_subscribed: isSubscribed,
				expires_at: expiresAt?.toISOString() || null,
				updated_at: new Date().toISOString(),
			});

		if (error) {
			console.error('Error updating subscription status:', error);
			return false;
		}

		return true;
	} catch (error) {
		console.error('Error updating subscription status:', error);
		return false;
	}
}
