import { createClient } from './supabase-server';
import { SubscriptionTier, TIER_LIMITS } from './tier-check';

export interface UsageCheckResult {
	allowed: boolean;
	reason?: 'tier_limit' | 'usage_limit' | 'trial_expired' | 'subscription_expired';
	message?: string;
	remaining?: number;
	limit?: number;
}

/**
 * Check if user can use a feature based on tier and usage
 */
export async function checkUsage(
	userId: string,
	featureType: 'blueprint' | 'campaign' | 'media' | 'launch'
): Promise<UsageCheckResult> {
	const supabase = await createClient();
	
	// Get user profile
	const { data: profile, error } = await supabase
		.from('profiles')
		.select('subscription_tier, blueprints_used, campaigns_used, media_generations, trial_expires_at, subscription_expires_at')
		.eq('id', userId)
		.single();

	if (error || !profile) {
		return {
			allowed: false,
			reason: 'tier_limit',
			message: 'Profile not found',
		};
	}

	const tier = profile.subscription_tier as SubscriptionTier;
	const limits = TIER_LIMITS[tier];

	// Check if trial/subscription expired
	if (tier === 'trial') {
		if (profile.trial_expires_at && new Date(profile.trial_expires_at) < new Date()) {
			return {
				allowed: false,
				reason: 'trial_expired',
				message: 'Trial period has expired. Upgrade to continue.',
			};
		}
	} else if (tier === 'pro' || tier === 'agency') {
		if (profile.subscription_expires_at && new Date(profile.subscription_expires_at) < new Date()) {
			return {
				allowed: false,
				reason: 'subscription_expired',
				message: 'Subscription has expired. Please renew.',
			};
		}
	}

	// Check feature-specific limits
	let currentUsage: number;
	let limit: number;

	switch (featureType) {
		case 'blueprint':
			currentUsage = profile.blueprints_used || 0;
			limit = limits.blueprints;
			break;
		case 'campaign':
			currentUsage = profile.campaigns_used || 0;
			limit = limits.campaigns;
			break;
		case 'media':
			currentUsage = profile.media_generations || 0;
			limit = limits.mediaGenerations;
			break;
		case 'launch':
			// Launch uses blueprint count
			currentUsage = profile.blueprints_used || 0;
			limit = limits.blueprints;
			break;
		default:
			return {
				allowed: false,
				reason: 'usage_limit',
				message: 'Unknown feature type',
			};
	}

	// -1 means unlimited
	if (limit === -1) {
		return {
			allowed: true,
			remaining: -1,
			limit: -1,
		};
	}

	// Check if usage limit exceeded
	if (currentUsage >= limit) {
		return {
			allowed: false,
			reason: 'usage_limit',
			message: `You've reached your ${limit} ${featureType} limit for ${tier} tier. Upgrade to continue.`,
			remaining: 0,
			limit,
		};
	}

	return {
		allowed: true,
		remaining: limit - currentUsage,
		limit,
	};
}

/**
 * Record usage of a feature
 */
export async function recordUsage(
	userId: string,
	featureType: 'blueprint' | 'campaign' | 'media' | 'launch'
): Promise<boolean> {
	const supabase = await createClient();

	// Increment usage count
	const fieldMap: Record<typeof featureType, string> = {
		blueprint: 'blueprints_used',
		campaign: 'campaigns_used',
		media: 'media_generations',
		launch: 'blueprints_used',
	};

	const field = fieldMap[featureType];

	const { error: updateError } = await supabase.rpc('increment_usage', {
		user_id: userId,
		field_name: field,
	});

	if (updateError) {
		// Fallback: direct update
		const { data: profile } = await supabase
			.from('profiles')
			.select(field)
			.eq('id', userId)
			.single();

		if (profile) {
			const currentValue = (profile as any)[field] || 0;
			await supabase
				.from('profiles')
				.update({ [field]: currentValue + 1 })
				.eq('id', userId);
		}
	}

	// Log usage
	await supabase.from('usage_logs').insert({
		user_id: userId,
		feature_type: featureType,
	});

	return true;
}
