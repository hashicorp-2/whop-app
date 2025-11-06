import { getUserProfile } from './database-service';

export type SubscriptionTier = 'trial' | 'pro' | 'agency';

export interface TierCheckResult {
	allowed: boolean;
	currentTier: SubscriptionTier;
	requiredTier: SubscriptionTier;
	message?: string;
}

export interface TierLimits {
	blueprints: number; // -1 = unlimited
	campaigns: number; // -1 = unlimited
	mediaGenerations: number; // -1 = unlimited
	trialDays?: number;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
	trial: {
		blueprints: 3,
		campaigns: 0,
		mediaGenerations: 0,
		trialDays: 7,
	},
	pro: {
		blueprints: -1, // unlimited
		campaigns: -1, // unlimited
		mediaGenerations: 5, // 5 per month
	},
	agency: {
		blueprints: -1, // unlimited
		campaigns: -1, // unlimited
		mediaGenerations: -1, // unlimited
	},
};

export const TIER_PRICING: Record<SubscriptionTier, { monthly: number; name: string }> = {
	trial: { monthly: 0, name: 'Trial' },
	pro: { monthly: 19.99, name: 'Pro' },
	agency: { monthly: 79, name: 'Agency' },
};

/**
 * Check if user's tier meets the required tier level
 */
export async function checkTier(
	userId: string,
	requiredTier: SubscriptionTier
): Promise<TierCheckResult> {
	const profile = await getUserProfile(userId);
	
	if (!profile) {
		return {
			allowed: false,
			currentTier: 'trial',
			requiredTier,
			message: 'User profile not found',
		};
	}

	const tierHierarchy: SubscriptionTier[] = ['trial', 'pro', 'agency'];
	const currentTierIndex = tierHierarchy.indexOf(profile.subscriptionTier);
	const requiredTierIndex = tierHierarchy.indexOf(requiredTier);

	const allowed = currentTierIndex >= requiredTierIndex;

	return {
		allowed,
		currentTier: profile.subscriptionTier,
		requiredTier,
		message: allowed
			? undefined
			: `This feature requires ${requiredTier} tier. Your current tier: ${profile.subscriptionTier}.`,
	};
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
	const names: Record<SubscriptionTier, string> = {
		trial: 'Trial (7 Days)',
		pro: 'Pro ($19.99/mo)',
		agency: 'Agency ($79/mo)',
	};
	return names[tier];
}
