"use client";

import { motion, AnimatePresence } from "framer-motion";

interface SuccessModalProps {
	isOpen: boolean;
	title: string;
	message: string;
	details?: string;
	onClose: () => void;
	primaryAction?: {
		label: string;
		onClick: () => void;
	};
}

export default function SuccessModal({
	isOpen,
	title,
	message,
	details,
	onClose,
	primaryAction,
}: SuccessModalProps) {
	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						className="bg-obsidian-50 border border-catalyst-400/30 rounded-2xl p-8 max-w-lg w-full shadow-2xl"
					>
						<div className="text-center mb-6">
							<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-catalyst-400/20 mb-4">
								<svg
									className="w-8 h-8 text-catalyst-400"
									fill="none"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path d="M5 13l4 4L19 7"></path>
								</svg>
							</div>
							<h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
							<p className="text-gray-300 mb-2">{message}</p>
							{details && (
								<p className="text-sm text-gray-400">{details}</p>
							)}
						</div>

						<div className="flex gap-3 justify-center">
							{primaryAction && (
								<button
									onClick={primaryAction.onClick}
									className="px-6 py-2 bg-ion-600 hover:bg-ion-500 rounded-lg text-white font-medium transition-colors"
								>
									{primaryAction.label}
								</button>
							)}
							<button
								onClick={onClose}
								className="px-6 py-2 bg-obsidian-100 hover:bg-obsidian-200 border border-obsidian-200 rounded-lg text-gray-300 hover:text-white transition-colors"
							>
								Close
							</button>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
