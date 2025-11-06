"use client";

/**
 * SIMPLE VERSION - Just displays the data to verify it works
 */
export default function SimpleBlueprintDisplay({ data }: { data: any }) {
	if (!data) {
		return (
			<div className="card-premium rounded-xl p-8">
				<p className="text-red-400">No data received</p>
			</div>
		);
	}

	console.log("[SimpleBlueprintDisplay] Rendering with data:", data);

	return (
		<div className="card-premium rounded-xl p-8 space-y-6">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-3xl font-bold text-white">✅ Launch Blueprint Generated</h2>
				<div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
			</div>

			{/* Product Section */}
			<div className="border-b border-obsidian-300 pb-6">
				<h3 className="text-2xl font-bold text-openai-accent-400 mb-4">📦 Product</h3>
				{data.product_blueprint ? (
					<div className="space-y-4">
						<div>
							<h4 className="text-lg font-semibold text-white mb-2">Title</h4>
							<p className="text-gray-300">{data.product_blueprint.product_title || "Missing"}</p>
						</div>
						<div>
							<h4 className="text-lg font-semibold text-white mb-2">Core Concept</h4>
							<p className="text-gray-300">{data.product_blueprint.core_concept || "Missing"}</p>
						</div>
						<div>
							<h4 className="text-lg font-semibold text-white mb-2">Key Features</h4>
							<ul className="list-disc list-inside space-y-1 text-gray-300">
								{(data.product_blueprint.key_features || []).map((feature: string, i: number) => (
									<li key={i}>{feature}</li>
								))}
							</ul>
						</div>
					</div>
				) : (
					<p className="text-red-400">product_blueprint is missing!</p>
				)}
			</div>

			{/* Marketing Section */}
			<div className="border-b border-obsidian-300 pb-6">
				<h3 className="text-2xl font-bold text-openai-accent-400 mb-4">📢 Marketing</h3>
				{data.marketing_playbook ? (
					<div className="space-y-4">
						<div>
							<h4 className="text-lg font-semibold text-white mb-2">Tagline</h4>
							<p className="text-gray-300">{data.marketing_playbook.tagline || "Missing"}</p>
						</div>
						<div>
							<h4 className="text-lg font-semibold text-white mb-2">Core Hooks</h4>
							<ul className="list-disc list-inside space-y-1 text-gray-300">
								{(data.marketing_playbook.core_hooks || []).map((hook: string, i: number) => (
									<li key={i}>{hook}</li>
								))}
							</ul>
						</div>
					</div>
				) : (
					<p className="text-red-400">marketing_playbook is missing!</p>
				)}
			</div>

			{/* Debug Info */}
			<div className="mt-6 p-4 bg-obsidian-100 rounded-lg">
				<h4 className="text-sm font-semibold text-white mb-2">Debug Info</h4>
				<pre className="text-xs text-gray-400 overflow-auto max-h-64">
					{JSON.stringify(data, null, 2)}
				</pre>
			</div>
		</div>
	);
}

