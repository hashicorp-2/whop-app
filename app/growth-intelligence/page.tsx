"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
	LineChart, 
	Line, 
	AreaChart, 
	Area, 
	BarChart, 
	Bar, 
	XAxis, 
	YAxis, 
	Tooltip, 
	ResponsiveContainer
} from "recharts";
import { LaunchpadCard, LaunchpadHeading, LaunchpadButton } from "@/components/brand/BrandKit";

interface GrowthMetrics {
	activeCampaigns: number;
	ctr: number;
	revenue: number;
	churn: number;
	revenueHistory: { date: string; revenue: number }[];
	ctrHistory: { date: string; ctr: number }[];
	churnHistory: { date: string; churn: number }[];
	campaignPerformance: { name: string; value: number }[];
}

interface NextBestMove {
	insight: string;
	action: string;
	priority: "high" | "medium" | "low";
	expectedImpact: string;
}

const COLORS = {
	neonBlue: "#00F0FF",
	neonPink: "#FF00FF",
	neonGreen: "#00FF88",
	neonPurple: "#B026FF",
	dark: "#0D0F14",
};

export default function GrowthIntelligencePage() {
	const [metrics, setMetrics] = useState<GrowthMetrics | null>(null);
	const [nextBestMove, setNextBestMove] = useState<NextBestMove | null>(null);
	const [loading, setLoading] = useState(true);
	const [isExporting, setIsExporting] = useState(false);

	useEffect(() => {
		fetchMetrics();
		fetchNextBestMove();
	}, []);

	const fetchMetrics = async () => {
		try {
			const response = await fetch('/api/growth/metrics');
			if (response.ok) {
				const data = await response.json();
				setMetrics(data);
			}
		} catch (error) {
			console.error('Failed to fetch metrics:', error);
		} finally {
			setLoading(false);
		}
	};

	const fetchNextBestMove = async () => {
		try {
			const response = await fetch('/api/growth-analyst/next-best-move');
			if (response.ok) {
				const data = await response.json();
				setNextBestMove(data);
			}
		} catch (error) {
			console.error('Failed to fetch next best move:', error);
		}
	};

	const exportDashboard = async (format: 'pdf' | 'png') => {
		setIsExporting(true);
		try {
			if (format === 'png') {
				const html2canvas = (await import('html2canvas')).default;
				const element = document.getElementById('growth-dashboard');
				
				if (!element) {
					throw new Error('Dashboard element not found');
				}

				const canvas = await html2canvas(element, {
					backgroundColor: '#0D0F14',
					scale: 2,
				});

				const url = canvas.toDataURL('image/png');
				const link = document.createElement('a');
				link.href = url;
				link.download = `growth-intelligence-${Date.now()}.png`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			} else if (format === 'pdf') {
				const html2canvas = (await import('html2canvas')).default;
				const jsPDF = (await import('jspdf')).default;
				const element = document.getElementById('growth-dashboard');
				
				if (!element) {
					throw new Error('Dashboard element not found');
				}

				const canvas = await html2canvas(element, {
					backgroundColor: '#0D0F14',
					scale: 2,
				});

				const imgData = canvas.toDataURL('image/png');
				const pdf = new jsPDF.jsPDF({
					orientation: 'landscape',
					unit: 'px',
					format: [canvas.width, canvas.height],
				});

				pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
				pdf.save(`growth-intelligence-${Date.now()}.pdf`);
			}
		} catch (error) {
			console.error('Export failed:', error);
			alert('Export failed. Please ensure html2canvas and jspdf are installed.');
		} finally {
			setIsExporting(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-obsidian text-white flex items-center justify-center">
				<div className="text-center">
					<div className="inline-block w-12 h-12 border-4 border-obsidian-100 border-t-[#00F0FF] rounded-full animate-spin mb-4" />
					<p className="text-white/70">Loading Growth Intelligence...</p>
				</div>
			</div>
		);
	}

	return (
		<div id="growth-dashboard" className="min-h-screen bg-obsidian text-white">
			{/* Header */}
			<div className="border-b border-[#00F0FF]/20 px-8 py-6">
				<div className="max-w-7xl mx-auto flex justify-between items-center">
					<LaunchpadHeading level={1} className="text-[#00F0FF]">
						Growth Intelligence Hub
					</LaunchpadHeading>
					<div className="flex gap-3">
						<LaunchpadButton
							variant="secondary"
							onClick={() => exportDashboard('png')}
							disabled={isExporting}
						>
							{isExporting ? 'Exporting...' : 'Export PNG'}
						</LaunchpadButton>
						<LaunchpadButton
							variant="catalyst"
							onClick={() => exportDashboard('pdf')}
							disabled={isExporting}
						>
							{isExporting ? 'Exporting...' : 'Export PDF'}
						</LaunchpadButton>
					</div>
				</div>
			</div>

			{/* Split-Pane Layout */}
			<div className="flex flex-col lg:flex-row h-[calc(100vh-100px)]">
				{/* Left Pane: Charts */}
				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					{/* KPI Cards */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<LaunchpadCard className="bg-gradient-to-br from-[#00F0FF]/10 to-[#00F0FF]/5 border-[#00F0FF]/30">
							<p className="text-white/60 text-xs uppercase tracking-tight mb-1">Active Campaigns</p>
							<p className="text-3xl font-bold text-[#00F0FF]">{metrics?.activeCampaigns || 0}</p>
						</LaunchpadCard>
						<LaunchpadCard className="bg-gradient-to-br from-[#00FF88]/10 to-[#00FF88]/5 border-[#00FF88]/30">
							<p className="text-white/60 text-xs uppercase tracking-tight mb-1">CTR</p>
							<p className="text-3xl font-bold text-[#00FF88]">{(metrics?.ctr || 0).toFixed(1)}%</p>
						</LaunchpadCard>
						<LaunchpadCard className="bg-gradient-to-br from-[#FF00FF]/10 to-[#FF00FF]/5 border-[#FF00FF]/30">
							<p className="text-white/60 text-xs uppercase tracking-tight mb-1">Revenue</p>
							<p className="text-3xl font-bold text-[#FF00FF]">${(metrics?.revenue || 0).toLocaleString()}</p>
						</LaunchpadCard>
						<LaunchpadCard className="bg-gradient-to-br from-[#B026FF]/10 to-[#B026FF]/5 border-[#B026FF]/30">
							<p className="text-white/60 text-xs uppercase tracking-tight mb-1">Churn</p>
							<p className="text-3xl font-bold text-[#B026FF]">{(metrics?.churn || 0).toFixed(1)}%</p>
						</LaunchpadCard>
					</div>

					{/* Revenue Chart */}
					<LaunchpadCard className="bg-obsidian/50 border-[#00F0FF]/20">
						<h3 className="text-lg font-bold text-white uppercase tracking-tight mb-4">Revenue Trend</h3>
						<ResponsiveContainer width="100%" height={300}>
							<AreaChart data={metrics?.revenueHistory || []}>
								<defs>
									<linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor={COLORS.neonPink} stopOpacity={0.8}/>
										<stop offset="95%" stopColor={COLORS.neonPink} stopOpacity={0}/>
									</linearGradient>
								</defs>
								<XAxis dataKey="date" stroke="#666" />
								<YAxis stroke="#666" />
								<Tooltip
									contentStyle={{ 
										backgroundColor: COLORS.dark, 
										border: `1px solid ${COLORS.neonPink}`,
										borderRadius: '8px',
										color: '#fff'
									}}
								/>
								<Area 
									type="monotone" 
									dataKey="revenue" 
									stroke={COLORS.neonPink}
									fillOpacity={1}
									fill="url(#revenueGradient)"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</LaunchpadCard>

					{/* CTR & Churn Side by Side */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<LaunchpadCard className="bg-obsidian/50 border-[#00FF88]/20">
							<h3 className="text-lg font-bold text-white uppercase tracking-tight mb-4">CTR Trend</h3>
							<ResponsiveContainer width="100%" height={250}>
								<LineChart data={metrics?.ctrHistory || []}>
									<XAxis dataKey="date" stroke="#666" />
									<YAxis stroke="#666" />
									<Tooltip
										contentStyle={{ 
											backgroundColor: COLORS.dark, 
											border: `1px solid ${COLORS.neonGreen}`,
											borderRadius: '8px'
										}}
									/>
									<Line 
										type="monotone" 
										dataKey="ctr" 
										stroke={COLORS.neonGreen}
										strokeWidth={2}
										dot={{ fill: COLORS.neonGreen }}
									/>
								</LineChart>
							</ResponsiveContainer>
						</LaunchpadCard>

						<LaunchpadCard className="bg-obsidian/50 border-[#B026FF]/20">
							<h3 className="text-lg font-bold text-white uppercase tracking-tight mb-4">Churn Trend</h3>
							<ResponsiveContainer width="100%" height={250}>
								<LineChart data={metrics?.churnHistory || []}>
									<XAxis dataKey="date" stroke="#666" />
									<YAxis stroke="#666" />
									<Tooltip
										contentStyle={{ 
											backgroundColor: COLORS.dark, 
											border: `1px solid ${COLORS.neonPurple}`,
											borderRadius: '8px'
										}}
									/>
									<Line 
										type="monotone" 
										dataKey="churn" 
										stroke={COLORS.neonPurple}
										strokeWidth={2}
										dot={{ fill: COLORS.neonPurple }}
									/>
								</LineChart>
							</ResponsiveContainer>
						</LaunchpadCard>
					</div>

					{/* Campaign Performance */}
					<LaunchpadCard className="bg-obsidian/50 border-[#00F0FF]/20">
						<h3 className="text-lg font-bold text-white uppercase tracking-tight mb-4">Campaign Performance</h3>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={metrics?.campaignPerformance || []}>
								<XAxis dataKey="name" stroke="#666" />
								<YAxis stroke="#666" />
								<Tooltip
									contentStyle={{ 
										backgroundColor: COLORS.dark, 
										border: `1px solid ${COLORS.neonBlue}`,
										borderRadius: '8px'
									}}
								/>
								<Bar dataKey="value" fill={COLORS.neonBlue} />
							</BarChart>
						</ResponsiveContainer>
					</LaunchpadCard>
				</div>

				{/* Right Pane: GrowthAnalyst Insights */}
				<div className="w-full lg:w-96 border-l border-[#00F0FF]/20 p-6 overflow-y-auto">
					<LaunchpadCard className="bg-gradient-to-br from-[#00F0FF]/10 to-[#B026FF]/10 border-[#00F0FF]/30 mb-6">
						<h3 className="text-xl font-bold text-[#00F0FF] uppercase tracking-tight mb-4">
							Next Best Move
						</h3>
						{nextBestMove ? (
							<div className="space-y-4">
								<div>
									<p className="text-white/60 text-xs uppercase tracking-tight mb-2">Priority</p>
									<span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
										nextBestMove.priority === 'high' 
											? 'bg-red-500/20 text-red-400 border border-red-500/30'
											: nextBestMove.priority === 'medium'
											? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
											: 'bg-green-500/20 text-green-400 border border-green-500/30'
									}`}>
										{nextBestMove.priority}
									</span>
								</div>
								<div>
									<p className="text-white/60 text-xs uppercase tracking-tight mb-2">Insight</p>
									<p className="text-white text-sm leading-relaxed">{nextBestMove.insight}</p>
								</div>
								<div>
									<p className="text-white/60 text-xs uppercase tracking-tight mb-2">Action</p>
									<p className="text-[#00FF88] text-sm font-medium">{nextBestMove.action}</p>
								</div>
								<div>
									<p className="text-white/60 text-xs uppercase tracking-tight mb-2">Expected Impact</p>
									<p className="text-white/70 text-sm">{nextBestMove.expectedImpact}</p>
								</div>
							</div>
						) : (
							<p className="text-white/60">Analyzing growth data...</p>
						)}
					</LaunchpadCard>

					<LaunchpadButton
						variant="primary"
						className="w-full"
						onClick={fetchNextBestMove}
					>
						Refresh Analysis
					</LaunchpadButton>
				</div>
			</div>
		</div>
	);
}
