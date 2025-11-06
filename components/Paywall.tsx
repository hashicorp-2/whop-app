"use client";

import { Button } from "@whop/react/components";
import Link from "next/link";

interface PaywallProps {
	whopListingUrl?: string;
}

export default function Paywall({ whopListingUrl = "https://whop.com/marketplace/your-app-url" }: PaywallProps) {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
			<div className="max-w-4xl mx-auto">
				{/* Main Paywall Card */}
				<div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
					{/* Header */}
					<div className="text-center mb-12">
						<div className="text-7xl mb-6">💰</div>
						<h1 className="text-5xl font-bold text-gray-900 mb-4">
							Unlock Launchpad
						</h1>
						<p className="text-2xl text-gray-700 mb-4">
							Stop missing trends. Launch new digital products on Whop in under 5 minutes.
						</p>
						<p className="text-lg text-gray-600">
							Join 100+ creators printing money with trending products
						</p>
					</div>

					{/* Pricing */}
					<div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-200 rounded-2xl p-8 mb-12 text-center">
						<div className="text-5xl font-bold text-indigo-900 mb-2">
							$19<span className="text-2xl text-gray-600 font-normal">/month</span>
						</div>
						<p className="text-lg text-gray-700 mb-4">
							Your unfair advantage in the Creator Economy
						</p>
						<div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full">
							<span className="text-2xl">🚀</span>
							<span className="text-sm font-semibold text-indigo-900">
								Cancel anytime. No hidden fees.
							</span>
						</div>
					</div>

					{/* Benefits Grid */}
					<div className="grid md:grid-cols-2 gap-6 mb-12">
						<div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl transition">
							<span className="text-3xl flex-shrink-0">✅</span>
							<div>
								<h3 className="font-bold text-gray-900 mb-1">Unlimited Generations</h3>
								<p className="text-gray-700 text-sm">
									Generate unlimited product kits from any trend
								</p>
							</div>
						</div>
						<div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl transition">
							<span className="text-3xl flex-shrink-0">⚡</span>
							<div>
								<h3 className="font-bold text-gray-900 mb-1">Instant Copy</h3>
								<p className="text-gray-700 text-sm">
									Whop-optimized listing copy ready to paste
								</p>
							</div>
						</div>
						<div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl transition">
							<span className="text-3xl flex-shrink-0">📦</span>
							<div>
								<h3 className="font-bold text-gray-900 mb-1">Ready to Sell</h3>
								<p className="text-gray-700 text-sm">
									Download products ready to list on Whop
								</p>
							</div>
						</div>
						<div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl transition">
							<span className="text-3xl flex-shrink-0">🔥</span>
							<div>
								<h3 className="font-bold text-gray-900 mb-1">Never Miss Trends</h3>
								<p className="text-gray-700 text-sm">
									Capitalize on trending topics in minutes
								</p>
							</div>
						</div>
					</div>

					{/* Why Subscribe Section */}
					<div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-12">
						<h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
							Why Subscribe?
						</h2>
						<div className="space-y-3">
							<div className="flex items-start gap-3">
								<span className="text-blue-600 font-bold">1.</span>
								<p className="text-gray-700">
									<strong>Save hours of research</strong> - Our AI analyzes trends and creates complete product frameworks instantly
								</p>
							</div>
							<div className="flex items-start gap-3">
								<span className="text-blue-600 font-bold">2.</span>
								<p className="text-gray-700">
									<strong>Beat your competition</strong> - Be first to market with trending products before they're saturated
								</p>
							</div>
							<div className="flex items-start gap-3">
								<span className="text-blue-600 font-bold">3.</span>
								<p className="text-gray-700">
									<strong>Scale your earnings</strong> - Launch multiple products per week instead of one per month
								</p>
							</div>
							<div className="flex items-start gap-3">
								<span className="text-blue-600 font-bold">4.</span>
								<p className="text-gray-700">
									<strong>Risk-free</strong> - Cancel anytime. Your $19 subscription pays for itself with one sale.
								</p>
							</div>
						</div>
					</div>

					{/* CTA */}
					<div className="space-y-4">
						<a href={whopListingUrl} target="_blank" rel="noopener noreferrer">
							<Button variant="classic" size="4" className="w-full text-lg py-6">
								Subscribe on Whop → $19/month
							</Button>
						</a>

						<div className="text-center">
							<Link
								href="/login"
								className="text-blue-600 hover:text-blue-800 font-medium text-sm"
							>
								Already subscribed? Sign in →
							</Link>
						</div>
					</div>

					{/* Trust Indicators */}
					<div className="mt-12 pt-8 border-t border-gray-200">
						<div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
							<div className="flex items-center gap-2">
								<span className="text-green-500 text-xl">🔒</span>
								<span>Secure Payment</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-blue-500 text-xl">↩️</span>
								<span>Instant Access</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-purple-500 text-xl">⚡</span>
								<span>Cancel Anytime</span>
							</div>
						</div>
					</div>
				</div>

				{/* Social Proof */}
				<div className="mt-8 text-center">
					<p className="text-gray-600 mb-2">Trusted by 100+ creators</p>
					<div className="flex justify-center gap-1">
						{Array.from({ length: 5 }).map((_, i) => (
							<span key={i} className="text-2xl">⭐</span>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
