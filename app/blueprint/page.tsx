"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LaunchpadCard, LaunchpadButton } from "@/components/brand/BrandKit";
import ReactMarkdown from "react-markdown";

interface Blueprint {
	positioning: {
		targetAudience: string;
		marketPosition: string;
		demandAnalysis: string;
		competitiveLandscape: string;
	};
	promise: {
		headline: string;
		subheadline: string;
		valueProposition: string;
		keyBenefits: string[];
	};
	pricing: {
		pricePoint: number;
		pricingStrategy: string;
		justification: string;
		packageOptions?: string[];
	};
	plan: {
		creativeBrief: string;
		designSpec: string;
		contentStrategy: string;
		launchSequence: string[];
	};
}

// Phased Rocket Meter Component
function RocketMeter({ phase }: { phase: 0 | 1 | 2 | 3 }) {
	const phases = [
		{ name: "Strategist", icon: "🎯" },
		{ name: "CopyArchitect", icon: "✍️" },
		{ name: "Designer", icon: "🎨" },
		{ name: "Complete", icon: "🚀" },
	];

	return (
		<div className="flex items-center justify-center gap-8 my-12">
			{phases.map((p, index) => (
				<div key={index} className="flex flex-col items-center gap-4">
					<motion.div
						initial={{ scale: 0.8, opacity: 0.5 }}
						animate={{ 
							scale: index <= phase ? 1.2 : 0.8,
							opacity: index <= phase ? 1 : 0.5,
						}}
						transition={{ duration: 0.3 }}
						className={`
							w-16 h-16 rounded-full flex items-center justify-center text-2xl
							${index <= phase ? 'bg-catalyst text-obsidian' : 'bg-obsidian-50 text-white/50'}
							${index === phase ? 'ring-4 ring-catalyst/50' : ''}
						`}
					>
						{p.icon}
					</motion.div>
					<span className={`text-sm font-medium uppercase tracking-tight ${
						index <= phase ? 'text-catalyst' : 'text-white/50'
					}`}>
						{p.name}
					</span>
					{index < phases.length - 1 && (
						<div className={`absolute w-24 h-1 mt-8 ${
							index < phase ? 'bg-catalyst' : 'bg-obsidian-50'
						}`} style={{ marginLeft: '4rem' }} />
					)}
				</div>
			))}
		</div>
	);
}

