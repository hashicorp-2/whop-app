"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface ProductBlueprintData {
	product_blueprint: {
		product_title: string;
		core_concept: string;
		problem_solved: string;
		primary_audience: string;
		key_features: string[];
		value_proposition: string;
		business_model_pricing: string;
		recommended_format_or_stack: string;
		validation_angle: string;
	};
	marketing_playbook: {
		tagline: string;
		core_hooks: string[];
		launch_channels: string[];
		content_sequence_plan: {
			day_1: string;
			day_2: string;
			day_3: string;
			day_4: string;
			day_5: string;
			day_6: string;
			day_7: string;
		};
		email_sequence: Array<{
			subject: string;
			body: string;
		}>;
		ad_copy_samples: Array<{
			headline: string;
			cta: string;
		}>;
		visual_asset_prompts: string[];
		early_conversion_tactic: string;
		metrics_to_track: string[];
	};
	export_metadata: {
		generated_at: string;
		trend_source: string;
		user_goal: string;
	};
}

interface ProductBlueprintDisplayProps {
	data: ProductBlueprintData;
	onDeployCampaign?: () => void;
	onRegenerate?: () => void;
}

export default function ProductBlueprintDisplay({ data, onDeployCampaign, onRegenerate }: ProductBlueprintDisplayProps) {
	const [activeTab, setActiveTab] = useState<"product" | "marketing" | "download">("product");
	const [copiedItem, setCopiedItem] = useState<string | null>(null);

	// Debug logging
	console.log("[ProductBlueprintDisplay] Received data:", {
		hasData: !!data,
		hasProductBlueprint: !!data?.product_blueprint,
		hasMarketingPlaybook: !!data?.marketing_playbook,
		productTitle: data?.product_blueprint?.product_title,
		tagline: data?.marketing_playbook?.tagline,
		fullData: data,
	});

	// Validate data structure
	if (!data || !data.product_blueprint || !data.marketing_playbook) {
		console.error("[ProductBlueprintDisplay] Invalid data structure:", data);
		return (
			<div className="card-premium rounded-xl p-8">
				<div className="text-center py-12">
					<p className="text-amber-400 mb-2">⚠️ Invalid Data Structure</p>
					<p className="text-gray-400 text-sm mb-4">
						Missing required fields: product_blueprint or marketing_playbook
					</p>
					<div className="text-xs text-gray-500 text-left bg-obsidian-100 p-4 rounded-lg font-mono max-h-64 overflow-auto">
						<pre>{JSON.stringify(data, null, 2)}</pre>
					</div>
					{onRegenerate && (
						<button
							onClick={onRegenerate}
							className="mt-4 px-4 py-2 bg-openai-accent-500 hover:bg-openai-accent-400 rounded-lg text-white text-sm transition-all"
						>
							↻ Regenerate
						</button>
					)}
				</div>
			</div>
		);
	}

	const copyToClipboard = (text: string, id: string) => {
		navigator.clipboard.writeText(text);
		setCopiedItem(id);
		setTimeout(() => setCopiedItem(null), 2000);
	};

	const handleDownloadMarkdown = () => {
		const md = `# ${data.product_blueprint.product_title}

## Core Concept
${data.product_blueprint.core_concept}

## Problem Solved
${data.product_blueprint.problem_solved}

## Primary Audience
${data.product_blueprint.primary_audience}

## Key Features
${data.product_blueprint.key_features.map(f => `- ${f}`).join('\n')}

## Value Proposition
${data.product_blueprint.value_proposition}

## Business Model & Pricing
${data.product_blueprint.business_model_pricing}

## Recommended Format/Stack
${data.product_blueprint.recommended_format_or_stack}

## Validation Angle
${data.product_blueprint.validation_angle}

---

# Marketing Playbook

## Tagline
${data.marketing_playbook.tagline}

## Core Hooks
${data.marketing_playbook.core_hooks.map(h => `- ${h}`).join('\n')}

## Launch Channels
${data.marketing_playbook.launch_channels.map(c => `- ${c}`).join('\n')}

## Content Sequence Plan
${Object.entries(data.marketing_playbook.content_sequence_plan).map(([day, content]) => `### ${day}\n${content}`).join('\n\n')}

## Email Sequence
${data.marketing_playbook.email_sequence.map((email, i) => `### Email ${i + 1}\n**Subject:** ${email.subject}\n**Body:** ${email.body}`).join('\n\n')}

## Ad Copy Samples
${data.marketing_playbook.ad_copy_samples.map((ad, i) => `### Ad ${i + 1}\n**Headline:** ${ad.headline}\n**CTA:** ${ad.cta}`).join('\n\n')}

## Visual Asset Prompts
${data.marketing_playbook.visual_asset_prompts.map((p, i) => `${i + 1}. ${p}`).join('\n')}

## Early Conversion Tactic
${data.marketing_playbook.early_conversion_tactic}

## Metrics to Track
${data.marketing_playbook.metrics_to_track.map(m => `- ${m}`).join('\n')}

---

*Generated: ${data.export_metadata.generated_at}*
*Trend Source: ${data.export_metadata.trend_source}*
*User Goal: ${data.export_metadata.user_goal}*
`;

		const dataBlob = new Blob([md], { type: "text/markdown" });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `${data.product_blueprint.product_title.replace(/\s+/g, '-')}-${Date.now()}.md`;
		link.click();
	};

	const handleDownloadJSON = () => {
		const dataStr = JSON.stringify(data, null, 2);
		const dataBlob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `${data.product_blueprint.product_title.replace(/\s+/g, '-')}-${Date.now()}.json`;
		link.click();
	};

	const tabs = [
		{ id: "product", label: "📦 Product" },
		{ id: "marketing", label: "📢 Marketing" },
		{ id: "download", label: "💾 Download" },
	];

	return (
		<div className="card-premium rounded-xl p-8">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-3xl font-bold text-white">Launch Blueprint</h2>
				<div className="flex gap-2">
					{onRegenerate && (
						<button
							onClick={onRegenerate}
							className="px-4 py-2 text-sm bg-obsidian-100 hover:bg-obsidian-200 border border-obsidian-300 rounded-lg text-gray-300 hover:text-white transition-colors"
						>
							↻ Regenerate
						</button>
					)}
					{onDeployCampaign && (
						<button
							onClick={onDeployCampaign}
							className="px-4 py-2 text-sm bg-gradient-to-r from-openai-accent-500 to-openai-accent-600 hover:from-openai-accent-400 hover:to-openai-accent-500 rounded-lg text-white font-medium transition-all"
						>
							Deploy Campaign
						</button>
					)}
				</div>
			</div>

			{/* Tabs */}
			<div className="flex gap-2 mb-6 border-b border-obsidian-300">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id as any)}
						className={`
							px-4 py-2 text-sm font-medium transition-colors border-b-2
							${activeTab === tab.id
								? "text-openai-accent-400 border-openai-accent-400"
								: "text-gray-400 border-transparent hover:text-gray-300"
							}
						`}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Tab Content */}
			<motion.div
				key={activeTab}
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className="min-h-[400px]"
			>
				{activeTab === "product" && (
					<div className="space-y-6">
						<div>
							<h3 className="text-2xl font-bold text-white mb-4">{data.product_blueprint.product_title}</h3>
							<div className="prose prose-invert max-w-none space-y-4">
								<div>
									<h4 className="text-lg font-semibold text-openai-accent-400 mb-2">Core Concept</h4>
									<ReactMarkdown className="text-gray-300">{data.product_blueprint.core_concept}</ReactMarkdown>
								</div>

								<div>
									<h4 className="text-lg font-semibold text-openai-accent-400 mb-2">Problem Solved</h4>
									<ReactMarkdown className="text-gray-300">{data.product_blueprint.problem_solved}</ReactMarkdown>
								</div>

								<div>
									<h4 className="text-lg font-semibold text-openai-accent-400 mb-2">Primary Audience</h4>
									<p className="text-gray-300">{data.product_blueprint.primary_audience}</p>
								</div>

								<div>
									<h4 className="text-lg font-semibold text-openai-accent-400 mb-2">Key Features</h4>
									{data.product_blueprint.key_features && data.product_blueprint.key_features.length > 0 ? (
										<ul className="list-disc list-inside space-y-2 text-gray-300">
											{data.product_blueprint.key_features.map((feature, i) => (
												<li key={i}>{feature}</li>
											))}
										</ul>
									) : (
										<p className="text-gray-400 text-sm">No features specified</p>
									)}
								</div>

								<div>
									<h4 className="text-lg font-semibold text-openai-accent-400 mb-2">Value Proposition</h4>
									<p className="text-gray-300">{data.product_blueprint.value_proposition}</p>
								</div>

								<div>
									<h4 className="text-lg font-semibold text-openai-accent-400 mb-2">Business Model & Pricing</h4>
									<ReactMarkdown className="text-gray-300">{data.product_blueprint.business_model_pricing}</ReactMarkdown>
								</div>

								<div>
									<h4 className="text-lg font-semibold text-openai-accent-400 mb-2">Recommended Format/Stack</h4>
									<p className="text-gray-300">{data.product_blueprint.recommended_format_or_stack}</p>
								</div>

								<div>
									<h4 className="text-lg font-semibold text-openai-accent-400 mb-2">Validation Angle</h4>
									<p className="text-gray-300">{data.product_blueprint.validation_angle}</p>
								</div>
							</div>
						</div>
					</div>
				)}

				{activeTab === "marketing" && (
					<div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
						<div>
							<h4 className="text-lg font-semibold text-openai-accent-400 mb-2">Tagline</h4>
							<p className="text-gray-300 text-lg">{data.marketing_playbook.tagline}</p>
						</div>

						<div>
							<h4 className="text-lg font-semibold text-openai-accent-400 mb-3">Core Hooks</h4>
							{data.marketing_playbook.core_hooks && data.marketing_playbook.core_hooks.length > 0 ? (
								<div className="space-y-3">
									{data.marketing_playbook.core_hooks.map((hook, i) => (
									<div
										key={i}
										className="p-4 rounded-lg bg-obsidian-100 border border-obsidian-300 hover:border-openai-accent-400/30 transition-all"
									>
										<div className="flex items-start justify-between">
											<p className="text-gray-300 flex-1">{hook}</p>
											<button
												onClick={() => copyToClipboard(hook, `hook-${i}`)}
												className="text-xs px-3 py-1 rounded-lg text-gray-400 hover:text-white hover:bg-obsidian-200 transition-all"
											>
												{copiedItem === `hook-${i}` ? "✓ Copied" : "📋 Copy"}
											</button>
										</div>
									</div>
									))}
								</div>
							) : (
								<p className="text-gray-400 text-sm">No hooks available</p>
							)}
						</div>

						<div>
							<h4 className="text-lg font-semibold text-openai-accent-400 mb-3">Launch Channels</h4>
							{data.marketing_playbook.launch_channels && data.marketing_playbook.launch_channels.length > 0 ? (
								<ul className="list-disc list-inside space-y-2 text-gray-300">
									{data.marketing_playbook.launch_channels.map((channel, i) => (
										<li key={i}>{channel}</li>
									))}
								</ul>
							) : (
								<p className="text-gray-400 text-sm">No launch channels specified</p>
							)}
						</div>

						<div>
							<h4 className="text-lg font-semibold text-openai-accent-400 mb-3">Content Sequence Plan</h4>
							<div className="space-y-3">
								{Object.entries(data.marketing_playbook.content_sequence_plan).map(([day, content]) => (
									<div key={day} className="p-4 rounded-lg bg-obsidian-100 border border-obsidian-300">
										<h5 className="text-sm font-semibold text-openai-accent-400 mb-1 uppercase">{day.replace('_', ' ')}</h5>
										<p className="text-gray-300 text-sm">{content}</p>
									</div>
								))}
							</div>
						</div>

						<div>
							<h4 className="text-lg font-semibold text-openai-accent-400 mb-3">Email Sequence</h4>
							{data.marketing_playbook.email_sequence && data.marketing_playbook.email_sequence.length > 0 ? (
								<div className="space-y-4">
									{data.marketing_playbook.email_sequence.map((email, i) => (
									<div key={i} className="p-4 rounded-lg bg-obsidian-100 border border-obsidian-300">
										<h5 className="text-sm font-semibold text-white mb-2">Email {i + 1}</h5>
										<p className="text-gray-300 text-sm mb-1"><strong>Subject:</strong> {email.subject}</p>
										<p className="text-gray-300 text-sm">{email.body}</p>
									</div>
									))}
								</div>
							) : (
								<p className="text-gray-400 text-sm">No email sequence available</p>
							)}
						</div>

						<div>
							<h4 className="text-lg font-semibold text-openai-accent-400 mb-3">Ad Copy Samples</h4>
							{data.marketing_playbook.ad_copy_samples && data.marketing_playbook.ad_copy_samples.length > 0 ? (
								<div className="space-y-3">
									{data.marketing_playbook.ad_copy_samples.map((ad, i) => (
									<div key={i} className="p-4 rounded-lg bg-obsidian-100 border border-obsidian-300">
										<p className="text-white font-semibold mb-1">{ad.headline}</p>
										<p className="text-gray-300 text-sm">{ad.cta}</p>
									</div>
									))}
								</div>
							) : (
								<p className="text-gray-400 text-sm">No ad copy samples available</p>
							)}
						</div>

						<div>
							<h4 className="text-lg font-semibold text-openai-accent-400 mb-2">Early Conversion Tactic</h4>
							<p className="text-gray-300">{data.marketing_playbook.early_conversion_tactic || "Not specified"}</p>
						</div>

						<div>
							<h4 className="text-lg font-semibold text-openai-accent-400 mb-2">Metrics to Track</h4>
							{data.marketing_playbook.metrics_to_track && data.marketing_playbook.metrics_to_track.length > 0 ? (
								<ul className="list-disc list-inside space-y-1 text-gray-300">
									{data.marketing_playbook.metrics_to_track.map((metric, i) => (
										<li key={i}>{metric}</li>
									))}
								</ul>
							) : (
								<p className="text-gray-400 text-sm">No metrics specified</p>
							)}
						</div>
					</div>
				)}

				{activeTab === "download" && (
					<div className="space-y-4">
						<div className="text-center py-8">
							<h3 className="text-2xl font-bold text-white mb-4">Export Your Blueprint</h3>
							<p className="text-gray-400 mb-8">Download your complete product blueprint in your preferred format</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<button
								onClick={handleDownloadMarkdown}
								className="p-6 rounded-xl bg-obsidian-100 border border-obsidian-300 hover:border-openai-accent-400/50 transition-all text-left group"
							>
								<div className="text-3xl mb-3">📄</div>
								<h4 className="text-lg font-semibold text-white mb-2 group-hover:text-openai-accent-400 transition-colors">
									Download as Markdown
								</h4>
								<p className="text-gray-400 text-sm">Export as .md file for easy editing and sharing</p>
							</button>

							<button
								onClick={handleDownloadJSON}
								className="p-6 rounded-xl bg-obsidian-100 border border-obsidian-300 hover:border-openai-accent-400/50 transition-all text-left group"
							>
								<div className="text-3xl mb-3">📦</div>
								<h4 className="text-lg font-semibold text-white mb-2 group-hover:text-openai-accent-400 transition-colors">
									Export JSON
								</h4>
								<p className="text-gray-400 text-sm">Export as JSON for programmatic use</p>
							</button>
						</div>

						<div className="mt-6 p-4 rounded-lg bg-obsidian-100 border border-obsidian-300">
							<p className="text-xs text-gray-400">
								<strong>Generated:</strong> {new Date(data.export_metadata.generated_at).toLocaleString()}<br />
								<strong>Trend Source:</strong> {data.export_metadata.trend_source}<br />
								<strong>User Goal:</strong> {data.export_metadata.user_goal}
							</p>
						</div>
					</div>
				)}
			</motion.div>

			<style jsx>{`
				.custom-scrollbar::-webkit-scrollbar {
					width: 6px;
				}
				.custom-scrollbar::-webkit-scrollbar-track {
					background: rgba(13, 15, 20, 0.5);
					border-radius: 10px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb {
					background: rgba(16, 163, 127, 0.5);
					border-radius: 10px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb:hover {
					background: rgba(16, 163, 127, 0.7);
				}
			`}</style>
		</div>
	);
}

