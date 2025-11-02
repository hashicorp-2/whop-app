"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@whop/react/components";

export default function TrendToProductApp() {
	const [trend, setTrend] = useState("");
	const [productKit, setProductKit] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	const handleGenerate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!trend.trim()) return;

		setIsLoading(true);
		setError(null);
		setProductKit(null);

		try {
			const response = await fetch("/api/generate-kit", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ trend }),
			});

			if (!response.ok) {
				throw new Error("Failed to generate product kit");
			}

			const data = await response.json();
			setProductKit(data);
		} catch (err) {
			setError("Failed to generate product kit. Please try again.");
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDownload = () => {
		if (!productKit?.productContent) return;
		
		const blob = new Blob([productKit.productContent], { type: "text/markdown" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${productKit.productName.replace(/[^a-z0-9]/gi, "_")}.md`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const handleCopy = () => {
		if (!productKit?.whopListingCopy) return;
		
		navigator.clipboard.writeText(productKit.whopListingCopy).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-5xl font-bold text-gray-900 mb-3">
						💰 The Money Printer
					</h1>
					<p className="text-xl text-gray-700">
						Turn any trend into a ready-to-sell product in 60 seconds
					</p>
				</div>

				{/* Input Form */}
				<div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
					<form onSubmit={handleGenerate} className="max-w-2xl mx-auto">
						<div className="flex gap-4">
							<input
								type="text"
								value={trend}
								onChange={(e) => setTrend(e.target.value)}
								placeholder="Enter a trending keyword... (e.g., 'AI Christmas carols', '2024 Notion habit tracker')"
								className="flex-1 px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
								disabled={isLoading}
							/>
							<Button
								type="submit"
								variant="classic"
								size="4"
								disabled={isLoading || !trend.trim()}
								className="px-8"
							>
								{isLoading ? "🔄 Generating..." : "🚀 Generate Kit"}
							</Button>
						</div>
					</form>

					{error && (
						<div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
							{error}
						</div>
					)}
				</div>

				{/* Loading State */}
				{isLoading && (
					<div className="bg-white rounded-2xl shadow-xl p-12 text-center">
						<div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
						<p className="text-xl text-gray-700">
							Your product kit is being generated...
						</p>
					</div>
				)}

				{/* Output Display */}
				{productKit && !isLoading && (
					<div className="grid md:grid-cols-2 gap-6">
						{/* Left Panel: Product Content */}
						<div className="bg-white rounded-2xl shadow-xl p-8">
							<div className="flex justify-between items-center mb-6">
								<h2 className="text-2xl font-bold text-gray-900">
									📦 Your Product Content
								</h2>
								<Button
									variant="classic"
									size="3"
									onClick={handleDownload}
									className="px-6"
								>
									⬇️ Download
								</Button>
							</div>
							
							<div className="prose prose-sm max-w-none overflow-y-auto max-h-[600px] p-4 bg-gray-50 rounded-lg">
								<ReactMarkdown
									components={{
										h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4 text-gray-900" {...props} />,
										h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-6 mb-3 text-gray-900" {...props} />,
										h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800" {...props} />,
										p: ({ node, ...props }) => <p className="mb-3 text-gray-700" {...props} />,
										ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-3 text-gray-700" {...props} />,
										li: ({ node, ...props }) => <li className="mb-1" {...props} />,
									}}
								>
									{productKit.productContent}
								</ReactMarkdown>
							</div>
						</div>

						{/* Right Panel: Whop Listing */}
						<div className="bg-white rounded-2xl shadow-xl p-8">
							<div className="flex justify-between items-center mb-6">
								<h2 className="text-2xl font-bold text-gray-900">
									🛒 Your Whop Listing
								</h2>
								<Button
									variant="classic"
									size="3"
									onClick={handleCopy}
									className="px-6"
								>
									{copied ? "✓ Copied!" : "📋 Copy"}
								</Button>
							</div>
							
							<div className="prose prose-sm max-w-none overflow-y-auto max-h-[600px] p-4 bg-gray-50 rounded-lg">
								<ReactMarkdown
									components={{
										h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-4 text-gray-900" {...props} />,
										h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800" {...props} />,
										p: ({ node, ...props }) => <p className="mb-3 text-gray-700" {...props} />,
										ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-3 text-gray-700" {...props} />,
										li: ({ node, ...props }) => <li className="mb-1" {...props} />,
									}}
								>
									{productKit.whopListingCopy}
								</ReactMarkdown>
							</div>
						</div>
					</div>
				)}

				{/* Empty State */}
				{!productKit && !isLoading && (
					<div className="bg-white rounded-2xl shadow-xl p-12 text-center">
						<div className="text-6xl mb-4">🎯</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-2">
							Ready to Print Money?
						</h3>
						<p className="text-gray-700">
							Enter a trending keyword above and watch the magic happen
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
