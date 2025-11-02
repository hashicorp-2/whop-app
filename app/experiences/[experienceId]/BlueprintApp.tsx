"use client";

import { useState } from "react";
import BlueprintForm from "@/components/BlueprintForm";
import BlueprintOutput from "@/components/BlueprintOutput";
import { Button } from "@whop/react/components";

export default function BlueprintApp() {
	const [blueprint, setBlueprint] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleGenerate = async (data: {
		niche: string;
		goals: string;
		bottleneck: string;
	}) => {
		setIsLoading(true);
		setError(null);
		
		try {
			const response = await fetch("/api/generate-blueprint", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Failed to generate blueprint");
			}

			const result = await response.json();
			setBlueprint(result.blueprint);
		} catch (err) {
			setError("Failed to generate blueprint. Please try again.");
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col h-full p-8 gap-6">
			<div className="text-center mb-4">
				<h1 className="text-5xl font-bold text-gray-12 mb-2">
					The Ironclad Blueprint
				</h1>
				<p className="text-lg text-gray-10">
					Get your personalized 30-day system to automate content, products, and fan engagement
				</p>
			</div>

			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
					{error}
				</div>
			)}

			<div className="flex gap-6 flex-1 min-h-0">
				{/* Left Column: Form */}
				<div className="w-1/2 border-r border-gray-a4 pr-6">
					<div className="bg-gray-a2 rounded-2xl p-6 h-full">
						<BlueprintForm onGenerate={handleGenerate} isLoading={isLoading} />
					</div>
				</div>

				{/* Right Column: Output */}
				<div className="w-1/2 pl-6">
					<div className="h-full">
						<BlueprintOutput content={blueprint} />
					</div>
				</div>
			</div>
		</div>
	);
}
