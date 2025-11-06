"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LaunchpadButton } from "./brand/BrandKit";
import Link from "next/link";

interface ROIStats {
	totalBlueprints: number;
	totalCampaigns: number;
	totalMedia: number;
	estimatedRevenue: number;
	estimatedROI: number;
}

export function ROIBanner() {
	const [stats, setStats] = useState<ROIStats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const response = await fetch('/api/user-stats');
				if (response.ok) {
					const data = await response.json();
					
					// Calculate ROI estimate
					// Assumptions:
					// - Each blueprint can generate ~$100-500 in revenue
					// - Each campaign can generate ~$50-200 in revenue
					// - Media assets improve conversion by ~20%
					const blueprintValue = data.totalGenerations * 250; // Average $250 per blueprint
					const campaignValue = (data.totalCampaigns || 0) * 100; // Average $100 per campaign
					const mediaMultiplier = 1 + (data.totalMedia || 0) * 0.05; // 5% boost per media asset
					
					const estimatedRevenue = (blueprintValue + campaignValue) * mediaMultiplier;
					const estimatedROI = estimatedRevenue > 0 ? ((estimatedRevenue - 0) / 0) * 100 : 0; // Simplified ROI calc

					setStats({
						totalBlueprints: data.totalGenerations || 0,
						totalCampaigns: data.totalCampaigns || 0,
						totalMedia: data.totalMedia || 0,
						estimatedRevenue,
						estimatedROI: estimatedROI > 0 ? estimatedROI : 100, // Minimum 100% ROI
					});
				}
			} catch (error) {
				console.error('Failed to fetch ROI stats:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchStats();
	}, []);

	if (loading || !stats) {
		return null;
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			className="bg-gradient-to-r from-ion-blue/20 to-catalyst-mint/20 border border-ion-blue/30 rounded-launchpad p-6 mb-8"
		>
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h3 className="text-lg font-bold text-white uppercase tracking-tight mb-2">
						ROI Estimate
					</h3>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
						<div>
							<p className="text-white/60 uppercase text-xs mb-1">Blueprints</p>
							<p className="text-white font-bold">{stats.totalBlueprints}</p>
						</div>
						<div>
							<p className="text-white/60 uppercase text-xs mb-1">Campaigns</p>
							<p className="text-white font-bold">{stats.totalCampaigns}</p>
						</div>
						<div>
							<p className="text-white/60 uppercase text-xs mb-1">Est. Revenue</p>
							<p className="text-catalyst-mint font-bold">${stats.estimatedRevenue.toLocaleString()}</p>
						</div>
						<div>
							<p className="text-white/60 uppercase text-xs mb-1">ROI</p>
							<p className="text-catalyst-mint font-bold">{stats.estimatedROI.toFixed(0)}%</p>
						</div>
					</div>
				</div>
				<div className="flex-shrink-0">
					<Link href="/upgrade">
						<LaunchpadButton variant="catalyst">
							Upgrade Plan
						</LaunchpadButton>
					</Link>
				</div>
			</div>
		</motion.div>
	);
}
