"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface BlueprintDisplayProps {
	blueprint: {
		product: any;
		marketing: any;
		trendContext: any;
		metadata: any;
	};
	onDeployCampaign?: () => void;
}

export default function BlueprintDisplay({ blueprint, onDeployCampaign }: BlueprintDisplayProps) {
	const [activeTab, setActiveTab] = useState<"product" | "marketing" | "visuals">("product");
	const [exporting, setExporting] = useState(false);

	const handleExportJSON = () => {
		const dataStr = JSON.stringify(blueprint, null, 2);
		const dataBlob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `blueprint-${blueprint.metadata?.goal || "product"}-${Date.now()}.json`;
		link.click();
	};

	const handleExportMarkdown = () => {
		const md = `# ${blueprint.product?.overview || "Product Blueprint"}

## Product Overview
${blueprint.product?.overview || ""}

## Unique Value
${blueprint.product?.uniqueValue || ""}

## Target Audience
${blueprint.product?.targetAudience || ""}

## Pricing Model
${blueprint.product?.pricingModel || ""}

## Launch Hook
${blueprint.product?.launchHook || ""}

## Marketing Strategy
${blueprint.marketing?.angles?.map((a: any) => `### ${a.type}\n${a.content}`).join("\n\n") || ""}
`;
		const dataBlob = new Blob([md], { type: "text/markdown" });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `blueprint-${Date.now()}.md`;
		link.click();
	};

	const tabs = [
		{ id: "product", label: "Product" },
		{ id: "marketing", label: "Marketing" },
		{ id: "visuals", label: "Visuals" },
	];

	return (
		<div className="rounded-2xl bg-obsidian-50 border border-obsidian-200 p-6">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-2xl font-bold text-white">Launch Blueprint</h2>
				<div className="flex gap-2">
					<button
						onClick={handleExportMarkdown}
						className="px-4 py-2 text-sm bg-obsidian-100 hover:bg-obsidian-200 border border-obsidian-200 rounded-lg text-gray-300 hover:text-white transition-colors"
					>
						Download .MD
					</button>
					<button
						onClick={handleExportJSON}
						className="px-4 py-2 text-sm bg-obsidian-100 hover:bg-obsidian-200 border border-obsidian-200 rounded-lg text-gray-300 hover:text-white transition-colors"
					>
						Export JSON
					</button>
					{onDeployCampaign && (
						<button
							onClick={onDeployCampaign}
							className="px-4 py-2 text-sm bg-ion-600 hover:bg-ion-500 rounded-lg text-white font-medium transition-colors"
						>
							Deploy Campaign Now
						</button>
					)}
				</div>
			</div>

			{/* Tabs */}
			<div className="flex gap-2 mb-6 border-b border-obsidian-200">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id as any)}
						className={`
							px-4 py-2 text-sm font-medium transition-colors border-b-2
							${activeTab === tab.id
								? "text-ion-400 border-ion-400"
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
						<div className="prose prose-invert max-w-none">
							<h3 className="text-xl font-bold text-white mb-4">Product Overview</h3>
							<ReactMarkdown className="text-gray-300">
								{blueprint.product?.overview || ""}
							</ReactMarkdown>

							<h3 className="text-xl font-bold text-white mt-6 mb-4">Unique Value</h3>
							<ReactMarkdown className="text-gray-300">
								{blueprint.product?.uniqueValue || ""}
							</ReactMarkdown>

							<h3 className="text-xl font-bold text-white mt-6 mb-4">Target Audience</h3>
							<ReactMarkdown className="text-gray-300">
								{blueprint.product?.targetAudience || ""}
							</ReactMarkdown>

							<h3 className="text-xl font-bold text-white mt-6 mb-4">Pricing Model</h3>
							<ReactMarkdown className="text-gray-300">
								{blueprint.product?.pricingModel || ""}
							</ReactMarkdown>

							<h3 className="text-xl font-bold text-white mt-6 mb-4">Launch Hook</h3>
							<p className="text-gray-300 italic">{blueprint.product?.launchHook || ""}</p>
						</div>
					</div>
				)}

				{activeTab === "marketing" && (
					<div className="space-y-4">
						{blueprint.marketing?.angles?.map((angle: any, index: number) => (
							<div
								key={index}
								className="p-5 rounded-xl bg-obsidian-100 border border-obsidian-200"
							>
								<h4 className="text-lg font-semibold text-ion-400 mb-3">{angle.type}</h4>
								<ReactMarkdown className="text-gray-300 prose prose-invert max-w-none">
									{angle.content}
								</ReactMarkdown>
							</div>
						)) || (
							<p className="text-gray-400">No marketing angles available</p>
						)}
					</div>
				)}

				{activeTab === "visuals" && (
					<div className="text-center py-12">
						<p className="text-gray-400 mb-4">Visual assets will appear here after generation</p>
						<p className="text-sm text-gray-500">
							Use the Campaign Deployment feature to generate visual assets
						</p>
					</div>
				)}
			</motion.div>
		</div>
	);
}
