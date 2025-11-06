"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

function cn(...classes: (string | undefined | null | false)[]): string {
	return classes.filter(Boolean).join(" ");
}

export function LaunchpadCard({ children, className, ...props }: HTMLMotionProps<"div">) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className={cn(
				"rounded-launchpad backdrop-blur-md bg-obsidian/80 border border-obsidian-100 p-8",
				className
			)}
			{...props}
		>
			{children}
		</motion.div>
	);
}

export function LaunchpadButton({ 
	children, 
	variant = "primary",
	size = "md",
	className,
	...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
	variant?: "primary" | "secondary" | "ghost" | "catalyst";
	size?: "sm" | "md" | "lg";
}) {
	const variants = {
		primary: "bg-ion text-white hover:bg-ion-600",
		secondary: "bg-obsidian-50 border border-obsidian-100 text-white hover:bg-obsidian-100",
		ghost: "bg-transparent text-white/70 hover:text-white hover:bg-obsidian-50",
		catalyst: "bg-catalyst text-obsidian hover:bg-catalyst-400",
	};
	
	const sizes = {
		sm: "px-3 py-1.5 text-xs",
		md: "px-6 py-3 text-sm",
		lg: "px-8 py-4 text-base",
	};
	
	return (
		<motion.button
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			className={cn(
				"rounded-launchpad font-bold uppercase tracking-tight transition-all disabled:opacity-50",
				variants[variant],
				sizes[size],
				className
			)}
			{...(props as any)}
		>
			{children}
		</motion.button>
	);
}

export function LaunchpadHeading({ 
	children, 
	level = 1,
	className 
}: { 
	children: React.ReactNode;
	level?: 1 | 2 | 3;
	className?: string;
}) {
	const Tag = `h${level}` as keyof JSX.IntrinsicElements;
	const sizes = {
		1: "text-4xl md:text-5xl",
		2: "text-3xl md:text-4xl",
		3: "text-2xl md:text-3xl",
	};
	
	return (
		<Tag className={cn(
			"font-bold uppercase tracking-tight",
			sizes[level],
			className
		)}>
			{children}
		</Tag>
	);
}
