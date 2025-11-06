"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type UserGoal = "Build App" | "Create Content" | "Sell Knowledge" | "Run Agency";

interface GoalIntakeModalProps {
	isOpen: boolean;
	onComplete: (goal: UserGoal) => void;
	onSkip?: () => void;
}

export default function GoalIntakeModal({ isOpen, onComplete, onSkip }: GoalIntakeModalProps) {
	const [selectedGoal, setSelectedGoal] = useState<UserGoal | null>(null);
	const [loading, setLoading] = useState(false);

	const goals: { value: UserGoal; icon: string; title: string; description: string }[] = [
		{
			value: "Build App",
			icon: "📱",
			title: "Build App",
			description: "Create software products and tools",
		},
		{
			value: "Create Content",
			icon: "🎬",
			title: "Create Content",
			description: "Produce courses, guides, and educational content",
		},
		{
			value: "Sell Knowledge",
			icon: "📚",
			title: "Sell Knowledge",
			description: "Monetize expertise through consulting and services",
		},
		{
			value: "Run Agency",
			icon: "🏢",
			title: "Run Agency",
			description: "Scale a service-based business",
		},
	];

	const handleSubmit = async () => {
		if (!selectedGoal) return;

		setLoading(true);
		try {
			const response = await fetch("/api/user-goals", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					goals: [selectedGoal],
					primaryGoal: selectedGoal,
				}),
			});

			if (response.ok) {
				onComplete(selectedGoal);
			}
		} catch (err) {
			console.error("Failed to save goal:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						className="bg-obsidian-50 border border-obsidian-200 rounded-2xl p-8 max-w-2xl w-full shadow-2xl"
					>
						<h2 className="text-3xl font-bold text-white mb-2">
							Set Your Primary Goal
						</h2>
						<p className="text-gray-400 mb-6">
							Help us personalize trend recommendations for your objectives
						</p>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
							{goals.map((goal) => (
								<button
									key={goal.value}
									onClick={() => setSelectedGoal(goal.value)}
									className={`
										text-left p-4 rounded-xl border-2 transition-all
										${selectedGoal === goal.value
											? "border-ion-400 bg-ion-600/20 shadow-lg shadow-ion-400/10"
											: "border-obsidian-200 bg-obsidian-100 hover:border-ion-400/50"
										}
									`}
								>
									<div className="text-3xl mb-2">{goal.icon}</div>
									<h3 className="font-semibold text-white mb-1">{goal.title}</h3>
									<p className="text-sm text-gray-400">{goal.description}</p>
								</button>
							))}
						</div>

						<div className="flex gap-3 justify-end">
							{onSkip && (
								<button
									onClick={onSkip}
									className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
									disabled={loading}
								>
									Skip
								</button>
							)}
							<button
								onClick={handleSubmit}
								disabled={!selectedGoal || loading}
								className={`
									px-6 py-2 rounded-lg font-medium transition-all
									${selectedGoal && !loading
										? "bg-ion-600 hover:bg-ion-500 text-white"
										: "bg-obsidian-200 text-gray-500 cursor-not-allowed"
									}
								`}
							>
								{loading ? "Saving..." : "Continue"}
							</button>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
