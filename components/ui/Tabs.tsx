"use client";

import React, { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
	activeTab: string;
	setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

interface TabsProps {
	defaultValue: string;
	children: React.ReactNode;
	className?: string;
}

export function Tabs({ defaultValue, children, className }: TabsProps) {
	const [activeTab, setActiveTab] = useState(defaultValue);

	return (
		<TabsContext.Provider value={{ activeTab, setActiveTab }}>
			<div className={className}>{children}</div>
		</TabsContext.Provider>
	);
}

interface TabsListProps {
	children: React.ReactNode;
	className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
	return (
		<div className={cn("inline-flex h-12 items-center justify-center rounded-lg bg-gray-100 p-1", className)}>
			{children}
		</div>
	);
}

interface TabsTriggerProps {
	value: string;
	children: React.ReactNode;
	className?: string;
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
	const context = useContext(TabsContext);
	if (!context) throw new Error("TabsTrigger must be inside Tabs");

	const isActive = context.activeTab === value;

	return (
		<button
			type="button"
			onClick={() => context.setActiveTab(value)}
			className={cn(
				"inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50",
				isActive
					? "bg-white text-gray-900 shadow-sm"
					: "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
				className
			)}
		>
			{children}
		</button>
	);
}

interface TabsContentProps {
	value: string;
	children: React.ReactNode;
	className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
	const context = useContext(TabsContext);
	if (!context) throw new Error("TabsContent must be inside Tabs");

	if (context.activeTab !== value) return null;

	return <div className={className}>{children}</div>;
}
