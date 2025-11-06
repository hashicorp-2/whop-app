"use client";

import { motion } from "framer-motion";

interface EmptyStateProps {
	icon?: string;
	title: string;
	description: string;
	action?: {
		label: string;
		onClick: () => void;
	};
}

export default function EmptyState({ icon = "📊", title, description, action }: EmptyStateProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="rounded-xl bg-obsidian-50 border border-obsidian-200 p-12 text-center"
		>
			<div className="text-6xl mb-4">{icon}</div>
			<h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
			<p className="text-gray-400 mb-6 max-w-md mx-auto">{description}</p>
			{action && (
				<button
					onClick={action.onClick}
					className="px-6 py-2 bg-ion-600 hover:bg-ion-500 rounded-lg text-white font-medium transition-colors"
				>
					{action.label}
				</button>
			)}
		</motion.div>
	);
}
