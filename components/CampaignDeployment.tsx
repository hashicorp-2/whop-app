"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CampaignDeploymentProps {
	campaignAssets: {
		emails: Array<any>;
		ads: Array<any>;
		posts: Array<any>;
		visualPrompts: Array<any>;
	};
	strategicRecommendations?: any;
	onRegenerate?: (type: string) => void;
}

export default function CampaignDeployment({
	campaignAssets,
	strategicRecommendations,
	onRegenerate,
}: CampaignDeploymentProps) {
	const [activeTab, setActiveTab] = useState<"emails" | "social" | "ads" | "visuals">("emails");
	const [copiedItem, setCopiedItem] = useState<string | null>(null);

	const copyToClipboard = (text: string, id: string) => {
		navigator.clipboard.writeText(text);
		setCopiedItem(id);
		setTimeout(() => setCopiedItem(null), 2000);
	};

	const tabs = [
		{ id: "emails", label: "Email", count: campaignAssets.emails?.length || 0 },
		{ id: "social", label: "Social", count: campaignAssets.posts?.length || 0 },
		{ id: "ads", label: "Ads", count: campaignAssets.ads?.length || 0 },
		{ id: "visuals", label: "Visuals", count: campaignAssets.visualPrompts?.length || 0 },
	];

	return (
		<div className="rounded-2xl bg-obsidian-50 border border-obsidian-200 p-6">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-2xl font-bold text-white">Campaign Assets</h2>
				{strategicRecommendations && (
					<div className="text-sm text-gray-400">
						Primary Channel: <span className="text-ion-400">{strategicRecommendations.primaryChannel}</span>
					</div>
				)}
			</div>

			{/* Tabs */}
			<div className="flex gap-2 mb-6 border-b border-obsidian-200 overflow-x-auto">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id as any)}
						className={`
							px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap
							${activeTab === tab.id
								? "text-ion-400 border-ion-400"
								: "text-gray-400 border-transparent hover:text-gray-300"
							}
						`}
					>
						{tab.label} {tab.count > 0 && `(${tab.count})`}
					</button>
				))}
			</div>

			{/* Tab Content */}
			<AnimatePresence mode="wait">
				<motion.div
					key={activeTab}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					className="min-h-[400px] max-h-[600px] overflow-y-auto"
				>
					{activeTab === "emails" && (
						<div className="space-y-4">
							{campaignAssets.emails?.map((email, index) => (
								<div
									key={index}
									className="p-5 rounded-xl bg-obsidian-100 border border-obsidian-200"
								>
									<div className="flex items-start justify-between mb-3">
										<div>
											<p className="text-xs text-gray-400 mb-1">Subject</p>
											<p className="font-semibold text-white">{email.subject}</p>
										</div>
										{onRegenerate && (
											<button
												onClick={() => onRegenerate(`email-${index}`)}
												className="text-xs text-ion-400 hover:text-ion-300"
											>
												Regenerate
											</button>
										)}
									</div>
									{email.previewText && (
										<div className="mb-3">
											<p className="text-xs text-gray-400 mb-1">Preview</p>
											<p className="text-sm text-gray-300">{email.previewText}</p>
										</div>
									)}
									<div className="mb-3">
										<p className="text-xs text-gray-400 mb-1">Body</p>
										<div className="text-sm text-gray-300 whitespace-pre-wrap">
											{email.bodyCopy || email.body}
										</div>
									</div>
									{email.cta && (
										<button
											onClick={() => copyToClipboard(email.cta, `email-cta-${index}`)}
											className="text-sm text-ion-400 hover:text-ion-300"
										>
											{copiedItem === `email-cta-${index}` ? "Copied!" : `CTA: ${email.cta}`}
										</button>
									)}
								</div>
							)) || <p className="text-gray-400">No email templates available</p>}
						</div>
					)}

					{activeTab === "social" && (
						<div className="space-y-4">
							{campaignAssets.posts?.map((post, index) => (
								<div
									key={index}
									className="p-5 rounded-xl bg-obsidian-100 border border-obsidian-200"
								>
									<div className="flex items-start justify-between mb-3">
										<span className="text-xs px-2 py-1 bg-obsidian-200 rounded text-gray-300">
											{post.platform}
										</span>
										<div className="flex gap-2">
											<button
												onClick={() => copyToClipboard(post.postCopy || post.content, `post-${index}`)}
												className="text-xs text-ion-400 hover:text-ion-300"
											>
												{copiedItem === `post-${index}` ? "Copied!" : "Copy"}
											</button>
											{onRegenerate && (
												<button
													onClick={() => onRegenerate(`post-${index}`)}
													className="text-xs text-gray-400 hover:text-gray-300"
												>
													Regenerate
												</button>
											)}
										</div>
									</div>
									<p className="text-sm text-gray-300 whitespace-pre-wrap mb-2">
										{post.postCopy || post.content}
									</p>
									{post.hashtags && (
										<p className="text-xs text-catalyst-400">{post.hashtags}</p>
									)}
									{post.visualNotes && (
										<p className="text-xs text-gray-400 mt-2">Visual: {post.visualNotes}</p>
									)}
								</div>
							)) || <p className="text-gray-400">No social posts available</p>}
						</div>
					)}

					{activeTab === "ads" && (
						<div className="space-y-4">
							{campaignAssets.ads?.map((ad, index) => (
								<div
									key={index}
									className="p-5 rounded-xl bg-obsidian-100 border border-obsidian-200"
								>
									<div className="flex items-start justify-between mb-3">
										<span className="text-xs px-2 py-1 bg-obsidian-200 rounded text-gray-300">
											{ad.platform}
										</span>
										{onRegenerate && (
											<button
												onClick={() => onRegenerate(`ad-${index}`)}
												className="text-xs text-ion-400 hover:text-ion-300"
											>
												Regenerate
											</button>
										)}
									</div>
									<h4 className="font-semibold text-white mb-2">{ad.headline}</h4>
									<p className="text-sm text-gray-300 mb-3">{ad.description || ad.copy}</p>
									<div className="flex items-center justify-between">
										<span className="text-sm text-ion-400 font-medium">{ad.cta}</span>
										<button
											onClick={() => copyToClipboard(ad.headline + "\n\n" + ad.description, `ad-${index}`)}
											className="text-xs text-gray-400 hover:text-white"
										>
											{copiedItem === `ad-${index}` ? "Copied!" : "Copy"}
										</button>
									</div>
									{ad.targetAudience && (
										<p className="text-xs text-gray-400 mt-2">Target: {ad.targetAudience}</p>
									)}
								</div>
							)) || <p className="text-gray-400">No ad creatives available</p>}
						</div>
					)}

					{activeTab === "visuals" && (
						<div className="space-y-4">
							{campaignAssets.visualPrompts?.map((visual, index) => (
								<div
									key={index}
									className="p-5 rounded-xl bg-obsidian-100 border border-obsidian-200"
								>
									<div className="flex items-start justify-between mb-3">
										<span className="text-xs px-2 py-1 bg-catalyst-400/20 text-catalyst-400 rounded">
											{visual.type}
										</span>
										{visual.aspectRatio && (
											<span className="text-xs text-gray-400">{visual.aspectRatio}</span>
										)}
									</div>
									<p className="text-sm text-gray-300 mb-3">{visual.description}</p>
									{visual.styleNotes && (
										<p className="text-xs text-gray-400">Style: {visual.styleNotes}</p>
									)}
									<button
										onClick={() => copyToClipboard(visual.description, `visual-${index}`)}
										className="mt-3 text-xs text-ion-400 hover:text-ion-300"
									>
										{copiedItem === `visual-${index}` ? "Copied!" : "Copy Prompt"}
									</button>
								</div>
							)) || <p className="text-gray-400">No visual prompts available</p>}
						</div>
					)}
				</motion.div>
			</AnimatePresence>
		</div>
	);
}
