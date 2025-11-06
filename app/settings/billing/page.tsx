"use client";

import { useEffect, useState } from "react";
import { useAuth, useUserProfile } from "@/lib/supabase-client";
import { Button } from "@whop/react/components";
import { motion } from "framer-motion";
import Link from "next/link";

export default function BillingPage() {
	const { user, loading: authLoading } = useAuth();
	const { profile, loading: profileLoading } = useUserProfile();
	const [stripePortalUrl, setStripePortalUrl] = useState<string | null>(null);
	const [loadingPortal, setLoadingPortal] = useState(false);

	// Stripe price IDs - update with your actual Stripe price IDs
	const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro_monthly';
	const agencyPriceId = process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID || 'price_agency_monthly';
	const stripeCheckoutUrl = process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL || 'https://buy.stripe.com/your-checkout-link';

	const createPortalSession = async () => {
		if (!user?.email) return;

		setLoadingPortal(true);
		try {
			const response = await fetch('/api/stripe/create-portal-session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: user.email }),
			});

			const data = await response.json();
			if (data.url) {
				window.location.href = data.url;
			}
		} catch (error) {
			console.error('Error creating portal session:', error);
		} finally {
			setLoadingPortal(false);
		}
	};

	if (authLoading || profileLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
					<p className="text-xl text-gray-700">Loading...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
				<div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h2>
					<Link href="/login">
						<Button variant="classic">Sign In</Button>
					</Link>
				</div>
			</div>
		);
	}

	const currentTier = profile?.subscriptionTier || 'free';
	const tierNames: Record<string, string> = {
		free: 'The Spark (Free)',
		pro: 'The Forge (Pro)',
		agency: 'The Armory (Agency)',
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
			<div className="max-w-4xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white rounded-2xl shadow-xl p-8 mb-8"
				>
					<h1 className="text-3xl font-bold text-gray-900 mb-6">Billing & Subscription</h1>

					{/* Current Plan */}
					<div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
						<h2 className="text-xl font-bold text-gray-900 mb-2">Current Plan</h2>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-2xl font-bold text-blue-600">{tierNames[currentTier]}</p>
								<p className="text-sm text-gray-600 mt-1">
									{currentTier === 'free' 
										? '1 free launch included'
										: currentTier === 'pro'
										? 'Unlimited launches + A/B testing'
										: 'Unlimited launches + Team access + Analytics'}
								</p>
							</div>
							{currentTier !== 'free' && (
								<Button
									variant="ghost"
									onClick={createPortalSession}
									disabled={loadingPortal}
								>
									{loadingPortal ? 'Loading...' : 'Manage Subscription'}
								</Button>
							)}
						</div>
					</div>

					{/* Upgrade Options */}
					{currentTier === 'free' && (
						<div className="space-y-6">
							<h2 className="text-xl font-bold text-gray-900 mb-4">Upgrade Your Plan</h2>

							{/* Pro Tier */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.1 }}
								className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white"
							>
								<div className="flex justify-between items-start mb-4">
									<div>
										<h3 className="text-2xl font-bold mb-2">The Forge (Pro)</h3>
										<p className="text-3xl font-bold mb-1">$29<span className="text-lg">/month</span></p>
									</div>
									<span className="bg-yellow-400 text-blue-900 px-3 py-1 rounded-full text-sm font-bold">
										RECOMMENDED
									</span>
								</div>
								<ul className="space-y-2 mb-6 text-blue-100">
									<li>✓ Unlimited Pro Launches</li>
									<li>✓ Full Ares A/B Testing</li>
									<li>✓ Oracle Predictive Scores</li>
									<li>✓ Hermes Publishing</li>
									<li>✓ Priority Support</li>
								</ul>
								<Button
									variant="classic"
									onClick={() => window.open(`${stripeCheckoutUrl}?price=${proPriceId}`, '_blank')}
									className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold"
								>
									Upgrade to Pro →
								</Button>
							</motion.div>

							{/* Agency Tier */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.2 }}
								className="p-6 bg-white rounded-xl border-2 border-gray-200"
							>
								<div className="flex justify-between items-start mb-4">
									<div>
										<h3 className="text-2xl font-bold text-gray-900 mb-2">The Armory (Agency)</h3>
										<p className="text-3xl font-bold text-gray-900 mb-1">$99<span className="text-lg text-gray-600">/month</span></p>
									</div>
								</div>
								<ul className="space-y-2 mb-6 text-gray-700">
									<li>✓ Everything in Pro</li>
									<li>✓ Team Access (5 seats)</li>
									<li>✓ Whop Store Analytics</li>
									<li>✓ Revenue Tracking</li>
									<li>✓ Dedicated Support</li>
								</ul>
								<Button
									variant="classic"
									onClick={() => window.open(`${stripeCheckoutUrl}?price=${agencyPriceId}`, '_blank')}
									className="w-full"
								>
									Upgrade to Agency →
								</Button>
							</motion.div>
						</div>
					)}
				</motion.div>
			</div>
		</div>
	);
}
