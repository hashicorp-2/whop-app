import { createClient } from './supabase-server';

export interface GenerationRecord {
  id: string;
  user_id: string;
  trend: string;
  product_name: string;
  product_description?: string;
  created_at: string;
  status: 'success' | 'failed';
}

export interface UserStats {
  total_generations: number;
  monthly_generations: number;
  subscription_status: string;
  subscription_expires_at?: string;
}

/**
 * Record a product generation
 */
export async function recordGeneration(
  userId: string,
  trend: string,
  productName: string,
  productDescription?: string,
  status: 'success' | 'failed' = 'success'
): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    // Insert generation record
    const { error: genError } = await supabase
      .from('generations')
      .insert({
        user_id: userId,
        trend,
        product_name: productName,
        product_description: productDescription,
        status,
      });

    if (genError) {
      console.error('Error recording generation:', genError);
      return false;
    }

    // Increment generation counts (only for successful generations)
    if (status === 'success') {
      // Call the increment function via RPC
      const { error: incError } = await supabase.rpc('increment_user_generations', {
        user_uuid: userId,
        monthly_inc: 1,
        total_inc: 1,
      });

      if (incError) {
        console.error('Error incrementing generation counts:', incError);
      }
    }

    return true;
  } catch (error) {
    console.error('Error in recordGeneration:', error);
    return false;
  }
}

/**
 * Get generation history for a user
 */
export async function getGenerationHistory(
  userId: string,
  limit: number = 10
): Promise<GenerationRecord[]> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching generation history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getGenerationHistory:', error);
    return [];
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string): Promise<UserStats | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('total_generations, monthly_generations, subscription_status, subscription_expires_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }

    return {
      total_generations: data?.total_generations || 0,
      monthly_generations: data?.monthly_generations || 0,
      subscription_status: data?.subscription_status || 'expired',
      subscription_expires_at: data?.subscription_expires_at,
    };
  } catch (error) {
    console.error('Error in getUserStats:', error);
    return null;
  }
}

/**
 * Update user subscription status
 */
export async function updateSubscriptionStatus(
  userId: string,
  status: string,
  expiresAt?: Date
): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: status,
        subscription_expires_at: expiresAt?.toISOString() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating subscription status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateSubscriptionStatus:', error);
    return false;
  }
}

/**
 * Reset monthly generation count (run on first day of month)
 */
export async function resetMonthlyGenerations(): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('users')
      .update({
        monthly_generations: 0,
      });

    if (error) {
      console.error('Error resetting monthly generations:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in resetMonthlyGenerations:', error);
    return false;
  }
}

/**
 * Get user's Whop API key and store ID
 */
export async function getUserWhopCredentials(userId: string): Promise<{
	whopApiKey: string | null;
	whopStoreId: string | null;
}> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from('users')
		.select('whop_api_key_encrypted, whop_store_id')
		.eq('id', userId)
		.single();

	if (error || !data) {
		return { whopApiKey: null, whopStoreId: null };
	}

	// Note: In production, decrypt the API key here
	return {
		whopApiKey: data.whop_api_key_encrypted, // For now, store as-is (should encrypt)
		whopStoreId: data.whop_store_id,
	};
}

/**
 * Store user's Whop API key and store ID
 */
export async function storeWhopCredentials(
	userId: string,
	whopApiKey: string,
	whopStoreId?: string
): Promise<boolean> {
	const supabase = await createClient();
	
	// Note: In production, encrypt the API key before storing
	const updateData: any = {
		whop_api_key_encrypted: whopApiKey, // Should be encrypted
	};

	if (whopStoreId) {
		updateData.whop_store_id = whopStoreId;
	}

	const { error } = await supabase
		.from('users')
		.update(updateData)
		.eq('id', userId);

	if (error) {
		console.error('Error storing Whop credentials:', error);
		return false;
	}

	return true;
}

/**
 * Record a published product
 */
