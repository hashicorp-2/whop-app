import { WhopApp } from "@whop/react/components";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SuppressWhopWarnings from "@/components/SuppressWhopWarnings";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
	display: "swap",
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "Launchpad - Trend-to-Product Engine",
	description: "Turn any trend into a ready-to-sell digital product in under 5 minutes. Launchpad helps creators capitalize on trending topics instantly.",
	authors: [{ name: "Launchpad" }],
	creator: "Launchpad",
	publisher: "Launchpad",
	keywords: ["digital products", "trend analysis", "product generation", "whop", "creator tools"],
	openGraph: {
		title: "Launchpad - Turn Trends into Products",
		description: "Launch digital products in minutes, not weeks",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Launchpad",
		description: "From Idea to Income. Optimized.",
	},
	robots: {
		index: true,
		follow: true,
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				suppressHydrationWarning
			>
				<SuppressWhopWarnings />
				<WhopApp>{children}</WhopApp>
			</body>
		</html>
	);
}
