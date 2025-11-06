"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { LaunchpadButton } from "@/components/brand/BrandKit";
import { CelebrationParticles } from "@/components/onboarding/CelebrationParticles";

type Step = "idea" | "audience" | "ignition";

interface OnboardingData {
	idea: string;
	targetAudience: string;
}

const MAX_TIME_SECONDS = 45;

export default function OnboardingPage() {
	const router = useRouter();
	const [step, setStep] = useState<Step>("idea");
	const [data, setData] = useState<OnboardingData>({ idea: "", targetAudience: "" });
	const [timeRemaining, setTimeRemaining] = useState(MAX_TIME_SECONDS);
	const [isComplete, setIsComplete] = useState(false);
	const [soundEnabled, setSoundEnabled] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	// Countdown timer
	useEffect(() => {
		if (isComplete || timeRemaining <= 0) return;

		timerRef.current = setInterval(() => {
			setTimeRemaining((prev) => {
				if (prev <= 1) {
					handleTimeExpired();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, [isComplete, timeRemaining]);

	// Ambient sound
	useEffect(() => {
		if (soundEnabled && audioRef.current) {
			audioRef.current.play().catch(() => {
				// Auto-play may be blocked, ignore
			});
		} else if (!soundEnabled && audioRef.current) {
			audioRef.current.pause();
		}
	}, [soundEnabled]);

	const handleTimeExpired = () => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
		}
		alert("Time expired! Please restart the initiation sequence.");
	};

	const handleNext = () => {
		if (step === "idea") {
			if (!data.idea.trim()) {
				alert("Please enter your idea to continue.");
				return;
			}
			setStep("audience");
		} else if (step === "audience") {
			if (!data.targetAudience.trim()) {
				alert("Please set your target audience to continue.");
				return;
			}
			setStep("ignition");
		}
	};

	const handleIgnition = async () => {
		setIsComplete(true);
		
		// Trigger blueprint generation
		try {
			const response = await fetch("/api/generate-kit", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					niche: data.idea,
					targetAudience: data.targetAudience,
				}),
			});

			if (response.ok) {
				// Wait 3 seconds for celebration, then redirect
				setTimeout(() => {
					router.push("/dashboard");
				}, 3000);
			} else {
				// Still redirect even if generation fails
				setTimeout(() => {
					router.push("/dashboard");
				}, 3000);
			}
		} catch (error) {
			console.error("Blueprint generation failed:", error);
			setTimeout(() => {
				router.push("/dashboard");
			}, 3000);
		}
	};

	const getProgress = () => {
		switch (step) {
			case "idea":
				return 33;
			case "audience":
				return 66;
			case "ignition":
				return 100;
		}
	};

	return (
		<div className="min-h-screen bg-obsidian text-white relative overflow-hidden">
			{/* Ambient sound (optional) */}
			<audio
				ref={audioRef}
				loop
				src="/sounds/ambient.mp3"
				preload="auto"
			/>

			{/* Background glow effects */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<motion.div
					className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#00F0FF]/20 rounded-full blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{
						duration: 4,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				/>
				<motion.div
					className="absolute top-1/4 right-1/4 w-64 h-64 bg-[#FF00FF]/20 rounded-full blur-3xl"
					animate={{
						scale: [1, 1.3, 1],
						opacity: [0.2, 0.4, 0.2],
					}}
					transition={{
						duration: 5,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				/>
			</div>

			{/* Mission Control Header */}
			<div className="relative z-10 border-b border-[#00F0FF]/20 px-8 py-6">
				<div className="max-w-4xl mx-auto flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold text-[#00F0FF] uppercase tracking-tight mb-2">
							MISSION CONTROL
						</h1>
						<p className="text-white/60 text-sm">Initiation Sequence</p>
					</div>
					<div className="flex items-center gap-6">
						{/* Timer */}
						<div className="text-right">
							<p className="text-white/60 text-xs uppercase tracking-tight mb-1">Time Remaining</p>
							<p className={`text-2xl font-bold ${timeRemaining <= 10 ? "text-red-400" : "text-[#00F0FF]"}`}>
								{timeRemaining}s
							</p>
						</div>
						{/* Sound Toggle */}
						<button
							onClick={() => setSoundEnabled(!soundEnabled)}
							className={`px-4 py-2 rounded-launchpad border transition-all ${
								soundEnabled
									? "bg-[#00F0FF]/20 border-[#00F0FF]/50 text-[#00F0FF]"
									: "bg-obsidian-50 border-white/10 text-white/60 hover:text-white"
							}`}
						>
							{soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF"}
						</button>
					</div>
				</div>
			</div>

			{/* Progress Bar */}
			<div className="relative z-10 border-b border-[#00F0FF]/10">
				<div className="max-w-4xl mx-auto h-1 bg-obsidian-50">
					<motion.div
						className="h-full bg-gradient-to-r from-[#00F0FF] to-[#FF00FF]"
						initial={{ width: "0%" }}
						animate={{ width: `${getProgress()}%` }}
						transition={{ duration: 0.5, ease: "easeOut" }}
					/>
				</div>
			</div>

			{/* Main Content */}
			<div className="relative z-10 max-w-4xl mx-auto px-8 py-12">
				<AnimatePresence mode="wait">
					{step === "idea" && (
						<motion.div
							key="idea"
							initial={{ opacity: 0, x: 50 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -50 }}
							className="text-center"
						>
							<motion.div
								className="mb-8"
								initial={{ scale: 0.8 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.2, type: "spring" }}
							>
								<div className="text-6xl mb-4">💡</div>
								<h2 className="text-4xl font-bold text-white uppercase tracking-tight mb-4">
									STEP 1: INPUT IDEA
								</h2>
								<p className="text-white/70 text-lg mb-8">
									Enter your raw idea. We'll transform it into a validated market offer.
								</p>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
								className="max-w-2xl mx-auto"
							>
								<textarea
									id="product-idea"
									name="productIdea"
									value={data.idea}
									onChange={(e) => setData({ ...data, idea: e.target.value })}
									placeholder="Describe your product idea..."
									className="w-full h-32 rounded-launchpad bg-obsidian-50 border border-[#00F0FF]/30 px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#00F0FF] focus:ring-2 focus:ring-[#00F0FF]/20 resize-none"
									autoFocus
									autoComplete="off"
								/>
								<LaunchpadButton
									variant="catalyst"
									className="mt-6 w-full"
									onClick={handleNext}
									disabled={!data.idea.trim()}
								>
									CONTINUE TO STEP 2 →
								</LaunchpadButton>
							</motion.div>
						</motion.div>
					)}

					{step === "audience" && (
						<motion.div
							key="audience"
							initial={{ opacity: 0, x: 50 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -50 }}
							className="text-center"
						>
							<motion.div
								className="mb-8"
								initial={{ scale: 0.8 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.2, type: "spring" }}
							>
								<div className="text-6xl mb-4">🎯</div>
								<h2 className="text-4xl font-bold text-white uppercase tracking-tight mb-4">
									STEP 2: SET TARGET AUDIENCE
								</h2>
								<p className="text-white/70 text-lg mb-8">
									Define who your product is for. This helps us craft the perfect positioning.
								</p>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
								className="max-w-2xl mx-auto"
							>
								<input
									type="text"
									id="target-audience"
									name="targetAudience"
									value={data.targetAudience}
									onChange={(e) => setData({ ...data, targetAudience: e.target.value })}
									placeholder="e.g., Content creators, SaaS founders, E-commerce store owners..."
									className="w-full rounded-launchpad bg-obsidian-50 border border-[#00F0FF]/30 px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#00F0FF] focus:ring-2 focus:ring-[#00F0FF]/20"
									autoFocus
									autoComplete="off"
								/>
								<div className="flex gap-3 mt-6">
									<LaunchpadButton
										variant="secondary"
										className="flex-1"
										onClick={() => setStep("idea")}
									>
										← Back
									</LaunchpadButton>
									<LaunchpadButton
										variant="catalyst"
										className="flex-1"
										onClick={handleNext}
										disabled={!data.targetAudience.trim()}
									>
										CONTINUE TO STEP 3 →
									</LaunchpadButton>
								</div>
							</motion.div>
						</motion.div>
					)}

					{step === "ignition" && (
						<motion.div
							key="ignition"
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 1.1 }}
							className="text-center"
						>
							<motion.div
								className="mb-8"
								initial={{ scale: 0.8 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.2, type: "spring" }}
							>
								<div className="text-6xl mb-4">🚀</div>
								<h2 className="text-4xl font-bold text-white uppercase tracking-tight mb-4">
									STEP 3: IGNITION
								</h2>
								<p className="text-white/70 text-lg mb-8">
									Ready to launch your first blueprint? Let's ignite the engines.
								</p>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
								className="max-w-2xl mx-auto space-y-6"
							>
								<div className="p-6 rounded-launchpad bg-obsidian-50 border border-[#00F0FF]/30 text-left">
									<h3 className="text-white font-bold mb-2">Idea:</h3>
									<p className="text-white/70">{data.idea}</p>
								</div>
								<div className="p-6 rounded-launchpad bg-obsidian-50 border border-[#00F0FF]/30 text-left">
									<h3 className="text-white font-bold mb-2">Target Audience:</h3>
									<p className="text-white/70">{data.targetAudience}</p>
								</div>
								<div className="flex gap-3 mt-6">
									<LaunchpadButton
										variant="secondary"
										className="flex-1"
										onClick={() => setStep("audience")}
									>
										← Back
									</LaunchpadButton>
									<LaunchpadButton
										variant="catalyst"
										className="flex-1 text-lg"
										onClick={handleIgnition}
										disabled={isComplete}
									>
										{isComplete ? "IGNITING..." : "🚀 IGNITE LAUNCH"}
									</LaunchpadButton>
								</div>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Celebration Particles */}
			{isComplete && <CelebrationParticles />}
		</div>
	);
}