export default function BlueprintSupremacy() {
	const [rawIdea, setRawIdea] = useState("");
	const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [currentPhase, setCurrentPhase] = useState<0 | 1 | 2 | 3>(0);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<"positioning" | "promise" | "pricing" | "plan">("positioning");

	const handleGenerate = async () => {
		if (!rawIdea.trim()) return;

		setIsGenerating(true);
		setError(null);
		setBlueprint(null);
		setCurrentPhase(0);

		try {
			// Simulate phased progress
			setCurrentPhase(1);
			await new Promise(resolve => setTimeout(resolve, 2000));

			setCurrentPhase(2);
			await new Promise(resolve => setTimeout(resolve, 2000));

			setCurrentPhase(3);
			
			const response = await fetch("/api/blueprint-supremacy", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ rawIdea }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to generate blueprint");
			}

			const data = await response.json();
			setBlueprint(data.blueprint);
			setCurrentPhase(3);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Generation failed");
			setCurrentPhase(0);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleExportJSON = () => {
		if (!blueprint) return;
		const dataStr = JSON.stringify({ blueprint, rawIdea }, null, 2);
		const blob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `blueprint-${Date.now()}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleExportPDF = () => {
		// TODO: Implement PDF generation
		alert("PDF export coming soon!");
	};

	return (
		<div className="min-h-screen bg-obsidian p-8">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="mb-12 text-center">
					<h1 className="text-5xl font-bold text-white uppercase tracking-tight mb-2">
						Blueprint Supremacy Engine
					</h1>
					<p className="text-white/70 text-body-lg">
						Transform raw ideas into validated market offers
					</p>
				</div>

				{/* Input Section */}
				<LaunchpadCard className="mb-8">
					<h2 className="text-2xl font-bold text-white uppercase tracking-tight mb-4">
						Enter Your Raw Idea
					</h2>
					<textarea
						id="raw-idea"
						name="rawIdea"
						value={rawIdea}
						onChange={(e) => setRawIdea(e.target.value)}
						placeholder="Describe your product idea, market opportunity, or business concept..."
						className="w-full h-32 rounded-launchpad bg-obsidian-50 border border-obsidian-100 px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-ion focus:ring-2 focus:ring-ion/20 resize-none"
						disabled={isGenerating}
						autoComplete="off"
					/>
					<div className="mt-6 flex justify-end">
						<LaunchpadButton
							variant="catalyst"
							onClick={handleGenerate}
							disabled={isGenerating || !rawIdea.trim()}
						>
							{isGenerating ? "Generating..." : "Generate Blueprint"}
						</LaunchpadButton>
					</div>
				</LaunchpadCard>

				{/* Progress Visualization */}
				{isGenerating && (
					<LaunchpadCard>
						<RocketMeter phase={currentPhase} />
						<div className="text-center mt-8">
							<motion.div
								animate={{ opacity: [0.5, 1, 0.5] }}
								transition={{ duration: 1.5, repeat: Infinity }}
								className="text-white/70"
							>
								{currentPhase === 1 && "🎯 Strategist analyzing positioning..."}
								{currentPhase === 2 && "✍️ CopyArchitect crafting headlines..."}
								{currentPhase === 3 && "🎨 Designer creating creative brief..."}
							</motion.div>
						</div>
					</LaunchpadCard>
				)}

				{/* Error Display */}
				{error && (
					<LaunchpadCard className="border-red-500/50">
						<p className="text-red-400">{error}</p>
					</LaunchpadCard>
				)}

				{/* Blueprint Output */}
				<AnimatePresence>
					{blueprint && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							className="space-y-6"
						>
							{/* Export Options */}
							<LaunchpadCard>
								<div className="flex items-center justify-between mb-6">
									<h2 className="text-2xl font-bold text-white uppercase tracking-tight">
										Your Blueprint
									</h2>
									<div className="flex gap-4">
										<LaunchpadButton variant="secondary" onClick={handleExportJSON}>
											Export JSON
										</LaunchpadButton>
										<LaunchpadButton variant="secondary" onClick={handleExportPDF}>
											Export PDF
										</LaunchpadButton>
									</div>
								</div>

								{/* Tabs */}
								<div className="flex gap-2 mb-6 border-b border-obsidian-100">
									{(["positioning", "promise", "pricing", "plan"] as const).map((tab) => (
										<button
											key={tab}
											onClick={() => setActiveTab(tab)}
											className={`px-6 py-3 font-medium uppercase tracking-tight transition-all ${
												activeTab === tab
													? "text-catalyst border-b-2 border-catalyst"
													: "text-white/70 hover:text-white"
											}`}
										>
											{tab}
										</button>
									))}
								</div>

								{/* Tab Content */}
								<div className="min-h-[400px]">
									{activeTab === "positioning" && (
										<div className="space-y-6">
											<div>
												<h3 className="text-lg font-bold text-white mb-2">Target Audience</h3>
												<p className="text-white/90">{blueprint.positioning.targetAudience}</p>
											</div>
											<div>
												<h3 className="text-lg font-bold text-white mb-2">Market Position</h3>
												<p className="text-white/90">{blueprint.positioning.marketPosition}</p>
											</div>
											<div>
												<h3 className="text-lg font-bold text-white mb-2">Demand Analysis</h3>
												<p className="text-white/90">{blueprint.positioning.demandAnalysis}</p>
											</div>
											<div>
												<h3 className="text-lg font-bold text-white mb-2">Competitive Landscape</h3>
												<p className="text-white/90">{blueprint.positioning.competitiveLandscape}</p>
											</div>
										</div>
									)}

									{activeTab === "promise" && (
										<div className="space-y-6">
											<div>
												<h3 className="text-3xl font-bold text-catalyst mb-2">{blueprint.promise.headline}</h3>
												<p className="text-xl text-white/90 mb-4">{blueprint.promise.subheadline}</p>
											</div>
											<div>
												<h3 className="text-lg font-bold text-white mb-2">Value Proposition</h3>
												<p className="text-white/90">{blueprint.promise.valueProposition}</p>
											</div>
											<div>
												<h3 className="text-lg font-bold text-white mb-2">Key Benefits</h3>
												<ul className="space-y-2">
													{blueprint.promise.keyBenefits.map((benefit, i) => (
														<li key={i} className="text-white/90 flex items-start gap-2">
															<span className="text-catalyst">✓</span>
															<span>{benefit}</span>
														</li>
													))}
												</ul>
											</div>
										</div>
									)}

									{activeTab === "pricing" && (
										<div className="space-y-6">
											<div>
												<h3 className="text-4xl font-bold text-catalyst mb-2">
													${blueprint.pricing.pricePoint}
												</h3>
												<p className="text-white/70 mb-4">{blueprint.pricing.pricingStrategy} Strategy</p>
											</div>
											<div>
												<h3 className="text-lg font-bold text-white mb-2">Pricing Justification</h3>
												<p className="text-white/90">{blueprint.pricing.justification}</p>
											</div>
											{blueprint.pricing.packageOptions && blueprint.pricing.packageOptions.length > 0 && (
												<div>
													<h3 className="text-lg font-bold text-white mb-2">Package Options</h3>
													<ul className="space-y-2">
														{blueprint.pricing.packageOptions.map((option, i) => (
															<li key={i} className="text-white/90">• {option}</li>
														))}
													</ul>
												</div>
											)}
										</div>
									)}

									{activeTab === "plan" && (
										<div className="space-y-6">
											<div>
												<h3 className="text-lg font-bold text-white mb-2">Creative Brief</h3>
												<div className="prose prose-invert max-w-none">
													<ReactMarkdown>{blueprint.plan.creativeBrief}</ReactMarkdown>
												</div>
											</div>
											<div>
												<h3 className="text-lg font-bold text-white mb-2">Design Specifications</h3>
												<div className="prose prose-invert max-w-none">
													<ReactMarkdown>{blueprint.plan.designSpec}</ReactMarkdown>
												</div>
											</div>
											<div>
												<h3 className="text-lg font-bold text-white mb-2">Content Strategy</h3>
												<p className="text-white/90">{blueprint.plan.contentStrategy}</p>
											</div>
											<div>
												<h3 className="text-lg font-bold text-white mb-2">Launch Sequence</h3>
												<ol className="space-y-2">
													{blueprint.plan.launchSequence.map((step, i) => (
														<li key={i} className="text-white/90 flex items-start gap-2">
															<span className="text-catalyst font-bold">{i + 1}.</span>
															<span>{step}</span>
														</li>
													))}
												</ol>
											</div>
										</div>
									)}
								</div>
							</LaunchpadCard>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
