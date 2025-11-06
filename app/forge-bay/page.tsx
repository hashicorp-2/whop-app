"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LaunchpadCard, LaunchpadButton } from "@/components/brand/BrandKit";

interface MediaItem {
	url: string;
	tag: string;
	concept?: string;
}

interface MediaOutput {
	images: MediaItem[];
	video?: MediaItem;
}

export default function ForgeBay() {
	const [brief, setBrief] = useState("");
	const [brandColors, setBrandColors] = useState("");
	const [selectedTags, setSelectedTags] = useState<string[]>(["hero", "ad", "social"]);
	const [media, setMedia] = useState<MediaOutput | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [vault, setVault] = useState<MediaItem[]>([]);

	const availableTags = ["hero", "ad", "social", "promo"];

	const handleGenerate = async () => {
		if (!brief.trim()) return;

		setIsGenerating(true);
		setError(null);
		setMedia(null);

		try {
			const colors = brandColors
				.split(",")
				.map((c) => c.trim())
				.filter(Boolean);

			const response = await fetch("/api/media-arsenal", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					brief: brief.trim(),
					brandColors: colors.length > 0 ? colors : undefined,
					tags: selectedTags,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to generate media");
			}

			const data = await response.json();
			setMedia(data.media);

			// Add to vault
			const allMedia = [...data.media.images, ...(data.media.video ? [data.media.video] : [])];
			setVault((prev) => [...prev, ...allMedia]);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Generation failed");
		} finally {
			setIsGenerating(false);
		}
	};

	const handleAddToVault = (item: MediaItem) => {
		if (!vault.some((v) => v.url === item.url)) {
			setVault((prev) => [...prev, item]);
		}
	};

	const handleRemoveFromVault = (url: string) => {
		setVault((prev) => prev.filter((v) => v.url !== url));
	};

	const filteredVault = (tag?: string) => {
		if (!tag) return vault;
		return vault.filter((item) => item.tag === tag);
	};

	return (
		<div className="min-h-screen bg-obsidian p-8">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-12 text-center">
					<h1 className="text-5xl font-bold text-white uppercase tracking-tight mb-2">
						Forge Bay
					</h1>
					<p className="text-white/70 text-body-lg">
						AI Media Arsenal - Generate visual concepts and motion clips
					</p>
				</div>

				{/* Input Section */}
				<LaunchpadCard className="mb-8">
					<h2 className="text-2xl font-bold text-white uppercase tracking-tight mb-6">
						Upload Brief
					</h2>
					
					<div className="space-y-6">
						<div>
							<label htmlFor="creative-brief" className="block text-sm font-medium text-white/90 uppercase tracking-tight mb-2">
								Creative Brief
							</label>
							<textarea
								id="creative-brief"
								name="creativeBrief"
								value={brief}
								onChange={(e) => setBrief(e.target.value)}
								placeholder="Describe the visual concept, style, mood, and key elements you want to see..."
								className="w-full h-32 rounded-launchpad bg-obsidian-50 border border-obsidian-100 px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-ion focus:ring-2 focus:ring-ion/20 resize-none"
								disabled={isGenerating}
								autoComplete="off"
							/>
						</div>

						<div>
							<label htmlFor="brand-colors" className="block text-sm font-medium text-white/90 uppercase tracking-tight mb-2">
								Brand Colors (comma-separated, optional)
							</label>
							<input
								type="text"
								id="brand-colors"
								name="brandColors"
								value={brandColors}
								onChange={(e) => setBrandColors(e.target.value)}
								placeholder="e.g., #2563EB, #3EE6B0, #0D0F14"
								className="w-full rounded-launchpad bg-obsidian-50 border border-obsidian-100 px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-ion focus:ring-2 focus:ring-ion/20"
								disabled={isGenerating}
								autoComplete="off"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-white/90 uppercase tracking-tight mb-2 mb-4">
								Tags
							</label>
							<div className="flex gap-3 flex-wrap">
								{availableTags.map((tag) => (
									<button
										key={tag}
										onClick={() => {
											if (selectedTags.includes(tag)) {
												setSelectedTags(selectedTags.filter((t) => t !== tag));
											} else {
												setSelectedTags([...selectedTags, tag]);
											}
										}}
										className={`px-4 py-2 rounded-full text-sm font-medium uppercase tracking-tight transition-all ${
											selectedTags.includes(tag)
												? "bg-catalyst text-obsidian"
												: "bg-obsidian-50 text-white/70 hover:text-white"
										}`}
									>
										{tag}
									</button>
								))}
							</div>
						</div>

						<div className="flex justify-end">
							<LaunchpadButton
								variant="catalyst"
								onClick={handleGenerate}
								disabled={isGenerating || !brief.trim()}
							>
								{isGenerating ? "Forging..." : "Generate Media Arsenal"}
							</LaunchpadButton>
						</div>
					</div>
				</LaunchpadCard>

				{/* Loading State */}
				{isGenerating && (
					<LaunchpadCard>
						<div className="text-center py-12">
							<motion.div
								animate={{ rotate: 360 }}
								transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
								className="inline-block w-16 h-16 border-4 border-obsidian-100 border-t-catalyst rounded-full mb-4"
							/>
							<p className="text-white/70">Generating 3 visual concepts + motion clip...</p>
						</div>
					</LaunchpadCard>
				)}

				{/* Error Display */}
				{error && (
					<LaunchpadCard className="border-red-500/50">
						<p className="text-red-400">{error}</p>
					</LaunchpadCard>
				)}

				{/* Generated Media */}
				<AnimatePresence>
					{media && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							className="space-y-8"
						>
							{/* Visual Concepts */}
							<div>
								<h2 className="text-2xl font-bold text-white uppercase tracking-tight mb-6">
									3 Visual Concepts
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									{media.images.map((image, index) => (
										<LaunchpadCard key={index} className="p-0 overflow-hidden">
											<div className="relative aspect-square">
												<img
													src={image.url}
													alt={image.concept || image.tag}
													className="w-full h-full object-cover"
												/>
												<div className="absolute top-4 right-4">
													<span className="px-3 py-1 bg-obsidian/80 backdrop-blur-sm rounded-full text-xs font-medium uppercase tracking-tight text-catalyst">
														{image.tag}
													</span>
												</div>
											</div>
											<div className="p-4">
												<p className="text-white/70 text-sm mb-4">{image.concept}</p>
												<div className="flex gap-2">
													<LaunchpadButton
														variant="secondary"
														size="sm"
														onClick={() => handleAddToVault(image)}
													>
														Add to Vault
													</LaunchpadButton>
													<LaunchpadButton
														variant="ghost"
														size="sm"
														onClick={() => window.open(image.url, '_blank')}
													>
														Download
													</LaunchpadButton>
												</div>
											</div>
										</LaunchpadCard>
									))}
								</div>
							</div>

							{/* Motion Clip */}
							{media.video && (
								<div>
									<h2 className="text-2xl font-bold text-white uppercase tracking-tight mb-6">
										Motion Clip
									</h2>
									<LaunchpadCard className="p-0 overflow-hidden">
										<div className="relative">
											<video
												src={media.video.url}
												controls
												className="w-full h-auto"
											/>
											<div className="absolute top-4 right-4">
												<span className="px-3 py-1 bg-obsidian/80 backdrop-blur-sm rounded-full text-xs font-medium uppercase tracking-tight text-catalyst">
													{media.video.tag}
												</span>
											</div>
										</div>
										<div className="p-4 flex gap-2">
											<LaunchpadButton
												variant="secondary"
												size="sm"
												onClick={() => handleAddToVault(media.video!)}
											>
												Add to Vault
											</LaunchpadButton>
											<LaunchpadButton
												variant="ghost"
												size="sm"
												onClick={() => window.open(media.video!.url, '_blank')}
											>
												Download
											</LaunchpadButton>
										</div>
									</LaunchpadCard>
								</div>
							)}
						</motion.div>
					)}
				</AnimatePresence>

				{/* Media Vault */}
				{vault.length > 0 && (
					<div className="mt-12">
						<h2 className="text-2xl font-bold text-white uppercase tracking-tight mb-6">
							Media Vault
						</h2>
						
						{/* Filter Tabs */}
						<div className="flex gap-2 mb-6 flex-wrap">
							<button
								onClick={() => setSelectedTags([])}
								className="px-4 py-2 rounded-launchpad bg-obsidian-50 text-white/70 hover:text-white text-sm font-medium uppercase tracking-tight"
							>
								All ({vault.length})
							</button>
							{availableTags.map((tag) => {
								const count = filteredVault(tag).length;
								if (count === 0) return null;
								return (
									<button
										key={tag}
										onClick={() => setSelectedTags([tag])}
										className="px-4 py-2 rounded-launchpad bg-obsidian-50 text-white/70 hover:text-white text-sm font-medium uppercase tracking-tight"
									>
										{tag} ({count})
									</button>
								);
							})}
						</div>

						{/* Vault Grid */}
						<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
							{filteredVault(selectedTags[0] || undefined).map((item, index) => (
								<LaunchpadCard key={index} className="p-0 overflow-hidden relative group">
									{item.url.endsWith('.mp4') || item.url.includes('video') ? (
										<video
											src={item.url}
											className="w-full aspect-square object-cover"
											muted
											loop
											playsInline
										/>
									) : (
										<img
											src={item.url}
											alt={item.tag}
											className="w-full aspect-square object-cover"
										/>
									)}
									<div className="absolute inset-0 bg-obsidian/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
										<LaunchpadButton
											variant="secondary"
											size="sm"
											onClick={() => window.open(item.url, '_blank')}
										>
											View
										</LaunchpadButton>
										<LaunchpadButton
											variant="ghost"
											size="sm"
											onClick={() => handleRemoveFromVault(item.url)}
										>
											Remove
										</LaunchpadButton>
									</div>
									<div className="absolute top-2 left-2">
										<span className="px-2 py-1 bg-obsidian/80 backdrop-blur-sm rounded text-xs font-medium uppercase tracking-tight text-catalyst">
											{item.tag}
										</span>
									</div>
								</LaunchpadCard>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
