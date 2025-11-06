"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Trend {
	id: string;
	topic: string;
	category: string;
	momentumScore: number;
	summary: {
		whyItMatters: string;
		whoItServes: string;
		monetizationWindow: "short" | "medium" | "long";
	};
	personalization?: {
		potentialProducts: Array<{ type: string; description: string }>;
		relevanceScore: number;
	};
}

interface TrendRadarProps {
	onSelectTrend?: (trend: Trend) => void;
	goal?: string;
}

export default function TrendRadar({ onSelectTrend, goal }: TrendRadarProps) {
	const [trends, setTrends] = useState<Trend[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);

	useEffect(() => {
		fetchTrends();
	}, [goal]);

	const fetchTrends = async () => {
		setLoading(true);
		setError(null);

		try {
			// Fetch trends with retry logic
			const trendsRes = await fetch("/api/trends");
			if (!trendsRes.ok) {
				// Retry once on failure
				await new Promise(resolve => setTimeout(resolve, 1000));
				const retryRes = await fetch("/api/trends");
				if (!retryRes.ok) throw new Error("Failed to fetch trends");
				const trendsData = await retryRes.json();
				let fetchedTrends = trendsData.trends || [];

				// Personalize if goal is provided
				if (goal && fetchedTrends.length > 0) {
					try {
						const personalizeRes = await fetch("/api/personalize-trends", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ goal, trends: fetchedTrends }),
						});

						if (personalizeRes.ok) {
							const personalizedData = await personalizeRes.json();
							fetchedTrends = personalizedData.trends || fetchedTrends;
						}
					} catch (personalizeError) {
						console.warn("Personalization failed, using raw trends:", personalizeError);
					}
				}

				setTrends(fetchedTrends);
				return;
			}

			const trendsData = await trendsRes.json();
			let fetchedTrends = trendsData.trends || [];

			// Personalize if goal is provided
			if (goal && fetchedTrends.length > 0) {
				try {
					const personalizeRes = await fetch("/api/personalize-trends", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ goal, trends: fetchedTrends }),
					});

					if (personalizeRes.ok) {
						const personalizedData = await personalizeRes.json();
						fetchedTrends = personalizedData.trends || fetchedTrends;
					}
				} catch (personalizeError) {
					console.warn("Personalization failed, using raw trends:", personalizeError);
				}
			}

			setTrends(fetchedTrends);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load trends");
		} finally {
			setLoading(false);
		}
	};

	const handleSelectTrend = (trend: Trend) => {
		console.log("[TrendRadar] Trend clicked:", trend.topic);
		setSelectedTrend(trend);
		console.log("[TrendRadar] Calling onSelectTrend callback...");
		onSelectTrend?.(trend);
		console.log("[TrendRadar] Callback called");
	};

	const getMomentumColor = (score: number) => {
		if (score >= 75) return "text-openai-accent-400 bg-openai-accent-400/10 border-openai-accent-400/20";
		if (score >= 50) return "text-openai-accent-400 bg-openai-accent-400/10 border-openai-accent-400/20";
		return "text-amber-400 bg-amber-400/10 border-amber-400/20";
	};

	const getWindowColor = (window: string) => {
		switch (window) {
			case "short": return "bg-red-500/20 text-red-300";
			case "medium": return "bg-amber-500/20 text-amber-300";
			case "long": return "bg-green-500/20 text-green-300";
			default: return "bg-gray-500/20 text-gray-300";
		}
	};

	if (loading) {
		return (
			<div className="card-premium rounded-xl p-6">
				<div className="animate-pulse space-y-4">
					<div className="h-6 bg-obsidian-300 rounded w-1/3"></div>
					<div className="space-y-3">
						{[...Array(3)].map((_, i) => (
							<div key={i} className="h-24 bg-obsidian-300 rounded-lg"></div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="card-premium rounded-xl border-red-400/30 p-6">
				<p className="text-red-400">{error}</p>
				<button
					onClick={fetchTrends}
					className="mt-4 px-4 py-2 bg-openai-accent-500 hover:bg-openai-accent-400 rounded-lg text-white text-sm transition-all"
				>
					Retry
				</button>
			</div>
		);
	}

	if (trends.length === 0) {
		return (
			<div className="card-premium rounded-xl p-6 text-center">
				<p className="text-gray-400">No trends available. Check back soon for new opportunities.</p>
			</div>
		);
	}

	return (
		<div className="card-premium rounded-xl p-6">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-2xl font-bold text-white">Trend Radar</h2>
				<button
					onClick={fetchTrends}
					className="text-sm text-openai-accent-400 hover:text-openai-accent-300 transition-colors"
				>
					Refresh
				</button>
			</div>

			<div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
				<AnimatePresence>
					{trends.map((trend, index) => (
						<motion.div
							key={trend.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ delay: index * 0.05, duration: 0.3 }}
							onClick={() => {
								console.log("[TrendRadar] Card clicked for:", trend.topic);
								handleSelectTrend(trend);
							}}
							className={`
								cursor-pointer rounded-lg p-4 border transition-all active:scale-[0.98]
								${selectedTrend?.id === trend.id 
									? "bg-openai-accent-500/10 border-openai-accent-400 shadow-lg shadow-openai-accent-400/10 ring-2 ring-openai-accent-400/20" 
									: "bg-obsidian-100 border-obsidian-300 hover:border-openai-accent-400/30 hover:bg-obsidian-50"
								}
							`}
						>
							<div className="flex items-start justify-between mb-2">
								<h3 className="font-semibold text-white text-lg flex-1">{trend.topic}</h3>
								<div className={`
									px-3 py-1 rounded-full text-xs font-bold border ml-3 data-display
									${getMomentumColor(trend.momentumScore)}
								`}>
									{trend.momentumScore}
								</div>
							</div>

							<div className="flex items-center gap-3 mb-3">
								<span className="text-xs px-2 py-1 bg-obsidian-200 rounded text-gray-300">
									{trend.category}
								</span>
								<span className={`
									text-xs px-2 py-1 rounded font-medium
									${getWindowColor(trend.summary.monetizationWindow)}
								`}>
									{trend.summary.monetizationWindow} window
								</span>
								{trend.personalization && (
									<span className="text-xs text-openai-accent-400 data-display">
										Relevance: {Math.round(trend.personalization.relevanceScore)}
									</span>
								)}
							</div>

							<p className="text-sm text-gray-300 line-clamp-2 mb-2">
								{trend.summary.whyItMatters}
							</p>

							{trend.personalization?.potentialProducts?.[0] && (
								<div className="mt-3 pt-3 border-t border-obsidian-300">
									<p className="text-xs text-openai-accent-400 font-medium mb-1">Top Match:</p>
									<p className="text-xs text-gray-400">
										{trend.personalization.potentialProducts[0].type}: {trend.personalization.potentialProducts[0].description}
									</p>
								</div>
							)}
						</motion.div>
					))}
				</AnimatePresence>
			</div>
		</div>
	);
}
