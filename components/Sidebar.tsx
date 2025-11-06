"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

interface NavItem {
	label: string;
	href: string;
	icon: string;
}

const navItems: NavItem[] = [
	{ label: "Dashboard", href: "/dashboard", icon: "📊" },
	{ label: "My Products", href: "/products", icon: "📦" },
	{ label: "Trend Alerts", href: "/trends", icon: "🔔" },
	{ label: "Settings", href: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
	const pathname = usePathname();

	return (
		<aside className="fixed left-0 top-0 h-screen w-64 bg-obsidian-50 border-r border-obsidian-300 z-40">
			<div className="flex flex-col h-full p-4">
				{/* Logo/Header */}
				<div className="mb-8 pt-6">
					<Link href="/dashboard" className="block">
						<h2 className="text-xl font-bold bg-gradient-to-r from-white via-openai-accent-400 to-openai-accent-500 bg-clip-text text-transparent">
							Launchpad
						</h2>
						<p className="text-xs text-gray-400 mt-1">Apex Predator Engine</p>
					</Link>
				</div>

				{/* Navigation */}
				<nav className="flex-1 space-y-2">
					{navItems.map((item) => {
						const isActive = pathname === item.href;
						return (
							<Link key={item.href} href={item.href}>
								<motion.div
									whileHover={{ x: 4 }}
									transition={{ duration: 0.2 }}
									className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
										isActive
											? "bg-openai-accent/10 text-openai-accent-400 border-l-2 border-openai-accent-400"
											: "text-gray-400 hover:text-white hover:bg-obsidian-100"
									}`}
								>
									<span className="text-lg">{item.icon}</span>
									<span className={`font-medium ${isActive ? "text-openai-accent-400" : ""}`}>
										{item.label}
									</span>
								</motion.div>
							</Link>
						);
					})}
				</nav>

				{/* Footer */}
				<div className="pt-4 border-t border-obsidian-300">
					<p className="text-xs text-gray-500 text-center">
						From Momentum to Monetization
					</p>
				</div>
			</div>
		</aside>
	);
}

