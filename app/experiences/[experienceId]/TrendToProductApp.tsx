"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@whop/react/components";
import { useAuth, useSubscription, logout, useUserProfile } from "@/lib/supabase-client";
import ProTierPaywall from "@/components/ProTierPaywall";
import { useRouter } from "next/navigation";
import Paywall from "@/components/Paywall";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import PublishSuccessModal from "@/components/PublishSuccessModal";
import WhopCredentialsForm from "@/components/WhopCredentialsForm";
import { motion, AnimatePresence } from "framer-motion";

export default function TrendToProductApp() {
	const { user, loading: authLoading } = useAuth();
	const { isSubscribed, loading: subLoading } = useSubscription();
	const { profile, loading: profileLoading } = useUserProfile();
	const router = useRouter();
	const [input, setInput] = useState("");
	const [productKit, setProductKit] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [publishing, setPublishing] = useState(false);
	const [publishSuccess, setPublishSuccess] = useState<any>(null);
	const [showCredentialsForm, setShowCredentialsForm] = useState(false);
	const [whopCredentials, setWhopCredentials] = useState({ apiKey: "", storeId: "", communityId: "" });
	const [copiedItem, setCopiedItem] = useState<string | null>(null);
	const [loggingOut, setLoggingOut] = useState(false);
	const [showVariations, setShowVariations] = useState({ tweet: false, videoScript: false });
	const [analyzingTrends, setAnalyzingTrends] = useState(false);
	const [trendsAnalysis, setTrendsAnalysis] = useState<any>(null);
	const [selectedTrendForGeneration, setSelectedTrendForGeneration] = useState<string | null>(null);
	const [showPaywall, setShowPaywall] = useState(false);



	const whopAppUrl = process.env.NEXT_PUBLIC_WHOP_APP_URL || "https://whop.com/marketplace/your-app-url";

	const handleLogout = async () => {
		setLoggingOut(true);
		await logout();
		router.push("/login");
	};

	const ENABLE_AUTH = false;

	if (ENABLE_AUTH) {
		if (authLoading || subLoading) {
			return (
				<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl shadow-xl p-12 text-center">
						<div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
						<p className="text-xl text-gray-700">Loading...</p>
					</div>
				</div>
			);
		}

		if (!user || !isSubscribed) {
			return <Paywall whopListingUrl={whopAppUrl} />;
		}
	}

		const handleGenerate = async (e: React.FormEvent) => {
		// This is deprecated - form now uses handleAnalyzeTrends
		e.preventDefault();
	};

	const handleAnalyzeTrends = async () => {
		if (!input.trim()) return;

		setAnalyzingTrends(true);
		setError(null);
		setTrendsAnalysis(null);
		setProductKit(null);

		try {
			const response = await fetch("/api/analyze-trends", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ niche: input }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				if (errorData.error === "TRIAL_EXPIRED") {
					setShowPaywall(true);
					setError(null);
					return;
				}
				throw new Error(errorData.error || "Failed to analyze trends");
			}

			const data = await response.json();
			setTrendsAnalysis(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to analyze trends. Please try again.");
			console.error(err);
		} finally {
			setAnalyzingTrends(false);
		}
	};

	const handleGenerateFromTrend = async (trendName: string) => {
		console.log("[TrendToProductApp] ⚡ Generating from trend:", trendName);
		setSelectedTrendForGeneration(trendName);
		setIsLoading(true);
		setError(null);
		setProductKit(null);
		setCopiedItem(null);

		try {
			// Use the new structured endpoint
			const response = await fetch("/api/generate-blueprint", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					trend_summary: trendName,
					user_goal: "Sell Knowledge", // Default goal
					product_type: "ebook", // Default product type
				}),
			});

			console.log("[TrendToProductApp] Response status:", response.status);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || "Failed to generate product blueprint");
			}

			const data = await response.json();
			console.log("[TrendToProductApp] ✅ Received data:", {
				hasProductBlueprint: !!data.product_blueprint,
				hasMarketingPlaybook: !!data.marketing_playbook,
			});

			// Transform the structured data to match the old format for compatibility
			setProductKit({
				productName: data.product_blueprint?.product_title || "Product",
				productContent: `# ${data.product_blueprint?.product_title || "Product"}\n\n${data.product_blueprint?.core_concept || ""}\n\n## Problem Solved\n\n${data.product_blueprint?.problem_solved || ""}\n\n## Key Features\n\n${(data.product_blueprint?.key_features || []).map((f: string) => `- ${f}`).join('\n')}\n\n## Marketing Playbook\n\n### Tagline\n${data.marketing_playbook?.tagline || ""}\n\n### Core Hooks\n${(data.marketing_playbook?.core_hooks || []).map((h: string) => `- ${h}`).join('\n')}`,
				selectedTrend: trendName,
				rawBlueprint: data, // Store full structured data
			});
			setSelectedTrendForGeneration(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to generate product kit. Please try again.");
			console.error("[TrendToProductApp] Error:", err);
			setSelectedTrendForGeneration(null);
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

	const handleCopy = (text: string, id: string) => {
		navigator.clipboard.writeText(text).then(() => {
			setCopiedItem(id);
			setTimeout(() => setCopiedItem(null), 2000);
		});
	};

	const handlePublishToWhop = async () => {
		if (!productKit) return;

		if (!whopCredentials.apiKey || !whopCredentials.storeId) {
			setShowCredentialsForm(true);
			return;
		}

		setPublishing(true);
		setError(null);

		try {
			const response = await fetch("/api/publish-to-whop", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					launchKit: productKit,
					whopApiKey: whopCredentials.apiKey,
					whopStoreId: whopCredentials.storeId,
					whopCommunityId: whopCredentials.communityId || undefined,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to publish to Whop");
			}

			const data = await response.json();
			setPublishSuccess(data);
			setShowCredentialsForm(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to publish to Whop. Please try again.");
			console.error(err);
		} finally {
			setPublishing(false);
		}
	};

	const handleSaveCredentials = (apiKey: string, storeId: string, communityId?: string) => {
		setWhopCredentials({ apiKey, storeId, communityId: communityId || "" });
		setShowCredentialsForm(false);
	};





	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
			<div className="max-w-7xl mx-auto">
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="text-center mb-8"
				>
					<div className="flex justify-between items-center mb-6">
								<div className="flex items-center gap-4">
									{profile && (
										<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-4 py-2 border border-blue-200">
											<span className="text-sm font-semibold text-gray-700">
												{profile.launchesRemaining === -1 ? (
													<span className="text-green-600">∞ Unlimited Launches</span>
												) : (
													<span>🚀 Launches Remaining: <span className="font-bold text-blue-600">{profile.launchesRemaining}</span></span>
												)}
											</span>
											{profile.subscriptionTier !== 'free' && (
												<span className="ml-2 text-xs text-gray-600">({profile.subscriptionTier.charAt(0).toUpperCase() + profile.subscriptionTier.slice(1)} Tier)</span>
											)}
										</div>
									)}
								</div>
								<h1 className="text-5xl font-bold text-gray-900">
									🚀 Launchpad
								</h1>
								<div className="flex items-center gap-4">
									{user && <span className="text-sm text-gray-600">{user.email}</span>}
									{ENABLE_AUTH && (
										<Button variant="classic" size="2" onClick={handleLogout} disabled={loggingOut} className="px-4">
											{loggingOut ? "..." : "Logout"}
										</Button>
									)}
								</div>
							</div>
					<p className="text-xl text-gray-700">
						Turn any niche into a ready-to-sell product in under 5 minutes
					</p>
					<p className="text-sm text-gray-600 mt-2">
						Powered by Athena AI Agent
					</p>
				</motion.div>

				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.1 }}
					className="bg-white rounded-2xl shadow-xl p-8 mb-8"
				>
					<form onSubmit={(e) => { e.preventDefault(); handleAnalyzeTrends(); }} className="max-w-2xl mx-auto">
						<div className="flex gap-4">
							<input
								type="text"
								id="niche-input"
								name="niche"
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder="Enter your niche... (e.g., 'Fitness Coaching', 'Notion Templates')"
								className="flex-1 px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all"
								disabled={analyzingTrends || isLoading}
								autoComplete="off"
							/>
							<Button
								type="submit"
								variant="classic"
								size="4"
								disabled={analyzingTrends || isLoading || !input.trim()}
								className="px-8 transition-transform hover:scale-105"
							>
								{analyzingTrends ? "🔮 Analyzing..." : "🔮 Oracle Analysis"}
							</Button>
						</div>
					</form>

					{error && (
						<motion.div 
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"
						>
							{error}
						</motion.div>
					)}
				</motion.div>

								{trendsAnalysis && trendsAnalysis.trends && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="mb-8"
					>
						<div className="bg-white rounded-2xl shadow-xl p-8">
							<h2 className="text-2xl font-bold text-gray-900 mb-6">
								🔮 Oracle Trend Analysis
							</h2>
							<p className="text-gray-600 mb-6">
								Found {trendsAnalysis.trends.length} trends ranked by Market Potential Score
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{trendsAnalysis.trends.map((trend: any, index: number) => (
									<div key={index} className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 transition-all">
										<div className="flex justify-between items-start mb-4">
											<h3 className="text-lg font-bold text-gray-900 flex-1">{trend.trendName}</h3>
											<div className="text-right">
												<div className="text-2xl font-bold text-blue-600">{trend.marketPotentialScore}</div>
												<div className="text-xs text-gray-500">/100</div>
											</div>
										</div>
										<div className="mb-3">
											<div className="w-full bg-gray-200 rounded-full h-3 mb-2">
												<div 
													className={`h-3 rounded-full transition-all ${
														trend.marketPotentialScore >= 70 ? 'bg-green-600' :
														trend.marketPotentialScore >= 50 ? 'bg-yellow-500' :
														'bg-red-500'
													}`}
													style={{ width: `${trend.marketPotentialScore}%` }}
												></div>
											</div>
										</div>
										<p className="text-sm text-gray-600 mb-2">{trend.whyItMatters}</p>
										<p className="text-xs text-blue-600 italic mb-4">{trend.scoreJustification}</p>
										<div className="flex gap-2 text-xs text-gray-500 mb-4">
											<span>Monetization: {trend.monetizationPotential}</span>
											<span>•</span>
											<span>Competition: {trend.competitionLevel}</span>
										</div>
										<Button
											variant="classic"
											size="3"
											onClick={() => handleGenerateFromTrend(trend.trendName)}
											disabled={isLoading || selectedTrendForGeneration === trend.trendName}
											className="w-full"
										>
											{selectedTrendForGeneration === trend.trendName ? "🔄 Generating..." : "🚀 Launch This Trend"}
										</Button>
									</div>
								))}
							</div>
						</div>
					</motion.div>
				)}

				\{isLoading && (
					<div className="bg-white rounded-2xl shadow-xl p-12">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="text-center"
						>
							<motion.div
								animate={{ rotate: 360 }}
								transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
								className="inline-block rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"
							></motion.div>
							<p className="text-xl text-gray-700 mb-2">Athena is analyzing trends...</p>
							<p className="text-sm text-gray-600">This may take 30-60 seconds</p>
						</motion.div>
					</div>
				)}

				<AnimatePresence>
					{productKit && !isLoading && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.5 }}
							className="space-y-6"
						>
							{productKit.selectedTrend && (
								<div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 text-center">
									<p className="text-sm text-blue-600 font-semibold mb-2">✨ Selected Trend by Athena</p>
									<p className="text-2xl font-bold text-gray-900">{productKit.selectedTrend}</p>
								</div>
							)}

							<div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 text-center">
								<h3 className="text-xl font-bold text-gray-900 mb-4">
									🚀 Ready to Launch?
								</h3>
								<Button
									variant="classic"
									size="4"
									onClick={handlePublishToWhop}
									disabled={publishing}
									className="px-8 bg-green-600 hover:bg-green-700 transition-transform hover:scale-105"
								>
									{publishing ? "🔄 Publishing..." : "✨ Publish to Whop"}
								</Button>
								{showCredentialsForm && (
									<div className="mt-4">
										<WhopCredentialsForm
											onSubmit={handleSaveCredentials}
											initialApiKey={whopCredentials.apiKey}
											initialStoreId={whopCredentials.storeId}
										/>
									</div>
								)}
							</div>

							<div className="bg-white rounded-2xl shadow-xl p-8">
								<Tabs defaultValue="product">
									<TabsList className="mb-6">
										<TabsTrigger value="product">📦 Product</TabsTrigger>
										<TabsTrigger value="marketing">📢 Marketing</TabsTrigger>
										{productKit.heroImageURL && (
											<TabsTrigger value="visuals">🎨 Visuals</TabsTrigger>
										)}
									</TabsList>

									<TabsContent value="product" className="space-y-4">
										{productKit.rawBlueprint?.product_blueprint ? (
											<div className="space-y-6">
												<div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
													<h3 className="text-2xl font-bold text-gray-900 mb-3">
														{productKit.rawBlueprint.product_blueprint.product_title}
													</h3>
													<p className="text-gray-700 mb-4">{productKit.rawBlueprint.product_blueprint.core_concept}</p>
												</div>
												
												<div className="p-6 bg-gray-50 rounded-lg">
													<h4 className="text-lg font-bold text-gray-900 mb-3">Problem Solved</h4>
													<p className="text-gray-700 mb-4">{productKit.rawBlueprint.product_blueprint.problem_solved}</p>
												</div>

												<div className="p-6 bg-gray-50 rounded-lg">
													<h4 className="text-lg font-bold text-gray-900 mb-3">Primary Audience</h4>
													<p className="text-gray-700 mb-4">{productKit.rawBlueprint.product_blueprint.primary_audience}</p>
												</div>

												<div className="p-6 bg-gray-50 rounded-lg">
													<h4 className="text-lg font-bold text-gray-900 mb-3">Key Features</h4>
													<ul className="list-disc pl-6 space-y-2 text-gray-700">
														{(productKit.rawBlueprint.product_blueprint.key_features || []).map((feature: string, i: number) => (
															<li key={i}>{feature}</li>
														))}
													</ul>
												</div>

												<div className="p-6 bg-gray-50 rounded-lg">
													<h4 className="text-lg font-bold text-gray-900 mb-3">Value Proposition</h4>
													<p className="text-gray-700 mb-4">{productKit.rawBlueprint.product_blueprint.value_proposition}</p>
												</div>

												<div className="p-6 bg-gray-50 rounded-lg">
													<h4 className="text-lg font-bold text-gray-900 mb-3">Business Model & Pricing</h4>
													<p className="text-gray-700 mb-4">{productKit.rawBlueprint.product_blueprint.business_model_pricing}</p>
												</div>
											</div>
										) : (
											<div className="p-6 bg-gray-50 rounded-lg">
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
										)}
										<Button variant="classic" onClick={handleDownload} className="w-full">
											⬇️ Download as Markdown
										</Button>
									</TabsContent>

									<TabsContent value="marketing" className="space-y-4">
										{productKit.rawBlueprint?.marketing_playbook ? (
											<div className="space-y-6">
												<div className="p-6 bg-green-50 rounded-lg border border-green-200">
													<h3 className="text-xl font-bold text-gray-900 mb-3">Tagline</h3>
													<p className="text-lg text-gray-700">{productKit.rawBlueprint.marketing_playbook.tagline}</p>
												</div>

												<div className="p-6 bg-gray-50 rounded-lg">
													<h4 className="text-lg font-bold text-gray-900 mb-3">Core Hooks</h4>
													<ul className="list-disc pl-6 space-y-2 text-gray-700">
														{(productKit.rawBlueprint.marketing_playbook.core_hooks || []).map((hook: string, i: number) => (
															<li key={i}>{hook}</li>
														))}
													</ul>
												</div>

												<div className="p-6 bg-gray-50 rounded-lg">
													<h4 className="text-lg font-bold text-gray-900 mb-3">Launch Channels</h4>
													<ul className="list-disc pl-6 space-y-2 text-gray-700">
														{(productKit.rawBlueprint.marketing_playbook.launch_channels || []).map((channel: string, i: number) => (
															<li key={i}>{channel}</li>
														))}
													</ul>
												</div>

												<div className="p-6 bg-gray-50 rounded-lg">
													<h4 className="text-lg font-bold text-gray-900 mb-3">Email Sequence</h4>
													<div className="space-y-4">
														{(productKit.rawBlueprint.marketing_playbook.email_sequence || []).map((email: any, i: number) => (
															<div key={i} className="p-4 bg-white rounded-lg border border-gray-200">
																<p className="font-semibold text-gray-900 mb-1">Subject: {email.subject}</p>
																<p className="text-gray-700">{email.body}</p>
															</div>
														))}
													</div>
												</div>

												<div className="p-6 bg-gray-50 rounded-lg">
													<h4 className="text-lg font-bold text-gray-900 mb-3">Ad Copy Samples</h4>
													<div className="space-y-3">
														{(productKit.rawBlueprint.marketing_playbook.ad_copy_samples || []).map((ad: any, i: number) => (
															<div key={i} className="p-4 bg-white rounded-lg border border-gray-200">
																<p className="font-semibold text-gray-900 mb-1">{ad.headline}</p>
																<p className="text-gray-700">CTA: {ad.cta}</p>
															</div>
														))}
													</div>
												</div>
											</div>
										) : (
											productKit.winningAssets?.tweet ? (
												<div className="border-2 border-green-200 bg-green-50 rounded-xl p-6">
													<div className="flex justify-between items-start mb-3">
														<div className="flex-1">
															<div className="flex items-center gap-2 mb-2">
																<h3 className="text-lg font-bold text-gray-900">🐦 Twitter/X Tweet</h3>
																<span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
																	⚔️ Battle-Tested Winner
																</span>
															</div>
															{productKit.winningAssets.tweet.scores && (
																<div className="text-xs text-gray-600 mb-2">
																	Score: {productKit.winningAssets.tweet.scores[productKit.winningAssets.tweet.winner]?.average?.toFixed(1) || 'N/A'}/10 | 
																	Variation {productKit.winningAssets.tweet.winner} won
																</div>
															)}
														</div>
														<Button 
															variant="classic" 
															size="2" 
															onClick={() => handleCopy(productKit.winningAssets.tweet.content, 'tweet')}
														>
															{copiedItem === 'tweet' ? "✓" : "Copy"}
														</Button>
													</div>
													<p className="text-gray-900 font-medium whitespace-pre-wrap mb-3">{productKit.winningAssets.tweet.content}</p>
													{productKit.winningAssets.tweet.reasoning && (
														<p className="text-xs text-green-700 italic mb-2">"{productKit.winningAssets.tweet.reasoning}"</p>
													)}
													<button
														onClick={() => setShowVariations({...showVariations, tweet: !showVariations.tweet})}
														className="text-xs text-blue-600 hover:text-blue-800"
													>
														{showVariations.tweet ? 'Hide' : 'Show'} All Variations
													</button>
													{showVariations.tweet && productKit.winningAssets.tweet.allVariations && (
														<div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
															<div className="text-sm font-semibold text-gray-700 mb-2">All Variations:</div>
															{Object.entries(productKit.winningAssets.tweet.allVariations).map(([key, value]: [string, any]) => (
																<div key={key} className={`p-3 rounded-lg ${key === productKit.winningAssets.tweet.winner ? 'bg-green-100 border-2 border-green-300' : 'bg-gray-50 border border-gray-200'}`}>
																	<div className="flex justify-between items-start mb-1">
																		<span className="text-xs font-semibold text-gray-600">
																			Variation {key} {key === productKit.winningAssets.tweet.winner && '🏆'}
																		</span>
																		{productKit.winningAssets.tweet.scores?.[key] && (
																			<span className="text-xs text-gray-500">
																				Avg: {productKit.winningAssets.tweet.scores[key].average?.toFixed(1)}
																			</span>
																		)}
																	</div>
																	<p className="text-sm text-gray-700">{value}</p>
																</div>
															))}
														</div>
													)}
												</div>
											) : productKit.marketingAssets?.tweet ? (
												<div className="border border-gray-200 rounded-xl p-6">
													<div className="flex justify-between items-center mb-3">
														<h3 className="text-lg font-bold text-gray-900">🐦 Twitter/X Tweet</h3>
														<Button 
															variant="classic" 
															size="2" 
															onClick={() => handleCopy(productKit.marketingAssets.tweet, 'tweet')}
														>
															{copiedItem === 'tweet' ? "✓" : "Copy"}
														</Button>
													</div>
													<p className="text-gray-700 whitespace-pre-wrap">{productKit.marketingAssets.tweet}</p>
												</div>
											) : (
												<div className="p-6 bg-gray-50 rounded-lg">
													<p className="text-gray-600">No marketing content available yet.</p>
												</div>
											)
										)}

										{productKit.winningAssets?.videoScript ? (
											<div className="border-2 border-green-200 bg-green-50 rounded-xl p-6">
												<div className="flex justify-between items-start mb-3">
													<div className="flex-1">
														<div className="flex items-center gap-2 mb-2">
															<h3 className="text-lg font-bold text-gray-900">🎬 Video Script</h3>
															<span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
																⚔️ Battle-Tested Winner
															</span>
														</div>
														{productKit.winningAssets.videoScript.scores && (
															<div className="text-xs text-gray-600 mb-2">
																Score: {productKit.winningAssets.videoScript.scores[productKit.winningAssets.videoScript.winner]?.average?.toFixed(1) || 'N/A'}/10 | 
																Variation {productKit.winningAssets.videoScript.winner} won
															</div>
														)}
													</div>
													<Button 
														variant="classic" 
														size="2" 
														onClick={() => handleCopy(productKit.winningAssets.videoScript.content, 'video')}
													>
														{copiedItem === 'video' ? "✓" : "Copy"}
													</Button>
												</div>
												<p className="text-gray-900 font-medium whitespace-pre-wrap mb-3">{productKit.winningAssets.videoScript.content}</p>
												{productKit.winningAssets.videoScript.reasoning && (
													<p className="text-xs text-green-700 italic mb-2">"{productKit.winningAssets.videoScript.reasoning}"</p>
												)}
												<button
													onClick={() => setShowVariations({...showVariations, videoScript: !showVariations.videoScript})}
													className="text-xs text-blue-600 hover:text-blue-800"
												>
													{showVariations.videoScript ? 'Hide' : 'Show'} All Variations
												</button>
												{showVariations.videoScript && productKit.winningAssets.videoScript.allVariations && (
													<div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
														<div className="text-sm font-semibold text-gray-700 mb-2">All Variations:</div>
														{Object.entries(productKit.winningAssets.videoScript.allVariations).map(([key, value]: [string, any]) => (
															<div key={key} className={`p-3 rounded-lg ${key === productKit.winningAssets.videoScript.winner ? 'bg-green-100 border-2 border-green-300' : 'bg-gray-50 border border-gray-200'}`}>
																<div className="flex justify-between items-start mb-1">
																	<span className="text-xs font-semibold text-gray-600">
																		Variation {key} {key === productKit.winningAssets.videoScript.winner && '🏆'}
																	</span>
																	{productKit.winningAssets.videoScript.scores?.[key] && (
																		<span className="text-xs text-gray-500">
																			Avg: {productKit.winningAssets.videoScript.scores[key].average?.toFixed(1)}
																		</span>
																	)}
																</div>
																<p className="text-sm text-gray-700 whitespace-pre-wrap">{value}</p>
															</div>
														))}
													</div>
												)}
											</div>
										) : productKit.marketingAssets?.videoScript && (
											<div className="border border-gray-200 rounded-xl p-6">
												<div className="flex justify-between items-center mb-3">
													<h3 className="text-lg font-bold text-gray-900">🎬 Video Script</h3>
													<Button 
														variant="classic" 
														size="2" 
														onClick={() => handleCopy(productKit.marketingAssets.videoScript, 'video')}
													>
														{copiedItem === 'video' ? "✓" : "Copy"}
													</Button>
												</div>
												<p className="text-gray-700 whitespace-pre-wrap">{productKit.marketingAssets.videoScript}</p>
											</div>
										)}

										{productKit.marketingAssets?.blogPostOutline && (
											<div className="border border-gray-200 rounded-xl p-6">
												<div className="flex justify-between items-center mb-3">
													<h3 className="text-lg font-bold text-gray-900">📝 Blog Outline</h3>
													<Button 
														variant="classic" 
														size="2" 
														onClick={() => handleCopy(productKit.marketingAssets.blogPostOutline, 'blog')}
													>
														{copiedItem === 'blog' ? "✓" : "Copy"}
													</Button>
												</div>
												<div className="prose prose-sm max-w-none">
													<ReactMarkdown>{productKit.marketingAssets.blogPostOutline}</ReactMarkdown>
												</div>
											</div>
										)}

										{productKit.whopListing && (
											<div className="border border-gray-200 rounded-xl p-6">
												<div className="flex justify-between items-center mb-3">
													<h3 className="text-lg font-bold text-gray-900">🛒 Whop Listing</h3>
													<Button 
														variant="classic" 
														size="2" 
														onClick={() => handleCopy(JSON.stringify(productKit.whopListing, null, 2), 'listing')}
													>
														{copiedItem === 'listing' ? "✓" : "Copy"}
													</Button>
												</div>
												<div className="space-y-2">
													<p className="text-sm font-semibold text-gray-900">{productKit.whopListing.title}</p>
													<p className="text-gray-700">{productKit.whopListing.description}</p>
													<p className="text-xs text-gray-600">Tags: {productKit.whopListing.tags?.join(', ')}</p>
												</div>
											</div>
										)}
									</TabsContent>

									{productKit.heroImageURL && (
										<TabsContent value="visuals" className="text-center">
											<div className="relative inline-block">
												<motion.img 
													src={productKit.heroImageURL} 
													alt={productKit.productName}
													initial={{ scale: 0.95, opacity: 0 }}
													animate={{ scale: 1, opacity: 1 }}
													transition={{ duration: 0.5 }}
													className="w-full max-w-3xl mx-auto rounded-2xl shadow-2xl"
												/>
											</div>
										</TabsContent>
									)}
								</Tabs>
							</div>

							{productKit.stats && (
								<div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 text-center">
									<p className="text-sm text-gray-600 mb-2">Your Generation Stats</p>
									<div className="flex justify-center gap-8">
										<div>
											<p className="text-2xl font-bold text-blue-600">{productKit.stats.totalGenerations}</p>
											<p className="text-xs text-gray-600">Total</p>
										</div>
										<div>
											<p className="text-2xl font-bold text-indigo-600">{productKit.stats.monthlyGenerations}</p>
											<p className="text-xs text-gray-600">This Month</p>
										</div>
									</div>
								</div>
							)}
						</motion.div>
					)}
				</AnimatePresence>

				{!productKit && !isLoading && (
					<motion.div 
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="bg-white rounded-2xl shadow-xl p-12 text-center"
					>
						<div className="text-6xl mb-4">🎯</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Print Money?</h3>
						<p className="text-gray-700">Enter your niche and Athena will find the best trend for you</p>
					</motion.div>
				)}
			</div>
			
			<PublishSuccessModal
				isOpen={!!publishSuccess}
				onClose={() => setPublishSuccess(null)}
				productUrl={publishSuccess?.product?.url}
				postUrl={publishSuccess?.post?.url}
				productName={publishSuccess?.product?.name}
			/>
		</div>
	);
}
