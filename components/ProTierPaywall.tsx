"use client";

import { motion } from "framer-motion";
import { Button } from "@whop/react/components";

interface ProTierPaywallProps {
	onUpgrade?: () => void;
}

export default function ProTierPaywall({ onUpgrade }: ProTierPaywallProps) {
	// Stripe checkout URL - update with your actual Stripe checkout link
	const stripeCheckoutUrl = process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL || "https://buy.stripe.com/your-checkout-link";

	const handleUpgrade = () => {
		if (onUpgrade) {
			onUpgrade();
		} else {
			window.open(stripeCheckoutUrl, '_blank');
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.3 }}
			className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl shadow-2xl p-8 md:p-12"
		>
			<div className="text-center mb-8">
				<div className="text-7xl mb-4">🚀</div>
				<h2 className="text-4xl font-bold text-gray-900 mb-3">
					Your Free Launch Complete!
				</h2>
				<p className="text-xl text-gray-700 mb-2">
					You've experienced the magic. Now unlock unlimited potential.
				</p>
				<p className="text-sm text-gray-600">
					Join creators who are launching profitable products every week
				</p>
			</div>

			{/* Tier Comparison */}
			<div className="grid md:grid-cols-3 gap-6 mb-8">
				{/* Free Tier */}
				<div className="bg-white rounded-xl p-6 border-2 border-gray-200">
					<div className="text-center mb-4">
						<h3 className="text-xl font-bold text-gray-900 mb-2">The Spark</h3>
						<div className="text-3xl font-bold text-gray-900 mb-1">$0</div>
						<div className="text-sm text-gray-600">forever</div>
					</div>
					<ul className="space-y-2 text-sm text-gray-700 mb-6">
						<li className="flex items-start gap-2">
							<span className="text-green-500">✓</span>
							<span>1 Pro Launch</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-gray-400">✗</span>
							<span className="text-gray-500">Unlimited Launches</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-gray-400">✗</span>
							<span className="text-gray-500">A/B Testing</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-gray-400">✗</span>
							<span className="text-gray-500">Analytics Dashboard</span>
						</li>
					</ul>
					<div className="text-center">
						<span className="text-xs text-gray-500">Your current plan</span>
					</div>
				</div>

				{/* Pro Tier - Highlighted */}
				<div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-6 border-4 border-yellow-400 shadow-xl transform scale-105 relative">
					<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
						<span className="bg-yellow-400 text-blue-900 px-4 py-1 rounded-full text-sm font-bold">
							RECOMMENDED
						</span>
					</div>
					<div className="text-center mb-4 mt-4">
						<h3 className="text-xl font-bold text-white mb-2">The Forge</h3>
						<div className="text-3xl font-bold text-white mb-1">$29</div>
						<div className="text-sm text-blue-100">/month</div>
					</div>
					<ul className="space-y-2 text-sm text-white mb-6">
						<li className="flex items-start gap-2">
							<span className="text-yellow-300">✓</span>
							<span>Unlimited Pro Launches</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-yellow-300">✓</span>
							<span>Full Ares A/B Testing</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-yellow-300">✓</span>
							<span>Oracle Predictions</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-yellow-300">✓</span>
							<span>Hermes Publishing</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-yellow-300">✓</span>
							<span>Priority Support</span>
						</li>
					</ul>
					<Button
						variant="classic"
						size="4"
						onClick={handleUpgrade}
						className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold"
					>
						Upgrade to Pro →
					</Button>
				</div>

				{/* Agency Tier */}
				<div className="bg-white rounded-xl p-6 border-2 border-gray-200">
					<div className="text-center mb-4">
						<h3 className="text-xl font-bold text-gray-900 mb-2">The Armory</h3>
						<div className="text-3xl font-bold text-gray-900 mb-1">$99</div>
						<div className="text-sm text-gray-600">/month</div>
					</div>
					<ul className="space-y-2 text-sm text-gray-700 mb-6">
						<li className="flex items-start gap-2">
							<span className="text-green-500">✓</span>
							<span>Everything in Pro</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-green-500">✓</span>
							<span>Team Access (5 seats)</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-green-500">✓</span>
							<span>Whop Store Analytics</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-green-500">✓</span>
							<span>Revenue Tracking</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-green-500">✓</span>
							<span>Dedicated Support</span>
						</li>
					</ul>
					<Button
						variant="classic"
						size="3"
						onClick={() => window.open(stripeCheckoutUrl + '?plan=agency', '_blank')}
						className="w-full"
					>
						Upgrade to Agency →
					</Button>
				</div>
			</div>

			{/* Value Proposition */}
			<div className="bg-white rounded-xl p-6 mb-6">
				<h3 className="text-lg font-bold text-gray-900 mb-3">Why creators upgrade to Pro:</h3>
				<div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
					<div className="flex items-start gap-2">
						<span className="text-2xl">⚡</span>
						<div>
							<strong>Save 10+ hours per product</strong>
							<p className="text-gray-600">From trend to launch in 5 minutes</p>
						</div>
					</div>
					<div className="flex items-start gap-2">
						<span className="text-2xl">💰</span>
						<div>
							<strong>Launch multiple products</strong>
							<p className="text-gray-600">One successful product pays for a year</p>
						</div>
					</div>
					<div className="flex items-start gap-2">
						<span className="text-2xl">🎯</span>
						<div>
							<strong>Battle-tested assets</strong>
							<p className="text-gray-600">AI validates what works before you launch</p>
						</div>
					</div>
					<div className="flex items-start gap-2">
						<span className="text-2xl">🚀</span>
						<div>
							<strong>One-click publishing</strong>
							<p className="text-gray-600">From idea to Whop in minutes</p>
						</div>
					</div>
				</div>
			</div>

			{/* CTA */}
			<div className="text-center">
				<Button
					variant="classic"
					size="4"
					onClick={handleUpgrade}
					className="px-12 py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold"
				>
					🚀 Upgrade to Pro - $29/month →
				</Button>
				<p className="text-sm text-gray-600 mt-4">
					Cancel anytime. No hidden fees. 100% money-back guarantee.
				</p>
			</div>
		</motion.div>
	);
}
