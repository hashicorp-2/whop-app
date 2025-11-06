"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LaunchpadButton } from "./brand/BrandKit";
import { SubscriptionTier, TIER_PRICING, TIER_LIMITS } from "@/lib/tier-check";

interface UpgradeModalProps {
	isOpen: boolean;
	onClose: () => void;
	currentTier: SubscriptionTier;
}

const TIER_FEATURES: Record<SubscriptionTier, string[]> = {
	trial: [
		"3 Blueprints",
		"7-day trial",
		"Basic features",
	],
	pro: [
		"Unlimited Blueprints",
		"Unlimited Campaigns",
		"5 Media Generations/month",
		"Advanced Analytics",
	],
	agency: [
		"Everything in Pro",
		"Unlimited Media Generations",
		"Multi-client Workspace",
		"API Access",
		"White-label Branding",
	],
};

export function UpgradeModal({ isOpen, onClose, currentTier }: UpgradeModalProps) {
	const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	const handleUpgrade = async (tier: SubscriptionTier) => {
		if (tier === 'trial') return; // Can't upgrade to trial

		setIsProcessing(true);
		try {
			const response = await fetch('/api/whop-billing/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ tier }),
			});

			if (!response.ok) {
				throw new Error('Failed to create checkout');
			}

			const data = await response.json();
			
			// Redirect to checkout
			if (data.checkout_url) {
				window.location.href = data.checkout_url;
			}
		} catch (error) {
			console.error('Upgrade error:', error);
			alert('Failed to start upgrade process. Please try again.');
		} finally {
			setIsProcessing(false);
		}
	};

	const tiers: SubscriptionTier[] = ['trial', 'pro', 'agency'];
	const tierIndex = tiers.indexOf(currentTier);

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
					onClick={onClose}
				>
					<motion.div
						initial={{ scale: 0.95, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.95, opacity: 0 }}
						onClick={(e) => e.stopPropagation()}
						className="bg-obsidian border border-obsidian-100 rounded-launchpad max-w-4xl w-full max-h-[90vh] overflow-y-auto"
					>
						<div className="p-8">
							<div className="flex justify-between items-center mb-8">
								<h2 className="text-3xl font-bold text-white uppercase tracking-tight">
									Upgrade Plan
								</h2>
								<button
									onClick={onClose}
									className="text-white/60 hover:text-white transition-colors"
								>
									✕
								</button>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								{tiers.map((tier) => {
									const isCurrent = tier === currentTier;
									const isUpgrade = tierIndex < tiers.indexOf(tier);
									const limits = TIER_LIMITS[tier];
									const pricing = TIER_PRICING[tier];

									return (
										<motion.div
											key={tier}
											className={`relative rounded-launchpad border p-6 ${
												isCurrent
													? 'border-catalyst-mint bg-catalyst-mint/10'
													: isUpgrade
													? 'border-ion-blue hover:border-catalyst-mint transition-colors cursor-pointer'
													: 'border-obsidian-100'
											}`}
											onClick={() => isUpgrade && setSelectedTier(tier)}
										>
											{isCurrent && (
												<div className="absolute top-4 right-4">
													<span className="px-3 py-1 bg-catalyst-mint text-obsidian rounded-full text-xs font-bold uppercase tracking-tight">
										Current
									</span>
												</div>
											)}

											<h3 className="text-xl font-bold text-white uppercase tracking-tight mb-2">
												{tier === 'trial' ? 'Trial' : tier === 'pro' ? 'Pro' : 'Agency'}
											</h3>

											<div className="mb-4">
												<span className="text-3xl font-bold text-white">
													${pricing.monthly}
												</span>
												{pricing.monthly > 0 && (
													<span className="text-white/60 text-sm ml-1">/mo</span>
												)}
											</div>

											<ul className="space-y-2 mb-6">
												{TIER_FEATURES[tier].map((feature, index) => (
													<li key={index} className="text-white/70 text-sm flex items-start">
														<span className="text-catalyst-mint mr-2">✓</span>
														{feature}
													</li>
												))}
											</ul>

											{isUpgrade && (
												<LaunchpadButton
													variant={tier === 'agency' ? 'catalyst' : 'primary'}
													className="w-full"
													onClick={(e) => {
														e.stopPropagation();
														handleUpgrade(tier);
													}}
													disabled={isProcessing}
												>
													{isProcessing ? 'Processing...' : 'Upgrade'}
												</LaunchpadButton>
											)}

											{isCurrent && (
												<div className="text-center text-white/60 text-sm">
													Current Plan
												</div>
											)}
										</motion.div>
									);
								})}
							</div>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
