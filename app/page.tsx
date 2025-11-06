import { Button } from "@whop/react/components";
import Link from "next/link";

export default function Page() {
	return (
		<div className="py-12 px-4 sm:px-6 lg:px-8 min-h-screen bg-obsidian">
			<div className="max-w-2xl mx-auto rounded-3xl bg-obsidian-50 p-8 border border-obsidian-200">
				<div className="text-center mt-8 mb-12">
					<h1 className="text-5xl font-bold text-white mb-4">
						🚀 Launchpad
					</h1>
					<p className="text-xl text-gray-300 mb-2">
						Your Product Launchpad — from Idea to Income, Optimized.
					</p>
					<p className="text-sm text-gray-400">
						Turn any trend into a ready-to-sell digital product in under 5 minutes
					</p>
				</div>

				<div className="space-y-4">
					<Link
						href="/dashboard"
						className="block"
					>
						<Button variant="classic" className="w-full" size="4">
							Launch Dashboard
						</Button>
					</Link>
					
					<div className="grid grid-cols-2 gap-4">
						<Link
							href="/experiences/test"
							className="block"
						>
							<Button variant="soft" className="w-full" size="4">
								Legacy App
							</Button>
						</Link>
						<Link
							href="https://docs.whop.com/apps"
							target="_blank"
							className="block"
						>
							<Button variant="soft" className="w-full" size="4">
								Developer Docs
							</Button>
						</Link>
					</div>
				</div>

				<div className="mt-12 pt-8 border-t border-obsidian-200">
					<h3 className="text-lg font-semibold text-white mb-4">Features</h3>
					<ul className="space-y-2 text-sm text-gray-400">
						<li>✓ Trend Intelligence & Personalization</li>
						<li>✓ Product Idea Generation</li>
						<li>✓ Launch Blueprint Compilation</li>
						<li>✓ Campaign Asset Deployment</li>
						<li>✓ Growth Analytics & Metrics</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
