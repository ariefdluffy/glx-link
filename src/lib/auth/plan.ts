/**
 * Helper functions for checking user plan status
 */

/**
 * Check if user has active Pro plan
 */
export const isProActive = (plan: string | null, planExpiresAt: Date | null): boolean => {
	if (plan !== 'pro' || !planExpiresAt) return false;
	return new Date(planExpiresAt) > new Date();
};

/**
 * Check if user is Pro (regardless of expiry status)
 */
export const isPro = (plan: string | null): boolean => {
	return plan === 'pro';
};
