"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
	id: number;
	x: number;
	y: number;
	vx: number;
	vy: number;
	color: string;
	size: number;
}

const COLORS = ["#00F0FF", "#FF00FF", "#00FF88", "#B026FF", "#FFFF00"];

export function CelebrationParticles() {
	const [particles, setParticles] = useState<Particle[]>([]);

	useEffect(() => {
		// Create 100 particles
		const newParticles: Particle[] = Array.from({ length: 100 }, (_, i) => ({
			id: i,
			x: Math.random() * window.innerWidth,
			y: Math.random() * window.innerHeight,
			vx: (Math.random() - 0.5) * 4,
			vy: (Math.random() - 0.5) * 4,
			color: COLORS[Math.floor(Math.random() * COLORS.length)],
			size: Math.random() * 4 + 2,
		}));

		setParticles(newParticles);

		// Animate particles
		const interval = setInterval(() => {
			setParticles((prev) =>
				prev.map((p) => ({
					...p,
					x: p.x + p.vx,
					y: p.y + p.vy,
					vy: p.vy + 0.1, // Gravity
					vx: p.vx * 0.99, // Friction
				}))
			);
		}, 16); // ~60fps

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
			{particles.map((particle) => (
				<motion.div
					key={particle.id}
					className="absolute rounded-full"
					style={{
						left: particle.x,
						top: particle.y,
						width: particle.size,
						height: particle.size,
						backgroundColor: particle.color,
						boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
					}}
					initial={{ opacity: 1, scale: 1 }}
					animate={{
						opacity: [1, 0.8, 0],
						scale: [1, 1.5, 0],
					}}
					transition={{
						duration: 3,
						repeat: Infinity,
						ease: "easeOut",
					}}
				/>
			))}
			{/* Success Message */}
			<motion.div
				className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
				initial={{ opacity: 0, scale: 0.5 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 0.5, type: "spring" }}
			>
				<h2 className="text-5xl font-bold text-[#00F0FF] uppercase tracking-tight mb-4">
					IGNITION SUCCESSFUL!
				</h2>
				<p className="text-white/80 text-xl">
					Launching Command Center...
				</p>
			</motion.div>
		</div>
	);
}
