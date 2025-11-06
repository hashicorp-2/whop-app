"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@whop/react/components";

interface PublishSuccessModalProps {
	isOpen: boolean;
	onClose: () => void;
	productUrl?: string;
	postUrl?: string;
	productName?: string;
}

export default function PublishSuccessModal({
	isOpen,
	onClose,
	productUrl,
	postUrl,
	productName,
}: PublishSuccessModalProps) {
	if (!isOpen) return null;

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
					>
						{/* Modal */}
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							onClick={(e) => e.stopPropagation()}
							className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative"
						>
							{/* Close button */}
							<button
								onClick={onClose}
								className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>

							{/* Success Icon */}
							<div className="text-center mb-6">
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ delay: 0.2, type: "spring" }}
									className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
								>
									<svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</motion.div>
								<h2 className="text-3xl font-bold text-gray-900 mb-2">
									🚀 Launch Successful!
								</h2>
								<p className="text-gray-600">
									Your product has been published to Whop
								</p>
							</div>

							{/* Content */}
							<div className="space-y-4 mb-6">
								{productName && (
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
										<p className="text-sm text-blue-600 font-semibold mb-1">Product Name</p>
										<p className="text-lg text-gray-900">{productName}</p>
									</div>
								)}

								{productUrl && (
									<div className="border border-gray-200 rounded-lg p-4">
										<p className="text-sm text-gray-600 font-semibold mb-2">Your Product is Live:</p>
										<a
											href={productUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-600 hover:text-blue-800 hover:underline break-all"
										>
											{productUrl}
										</a>
									</div>
								)}

								{postUrl && (
									<div className="border border-gray-200 rounded-lg p-4">
										<p className="text-sm text-gray-600 font-semibold mb-2">Community Announcement (Draft):</p>
										<a
											href={postUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-600 hover:text-blue-800 hover:underline break-all"
										>
											{postUrl}
										</a>
										<p className="text-xs text-gray-500 mt-2">
											Review and publish when ready
										</p>
									</div>
								)}
							</div>

							{/* Actions */}
							<div className="flex gap-4">
								{productUrl && (
									<Button
										variant="classic"
										size="4"
										className="flex-1"
										onClick={() => window.open(productUrl, '_blank')}
									>
										View Product →
									</Button>
								)}
								<Button
									variant="classic"
									size="4"
									className="flex-1"
									onClick={onClose}
								>
									Close
								</Button>
							</div>
						</motion.div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
