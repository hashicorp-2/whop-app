"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TrendRadar from "@/components/trends/TrendRadar";
import GoalIntakeModal from "@/components/GoalIntakeModal";
import ProductIdeaPanel from "@/components/ProductIdeaPanel";
import BlueprintDisplay from "@/components/BlueprintDisplay";
import ProductBlueprintDisplay from "@/components/ProductBlueprintDisplay";
import SimpleBlueprintDisplay from "@/components/SimpleBlueprintDisplay";
import CampaignDeployment from "@/components/CampaignDeployment";
import EmptyState from "@/components/EmptyState";
import SuccessModal from "@/components/SuccessModal";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useAuth } from "@/lib/supabase-client";
import Sidebar from "@/components/Sidebar";
import { DominanceDossier, validateDominanceDossier, ProductConcept } from "@/types/dominance";

type UserGoal = "Build App" | "Create Content" | "Sell Knowledge" | "Run Agency";

export default function DashboardPage() {
	const { user, loading: authLoading } = useAuth();
	const [userGoal, setUserGoal] = useState<UserGoal | null>(null);
	const [showGoalModal, setShowGoalModal] = useState(false);
	const [selectedTrend, setSelectedTrend] = useState<any>(null);
	const [selectedProductType, setSelectedProductType] = useState<string | null>(null);
	const [productIdeas, setProductIdeas] = useState<ProductConcept | null>(null);
	const [dominanceDossier, setDominanceDossier] = useState<DominanceDossier | null>(null);
	const [blueprint, setBlueprint] = useState<any>(null);
	const [structuredBlueprint, setStructuredBlueprint] = useState<any>(null); // New structured format
	const [campaignAssets, setCampaignAssets] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const [generatingIdeas, setGeneratingIdeas] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<{ title: string; message: string } | null>(null);
	const [showDebug, setShowDebug] = useState(false);

	// Check for user goal on mount
	useEffect(() => {
		if (user && !authLoading) {
			fetchUserGoal();
		}
	}, [user, authLoading]);

	const fetchUserGoal = async () => {
		try {
			const response = await fetch("/api/user-goals");
			if (response.ok) {
				const data = await response.json();
				console.log("[Dashboard] User goal fetched:", data);
				if (data.primaryGoal) {
					setUserGoal(data.primaryGoal as UserGoal);
					console.log("[Dashboard] ✅ User goal set to:", data.primaryGoal);
				} else {
					console.log("[Dashboard] No user goal, showing modal");
					setShowGoalModal(true);
				}
			} else {
				console.warn("[Dashboard] Failed to fetch user goal, status:", response.status);
				// Set a default goal for testing
				setUserGoal("Sell Knowledge");
			}
		} catch (err) {
			console.error("Failed to fetch user goal:", err);
			// Set a default goal for testing
			setUserGoal("Sell Knowledge");
		}
	};

	const handleGoalComplete = (goal: UserGoal) => {
		setUserGoal(goal);
		setShowGoalModal(false);
	};

		const handleTrendSelect = useCallback((trend: any) => {
		console.log("[Dashboard] ⚡ TREND CLICKED:", trend?.topic);
		setSelectedTrend(trend);
		setProductIdeas(null);
		setDominanceDossier(null);
		setBlueprint(null);
		setStructuredBlueprint(null);
		setCampaignAssets(null);
		setError(null);

		// Auto-select first product type if personalized
		let productType = "App"; // default
		if (trend?.personalization?.potentialProducts?.[0]) {
			productType = trend.personalization.potentialProducts[0].type;
			console.log("[Dashboard] Auto-selecting product type:", productType);
		} else {
			console.log("[Dashboard] Auto-selecting default product type: App");
		}
		setSelectedProductType(productType);
	}, []);

	const handleGenerateIdeas = useCallback(async () => {
		console.log("[Dashboard] handleGenerateIdeas called with:", {
			hasTrend: !!selectedTrend,
			hasProductType: !!selectedProductType,
			hasGoal: !!userGoal,
			trend: selectedTrend?.topic,
			productType: selectedProductType,
			goal: userGoal,
		});

		if (!selectedTrend || !selectedProductType || !userGoal) {
			console.error("[Dashboard] ❌ Cannot generate - missing:", {
				hasTrend: !!selectedTrend,
				hasProductType: !!selectedProductType,
				hasGoal: !!userGoal,
			});
			setError(`Missing required fields: ${!selectedTrend ? 'Trend ' : ''}${!selectedProductType ? 'Product Type ' : ''}${!userGoal ? 'Goal' : ''}`);
			return;
		}

		console.log("[Dashboard] ===== STARTING GENERATION =====");
		console.log("[Dashboard] Selected trend:", selectedTrend);
		console.log("[Dashboard] Product type:", selectedProductType);
		console.log("[Dashboard] User goal:", userGoal);

		setGeneratingIdeas(true);
		setError(null);
		setProductIdeas(null);
		setStructuredBlueprint(null);

		try {
			// First, try the test endpoint to verify frontend works
			const useTestEndpoint = process.env.NODE_ENV === 'development';
			
			let response;
			if (useTestEndpoint) {
				console.log("[Dashboard] Using TEST endpoint for verification");
				response = await fetch("/api/test-blueprint");
			} else {
				// Use the new structured endpoint
				const trendSummary = typeof selectedTrend === 'string' 
					? selectedTrend 
					: (selectedTrend.summary?.whyItMatters || selectedTrend.topic || JSON.stringify(selectedTrend));

				console.log("[Dashboard] Calling /api/generate-blueprint with:", {
					trend_summary: trendSummary.substring(0, 100),
					user_goal: userGoal,
					product_type: selectedProductType.toLowerCase(),
				});

				response = await fetch("/api/generate-blueprint", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						trend_summary: trendSummary,
						user_goal: userGoal,
						product_type: selectedProductType.toLowerCase(),
					}),
				});
			}

			console.log("[Dashboard] Response status:", response.status, response.statusText);
			
			if (!response.ok) {
				let errorData;
				try {
					const errorText = await response.text();
					console.error("[Dashboard] Error response:", errorText);
					errorData = JSON.parse(errorText);
				} catch {
					errorData = { error: `Failed to generate blueprint: ${response.status}` };
				}
				throw new Error(errorData.error || `Failed to generate blueprint: ${response.status}`);
			}

			const data = await response.json();
			console.log("[Dashboard] ===== RAW API RESPONSE =====");
			console.log("[Dashboard] Data keys:", Object.keys(data));
			console.log("[Dashboard] Has product_blueprint:", !!data.product_blueprint);
			console.log("[Dashboard] Has marketing_playbook:", !!data.marketing_playbook);
			console.log("[Dashboard] Full response:", JSON.stringify(data, null, 2));
			console.log("[Dashboard] ===== END RAW RESPONSE =====");
			
			// Validate required structure
			if (!data || !data.product_blueprint || !data.marketing_playbook) {
				console.error("[Dashboard] ERROR: Missing required fields", {
					hasData: !!data,
					hasProductBlueprint: !!data?.product_blueprint,
					hasMarketingPlaybook: !!data?.marketing_playbook,
					dataKeys: data ? Object.keys(data) : [],
					data: data,
				});
				throw new Error("PROTOCOL_VIOLATION: Response missing product_blueprint or marketing_playbook. Response: " + JSON.stringify(data).substring(0, 500));
			}

			// Validate product_blueprint has required fields
			if (!data.product_blueprint.product_title || !data.product_blueprint.core_concept) {
				console.error("[Dashboard] ERROR: Product blueprint missing required fields", {
					product_blueprint: data.product_blueprint,
					hasTitle: !!data.product_blueprint.product_title,
					hasCoreConcept: !!data.product_blueprint.core_concept,
				});
				throw new Error("PROTOCOL_VIOLATION: Product blueprint missing product_title or core_concept. Please try again.");
			}

			// Validate marketing_playbook has required fields
			if (!data.marketing_playbook.tagline || !data.marketing_playbook.core_hooks) {
				console.error("[Dashboard] ERROR: Marketing playbook missing required fields", {
					marketing_playbook: data.marketing_playbook,
					hasTagline: !!data.marketing_playbook.tagline,
					hasCoreHooks: !!data.marketing_playbook.core_hooks,
				});
				throw new Error("PROTOCOL_VIOLATION: Marketing playbook missing tagline or core_hooks. Please try again.");
			}

			// Store the structured blueprint
			setStructuredBlueprint(data);
			console.log("[Dashboard] ✅ SUCCESS: Structured blueprint stored:", {
				productTitle: data.product_blueprint.product_title,
				hasCoreConcept: !!data.product_blueprint.core_concept,
				hasMarketingPlaybook: !!data.marketing_playbook,
				coreHooksCount: data.marketing_playbook?.core_hooks?.length || 0,
				tagline: data.marketing_playbook?.tagline,
			});
		} catch (err) {
			console.error("[Dashboard] Error:", err);
			setError(err instanceof Error ? err.message : "Failed to generate blueprint");
		} finally {
			setGeneratingIdeas(false);
		}
	}, [selectedTrend, selectedProductType, userGoal]);

	// Auto-generate when all conditions are met - IMMEDIATELY, no delay
	useEffect(() => {
		if (selectedTrend && selectedProductType && userGoal && !structuredBlueprint && !generatingIdeas) {
			console.log("[Dashboard] ⚡ AUTO-GENERATING IMMEDIATELY...");
			console.log("[Dashboard] Conditions:", {
				hasTrend: !!selectedTrend,
				hasProductType: !!selectedProductType,
				hasGoal: !!userGoal,
				hasBlueprint: !!structuredBlueprint,
				isGenerating: generatingIdeas,
			});
			handleGenerateIdeas();
		}
	}, [selectedTrend, selectedProductType, userGoal, structuredBlueprint, generatingIdeas, handleGenerateIdeas]);

	const handleCompileBlueprint = async () => {
		if (!selectedTrend || !productIdeas || !dominanceDossier) return;
		setLoading(true);
		setError(null);
		try {
			// Select the first marketing angle (Urgency) by default, or let user choose
			const selectedAngle = productIdeas.marketingAngles?.[0] || null;
			if (!selectedAngle) {
				throw new Error("No marketing angles available. Please regenerate the ideas.");
			}

			const response = await fetch("/api/compile-blueprint", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					selectedConcept: productIdeas,
					selectedAngle: selectedAngle,
					trendSummary: selectedTrend.summary || selectedTrend,
					goal: userGoal,
					productType: selectedProductType,
					trendAnalysis: dominanceDossier.trendAnalysis,
				}),
			});
			if (!response.ok) throw new Error("Failed to compile blueprint");
			const data = await response.json();
			setBlueprint(data.blueprint);
			setSuccess({ title: "Blueprint Ready", message: "Your launch blueprint is ready." });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to compile blueprint");
		} finally {
			setLoading(false);
		}
	};

	const handleDeployCampaign = async () => {
		// Use structuredBlueprint if available, otherwise fall back to blueprint
		const blueprintData = structuredBlueprint || blueprint;
		if (!blueprintData) return;
		
		setLoading(true);
		setError(null);
		try {
			const response = await fetch("/api/campaign", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ blueprint: blueprintData }),
			});
			if (!response.ok) throw new Error("Failed to generate campaign assets");
			const data = await response.json();
			setCampaignAssets(data.campaignAssets);
			setSuccess({ title: "Campaign Deployed", message: "Your campaign assets are ready." });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to deploy campaign");
		} finally {
			setLoading(false);
		}
	};

	if (authLoading) {
		return (
			<div className="min-h-screen bg-obsidian flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-4 border-openai-accent-400 border-t-transparent mx-auto mb-4"></div>
					<p className="text-gray-400">Loading Launchpad...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-obsidian flex">
			{/* Sidebar */}
			<div className="hidden lg:block">
				<Sidebar />
			</div>

			{/* Main Content */}
			<div className="flex-1 lg:ml-64 p-6">
				<div className="max-w-7xl mx-auto">
					<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
						<h1 className="text-5xl font-bold bg-gradient-to-r from-white via-openai-accent-400 to-openai-accent-500 bg-clip-text text-transparent mb-2">
							Launchpad
						</h1>
						<p className="text-gray-400 text-lg">From Idea to Income. Optimized.</p>
					</motion.div>

				<AnimatePresence>
					{error && (
		<motion.div
							initial={{ opacity: 0, y: -20 }} 
							animate={{ opacity: 1, y: 0 }} 
							exit={{ opacity: 0, y: -20 }} 
							className={`mb-6 p-4 border rounded-lg ${
								error.startsWith("PROTOCOL_VIOLATION") 
									? "bg-amber-500/10 border-amber-400/30" 
									: "bg-red-500/10 border-red-400/30"
							}`}
						>
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1">
									<p className={`font-medium mb-2 ${error.startsWith("PROTOCOL_VIOLATION") ? "text-amber-400" : "text-red-400"}`}>
										{error.startsWith("PROTOCOL_VIOLATION") ? "⚠️ Data Integrity Issue" : "Error"}
									</p>
									<p className={`text-sm ${error.startsWith("PROTOCOL_VIOLATION") ? "text-amber-300" : "text-red-300"}`}>
										{error}
									</p>
									{error.startsWith("PROTOCOL_VIOLATION") && (
										<button
											onClick={handleGenerateIdeas}
											className="mt-3 px-4 py-2 bg-openai-accent-500 hover:bg-openai-accent-400 rounded-lg text-white text-sm transition-all"
										>
											↻ Retry Generation
										</button>
									)}
								</div>
								<button onClick={() => setError(null)} className={`${error.startsWith("PROTOCOL_VIOLATION") ? "text-amber-400 hover:text-amber-300" : "text-red-400 hover:text-red-300"}`}>✕</button>
							</div>
						</motion.div>
				)}
			</AnimatePresence>

				<GoalIntakeModal isOpen={showGoalModal} onComplete={handleGoalComplete} onSkip={() => setShowGoalModal(false)} />

				{success && (
					<SuccessModal isOpen={!!success} title={success.title} message={success.message} onClose={() => setSuccess(null)} primaryAction={success.title === "Blueprint Ready" ? { label: "Deploy Campaign", onClick: handleDeployCampaign } : undefined} />
				)}

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
					<ErrorBoundary>
						<TrendRadar goal={userGoal || undefined} onSelectTrend={handleTrendSelect} />
					</ErrorBoundary>

					<AnimatePresence mode="wait">
						{selectedTrend ? (
							<motion.div key="selected" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card-premium rounded-xl p-6">
				<div className="flex items-start justify-between mb-4">
					<div>
						<div className="flex items-center gap-2 mb-2">
											<div className="w-2 h-2 rounded-full bg-openai-accent-400 animate-pulse"></div>
											<span className="text-xs font-semibold text-openai-accent-400 uppercase">Selected</span>
										</div>
										<h3 className="text-2xl font-bold text-white mb-2">{selectedTrend.topic}</h3>
									</div>
									<button onClick={() => { setSelectedTrend(null); setProductIdeas(null); setDominanceDossier(null); setStructuredBlueprint(null); setSelectedProductType(null); }} className="text-gray-400 hover:text-white">✕</button>
						</div>
								<p className="text-sm text-gray-300 mb-6">{selectedTrend.summary?.whyItMatters || "Ready to generate product ideas."}</p>
								<div className="space-y-4">
									<div>
										<label htmlFor="product-type-select" className="block text-sm font-semibold text-gray-300 mb-2">Product Type</label>
										<select 
											id="product-type-select"
											name="productType"
											value={selectedProductType || ""} 
											onChange={(e) => { 
												setSelectedProductType(e.target.value); 
												setProductIdeas(null);
												setStructuredBlueprint(null);
											}} 
											className="w-full px-4 py-3 bg-obsidian-100 border border-obsidian-300 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-openai-accent-400 focus:border-openai-accent-400 transition-all"
										>
											<option value="">Choose...</option>
											{selectedTrend.personalization?.potentialProducts?.map((p: any, i: number) => (
												<option key={i} value={p.type}>{p.type}</option>
											)) || <>
												<option value="App">App</option>
												<option value="Ebook">Ebook</option>
												<option value="Course">Course</option>
												<option value="Automation">Automation</option>
											</>}
										</select>
					</div>
									
									{/* BIG GENERATE BUTTON - Always visible */}
									<button
										onClick={handleGenerateIdeas}
										disabled={generatingIdeas || !selectedProductType}
										className="w-full px-6 py-4 bg-gradient-to-r from-openai-accent-500 to-openai-accent-600 hover:from-openai-accent-400 hover:to-openai-accent-500 disabled:from-obsidian-300 disabled:to-obsidian-300 rounded-lg text-white font-semibold text-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-openai-accent-500/20 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-3"
									>
										{generatingIdeas ? (
											<>
												<div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
												<span>Generating...</span>
											</>
										) : (
											<>
												<span>🚀</span>
												<span>Generate Product Blueprint</span>
											</>
										)}
									</button>

									{generatingIdeas && (
										<div className="flex items-center gap-3 p-4 bg-obsidian-100 rounded-lg">
											<div className="animate-spin rounded-full h-5 w-5 border-2 border-openai-accent-400 border-t-transparent"></div>
											<p className="text-sm text-gray-300">Generating your product blueprint...</p>
						</div>
					)}
				</div>
							</motion.div>
						) : (
							<motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-premium rounded-xl p-12 flex items-center justify-center min-h-[400px]">
								<div className="text-center">
									<div className="text-6xl mb-4">🎯</div>
									<p className="text-gray-400">Select a trend to begin</p>
					</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Show loading state */}
				{generatingIdeas && !structuredBlueprint && (
					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{[...Array(2)].map((_, i) => (
								<div key={i} className="card-premium rounded-xl p-8">
									<div className="animate-pulse space-y-6">
										<div className="h-8 bg-obsidian-200 rounded-xl w-1/3"></div>
										<div className="space-y-3">
											<div className="h-4 bg-obsidian-200 rounded w-full"></div>
											<div className="h-4 bg-obsidian-200 rounded w-5/6"></div>
										</div>
				</div>
						</div>
							))}
						</div>
					</motion.div>
				)}

				{/* Show structured blueprint when ready */}
				{structuredBlueprint && (
					<motion.div 
						initial={{ opacity: 0, y: 20 }} 
						animate={{ opacity: 1, y: 0 }} 
						exit={{ opacity: 0, y: -20 }} 
						className="mb-6"
					>
						<ErrorBoundary>
							{/* Use simple version first to verify data flow */}
							<SimpleBlueprintDisplay data={structuredBlueprint} />
							{/* Uncomment when simple version works */}
							{/* <ProductBlueprintDisplay 
								data={structuredBlueprint} 
								onRegenerate={handleGenerateIdeas}
								onDeployCampaign={handleDeployCampaign}
							/> */}
						</ErrorBoundary>
					</motion.div>
				)}

				{blueprint && (
					<ErrorBoundary>
						<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
							<BlueprintDisplay blueprint={blueprint} onDeployCampaign={handleDeployCampaign} />
						</motion.div>
					</ErrorBoundary>
				)}

				{campaignAssets && (
					<ErrorBoundary>
						<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
							<CampaignDeployment campaignAssets={campaignAssets} />
						</motion.div>
					</ErrorBoundary>
				)}

				{!selectedTrend && !structuredBlueprint && !blueprint && !campaignAssets && (
					<EmptyState icon="🚀" title="Ready to Launch" description="Select a trend to automatically generate your product launch blueprint" />
				)}
				</div>
			</div>
		</div>
	);
}