export async function recordPublishedProduct(
	userId: string,
	generationId: string | null,
	productName: string,
	whopProductId: string,
	whopProductUrl: string,
	whopDraftPostId?: string,
	whopDraftPostUrl?: string
): Promise<boolean> {
	const supabase = await createClient();
	
	const { error } = await supabase
		.from('published_products')
		.insert({
			user_id: userId,
			generation_id: generationId,
			whop_product_id: whopProductId,
			whop_product_url: whopProductUrl,
			whop_draft_post_id: whopDraftPostId,
			whop_draft_post_url: whopDraftPostUrl,
			product_name: productName,
			status: 'published',
		});

	if (error) {
		console.error('Error recording published product:', error);
		return false;
	}

	return true;
}

/**
 * Get user profile with launches remaining
 */
export async function getUserProfile(userId: string): Promise<{
	launchesRemaining: number;
	subscriptionTier: 'trial' | 'pro' | 'agency';
} | null> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from('profiles')
		.select('launches_remaining, subscription_tier')
		.eq('id', userId)
		.single();

	if (error || !data) {
		// If profile doesn't exist, create it with default free tier
		if (error?.code === 'PGRST116') {
			const { data: newProfile, error: createError } = await supabase
				.from('profiles')
				.insert({
					id: userId,
					launches_remaining: 1,
					subscription_tier: 'trial',
				})
				.select('launches_remaining, subscription_tier')
				.single();

			if (createError || !newProfile) {
				console.error('Error creating profile:', createError);
				return null;
			}

			return {
				launchesRemaining: newProfile.launches_remaining || 1,
				subscriptionTier: (newProfile.subscription_tier || 'trial') as 'trial' | 'pro' | 'agency',
			};
		}
		return null;
	}

	return {
		launchesRemaining: data.launches_remaining || 0,
		subscriptionTier: (data.subscription_tier || 'trial') as 'trial' | 'pro' | 'agency',
	};
}

/**
 * Check if user can launch (has launches remaining or is on pro/agency tier)
 */
export async function canUserLaunch(userId: string): Promise<boolean> {
	const profile = await getUserProfile(userId);
	if (!profile) return false;

	// Pro and Agency tiers have unlimited launches
	if (profile.subscriptionTier === 'pro' || profile.subscriptionTier === 'agency') {
		return true;
	}

	// Free tier: check launches_remaining
	return profile.launchesRemaining > 0;
}

/**
 * Decrement launches remaining (only for free tier)
 */
export async function decrementLaunch(userId: string): Promise<boolean> {
	const supabase = await createClient();

	// Get current profile
	const profile = await getUserProfile(userId);
	if (!profile) return false;

	// Don't decrement for pro/agency tiers
	if (profile.subscriptionTier === 'pro' || profile.subscriptionTier === 'agency') {
		return true;
	}

	// Decrement for free tier
	const { error } = await supabase
		.from('profiles')
		.update({
			launches_remaining: Math.max(0, profile.launchesRemaining - 1),
			updated_at: new Date().toISOString(),
		})
		.eq('id', userId);

	if (error) {
		console.error('Error decrementing launch:', error);
		return false;
	}

	return true;
}

/**
 * Update user subscription tier
 */
export async function updateSubscriptionTier(
	userId: string,
	tier: 'trial' | 'pro' | 'agency'
): Promise<boolean> {
	const supabase = await createClient();

	const updates: any = {
		subscription_tier: tier,
		updated_at: new Date().toISOString(),
	};

	// Pro and Agency tiers get unlimited launches (set to -1 to indicate unlimited)
	if (tier === 'pro' || tier === 'agency') {
		updates.launches_remaining = -1; // -1 means unlimited
	}

	const { error } = await supabase
		.from('profiles')
		.update(updates)
		.eq('id', userId);

	if (error) {
		console.error('Error updating subscription tier:', error);
		return false;
	}

	return true;
}
