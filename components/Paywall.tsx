import { Button } from "@whop/react/components";

interface PaywallProps {
	whopListingUrl?: string;
}

export default function Paywall({ whopListingUrl = "#" }: PaywallProps) {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
			<div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-12 text-center">
				<div className="text-7xl mb-6">💰</div>
				<h1 className="text-4xl font-bold text-gray-900 mb-4">
					Unlock The Money Printer
				</h1>
				<p className="text-xl text-gray-700 mb-8">
					Stop missing trends. Launch new digital products on Whop in under 5 minutes.
				</p>
				
				<div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
					<div className="text-3xl font-bold text-blue-900 mb-2">
						$19<span className="text-lg text-gray-600">/month</span>
					</div>
					<p className="text-gray-700">
						Your unfair advantage in the Creator Economy
					</p>
				</div>

				<div className="space-y-4 mb-8 text-left">
					<div className="flex items-start gap-3">
						<span className="text-2xl">✅</span>
						<span className="text-gray-700">
							Generate unlimited product kits from any trend
						</span>
					</div>
					<div className="flex items-start gap-3">
						<span className="text-2xl">✅</span>
						<span className="text-gray-700">
							Instant Whop-optimized listing copy
						</span>
					</div>
					<div className="flex items-start gap-3">
						<span className="text-2xl">✅</span>
						<span className="text-gray-700">
							Download ready-to-sell products
						</span>
					</div>
					<div className="flex items-start gap-3">
						<span className="text-2xl">✅</span>
						<span className="text-gray-700">
							Never miss a profitable trend again
						</span>
					</div>
				</div>

				<a href={whopListingUrl} target="_blank" rel="noopener noreferrer">
					<Button variant="classic" size="4" className="w-full">
						Subscribe on Whop → $19/month
					</Button>
				</a>

				<p className="mt-6 text-sm text-gray-500">
					Cancel anytime. No hidden fees. Print money or get your money back.
				</p>
			</div>
		</div>
	);
}
