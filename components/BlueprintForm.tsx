"use client";

import { useState } from "react";
import { Button } from "@whop/react/components";

interface BlueprintFormProps {
	onGenerate: (data: {
		niche: string;
		goals: string;
		bottleneck: string;
	}) => void;
	isLoading: boolean;
}

export default function BlueprintForm({
	onGenerate,
	isLoading,
}: BlueprintFormProps) {
	const [niche, setNiche] = useState("");
	const [goals, setGoals] = useState("");
	const [bottleneck, setBottleneck] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (niche && goals && bottleneck) {
			onGenerate({ niche, goals, bottleneck });
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div>
				<label
					htmlFor="niche"
					className="block text-sm font-medium text-gray-12 mb-2"
				>
					Your Niche
				</label>
				<input
					type="text"
					id="niche"
					value={niche}
					onChange={(e) => setNiche(e.target.value)}
					placeholder="e.g., Fitness Coach, Indie Game Dev"
					className="w-full px-4 py-2 border border-gray-a4 rounded-lg bg-white text-gray-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
					required
					disabled={isLoading}
				/>
			</div>

			<div>
				<label
					htmlFor="goals"
					className="block text-sm font-medium text-gray-12 mb-2"
				>
					Your Primary Goals
				</label>
				<textarea
					id="goals"
					value={goals}
					onChange={(e) => setGoals(e.target.value)}
					placeholder="What are you trying to achieve? Be specific..."
					rows={4}
					className="w-full px-4 py-2 border border-gray-a4 rounded-lg bg-white text-gray-12 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
					required
					disabled={isLoading}
				/>
			</div>

			<div>
				<label
					htmlFor="bottleneck"
					className="block text-sm font-medium text-gray-12 mb-2"
				>
					Your Biggest Bottleneck
				</label>
				<textarea
					id="bottleneck"
					value={bottleneck}
					onChange={(e) => setBottleneck(e.target.value)}
					placeholder="What's stopping you from achieving your goals?"
					rows={4}
					className="w-full px-4 py-2 border border-gray-a4 rounded-lg bg-white text-gray-12 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
					required
					disabled={isLoading}
				/>
			</div>

			<Button
				type="submit"
				variant="classic"
				size="4"
				className="w-full"
				disabled={isLoading || !niche || !goals || !bottleneck}
			>
				{isLoading
					? "Generating Your Blueprint..."
					: "Generate My Ironclad Blueprint"}
			</Button>
		</form>
	);
}
