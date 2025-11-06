"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ProductConcept, MarketingAngle } from "@/types/dominance";

interface ProductIdeaPanelProps {
	productConcept: ProductConcept;
	onRegenerate?: () => void;
	loading?: boolean;
}

export default function ProductIdeaPanel({ productConcept, onRegenerate, loading }: ProductIdeaPanelProps) {
	const [copiedItem, setCopiedItem] = useState<string | null>(null);

	// Debug logging on mount and when prop changes
	useEffect(() => {
		console.log("[ProductIdeaPanel] ===== COMPONENT RECEIVED PROPS =====");
		console.log("productConcept:", productConcept);
		console.log("hasProductName:", !!productConcept?.productName);
		console.log("hasProductDescription:", !!productConcept?.productDescription);
		console.log("hasMarketingAngles:", !!productConcept?.marketingAngles);
		console.log("marketingAngles length:", productConcept?.marketingAngles?.length || 0);
		console.log("marketingAngles:", productConcept?.marketingAngles);
		console.log("hasCoreCurriculum:", !!productConcept?.coreCurriculumOutline);
		console.log("hasCoreFeatures:", !!productConcept?.coreFeatureSet);
		console.log("[ProductIdeaPanel] ===== END PROPS LOG =====");
	}, [productConcept]);

	const copyToClipboard = (text: string, id: string) => {
		navigator.clipboard.writeText(text);
		setCopiedItem(id);
		setTimeout(() => setCopiedItem(null), 2000);
	};

	if (loading) {
		return (
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{[...Array(2)].map((_, i) => (
					<div key={i} className="card-premium rounded-xl p-8">
						<div className="animate-pulse space-y-6">
							<div className="h-8 bg-obsidian-200 rounded-xl w-1/3"></div>
							<div className="space-y-3">
								<div className="h-4 bg-obsidian-200 rounded w-full"></div>
								<div className="h-4 bg-obsidian-200 rounded w-5/6"></div>
								<div className="h-4 bg-obsidian-200 rounded w-4/6"></div>
							</div>
						</div>
					</div>
				))}
			</div>
		);
	}

	// Safety check - validate required fields
	if (!productConcept) {
		console.error("[ProductIdeaPanel] ERROR: productConcept is null/undefined");
		return (
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="col-span-2 card-premium rounded-xl p-8 text-center">
					<p className="text-amber-400 mb-2">⚠️ No Product Data</p>
					<p className="text-gray-400 text-sm">Product concept is missing. Please regenerate.</p>
				</div>
			</div>
		);
	}

	if (!productConcept.productName || !productConcept.productDescription) {
		console.error("[ProductIdeaPanel] ERROR: Missing required fields", {
			hasName: !!productConcept.productName,
			hasDescription: !!productConcept.productDescription,
			concept: productConcept,
		});
		return (
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="col-span-2 card-premium rounded-xl p-8 text-center">
					<p className="text-amber-400 mb-2">⚠️ Incomplete Product Data</p>
					<p className="text-gray-400 text-sm mb-4">Product concept is missing required fields. Please regenerate.</p>
					<div className="text-xs text-gray-500 text-left bg-obsidian-100 p-4 rounded-lg font-mono">
						<pre>{JSON.stringify(productConcept, null, 2)}</pre>
					</div>
				</div>
			</div>
		);
	}

	// Extract curriculum or features
	const contentOutline = productConcept.coreCurriculumOutline || productConcept.coreFeatureSet || [];

	console.log("[ProductIdeaPanel] Rendering with data:", {
		productName: productConcept.productName,
		productDescription: productConcept.productDescription?.substring(0, 50),
		contentOutlineLength: contentOutline.length,
		marketingAnglesLength: productConcept.marketingAngles?.length || 0,
	});

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			{/* 📦 Product Structure Panel */}
			<motion.div
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				className="card-premium rounded-xl p-8"
			>
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-openai-accent-400/20 to-openai-accent-500/20 flex items-center justify-center text-2xl">
							📦
						</div>
						<h3 className="text-2xl font-bold text-white">Product Structure</h3>
					</div>
					{onRegenerate && (
						<button
							onClick={onRegenerate}
							className="text-sm text-openai-accent-400 hover:text-openai-accent-300 transition-colors font-medium px-3 py-1 rounded-lg hover:bg-openai-accent-400/10"
						>
							↻ Regenerate
						</button>
					)}
				</div>

				<div className="space-y-6">
					{/* Product Name */}
					<div className="group pb-4 border-b border-obsidian-300">
						<h3 className="text-2xl font-bold text-white mb-2">{productConcept.productName}</h3>
						<p className="text-gray-300 text-base leading-relaxed">{productConcept.productDescription}</p>
					</div>

					{/* Content Outline */}
					{contentOutline.length > 0 ? (
						<div className="group">
							<div className="flex items-center gap-2 mb-3">
								<div className="w-1 h-5 bg-openai-accent-400 rounded-full"></div>
								<h4 className="text-sm font-bold text-openai-accent-400 uppercase tracking-wider">
									{productConcept.coreCurriculumOutline ? "Core Curriculum" : "Core Features"}
								</h4>
							</div>
							<ul className="space-y-2 pl-3">
								{contentOutline.map((item, index) => (
									<li key={index} className="text-gray-200 text-base leading-relaxed flex items-start gap-2">
										<span className="text-openai-accent-400 mt-1">•</span>
										<span>{item}</span>
									</li>
								))}
							</ul>
						</div>
					) : (
						<div className="group p-4 rounded-lg bg-amber-500/10 border border-amber-400/20">
							<p className="text-amber-400 text-sm">⚠️ No content outline available</p>
							<p className="text-gray-400 text-xs mt-1">coreCurriculumOutline and coreFeatureSet are both missing.</p>
						</div>
					)}
				</div>
			</motion.div>

			{/* 📢 Marketing Playbook Panel */}
			<motion.div
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0 }}
				className="card-premium rounded-xl p-8"
			>
				<div className="flex items-center gap-3 mb-6">
					<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-openai-accent-400/20 to-openai-accent-500/20 flex items-center justify-center text-2xl">
						📢
					</div>
					<h3 className="text-2xl font-bold text-white">Marketing Playbook</h3>
				</div>

				<div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
					{(() => {
						console.log("[ProductIdeaPanel] Rendering marketing angles:", {
							hasMarketingAngles: !!productConcept.marketingAngles,
							isArray: Array.isArray(productConcept.marketingAngles),
							length: productConcept.marketingAngles?.length || 0,
							angles: productConcept.marketingAngles,
						});
						
						if (!productConcept.marketingAngles) {
							return (
								<div className="card-premium rounded-lg p-8 text-center">
									<p className="text-amber-400 mb-2">⚠️ Marketing Angles: null/undefined</p>
									<p className="text-gray-400 text-sm">Debug: marketingAngles property does not exist.</p>
									<div className="text-xs text-gray-500 text-left bg-obsidian-100 p-4 rounded-lg font-mono mt-4">
										<pre>{JSON.stringify(productConcept, null, 2)}</pre>
									</div>
								</div>
							);
						}

						if (!Array.isArray(productConcept.marketingAngles)) {
							return (
								<div className="card-premium rounded-lg p-8 text-center">
									<p className="text-amber-400 mb-2">⚠️ Marketing Angles: Not an Array</p>
									<p className="text-gray-400 text-sm">Type: {typeof productConcept.marketingAngles}</p>
									<div className="text-xs text-gray-500 text-left bg-obsidian-100 p-4 rounded-lg font-mono mt-4">
										<pre>{JSON.stringify(productConcept.marketingAngles, null, 2)}</pre>
									</div>
								</div>
							);
						}

						if (productConcept.marketingAngles.length === 0) {
							return (
								<div className="card-premium rounded-lg p-8 text-center">
									<p className="text-amber-400 mb-2">⚠️ Marketing Angles: Empty Array</p>
									<p className="text-gray-400 text-sm">The array exists but has no items.</p>
								</div>
							);
						}

						return productConcept.marketingAngles.map((angle: MarketingAngle, index: number) => {
							// Combine headline and hook for display
							const fullContent = `${angle.headline}\n\n${angle.hook}`;
							return (
								<motion.div
									key={`${angle.angleType}-${index}`}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
									className="group p-5 rounded-lg bg-obsidian-100 border border-obsidian-300 hover:border-openai-accent-400/30 transition-all hover:shadow-lg hover:shadow-openai-accent-400/10"
								>
									<div className="flex items-start justify-between mb-3">
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 rounded-full bg-openai-accent-400"></div>
											<h4 className="text-sm font-bold text-openai-accent-400 uppercase tracking-wider">{angle.angleType}</h4>
										</div>
										<button
											onClick={() => copyToClipboard(fullContent, `${angle.angleType}-${index}`)}
											className="text-xs px-3 py-1 rounded-lg text-gray-400 hover:text-white hover:bg-obsidian-200 transition-all font-medium"
										>
											{copiedItem === `${angle.angleType}-${index}` ? (
												<span className="flex items-center gap-1 text-green-400">
													✓ Copied
												</span>
											) : (
												"📋 Copy"
											)}
										</button>
									</div>
									<div className="space-y-3">
										<div className="prose prose-invert max-w-none">
											<h5 className="text-white font-semibold text-base mb-2">{angle.headline}</h5>
											<p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{angle.hook}</p>
										</div>
									</div>
								</motion.div>
							);
						});
					})()}
				</div>
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
