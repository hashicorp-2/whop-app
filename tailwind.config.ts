import { frostedThemePlugin } from "@whop/react/tailwind";
import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				obsidian: {
					DEFAULT: "#09090B",
					50: "#18181B",
					100: "#1F1F23",
					200: "#27272A",
					300: "#333333",
				},
				"openai-accent": {
					DEFAULT: "#10A37F",
					400: "#2DD4BF",
					500: "#14B8A6",
					600: "#0D9488",
				},
				ion: {
					DEFAULT: "#2563EB",
					50: "#EFF6FF",
					400: "#60A5FA",
					500: "#2563EB",
					600: "#1D4ED8",
				},
				catalyst: {
					DEFAULT: "#3EE6B0",
					50: "#F0FDFA",
					400: "#3EE6B0",
					500: "#14B8A6",
				},
				"neon-blue": "#00F0FF",
				"neon-pink": "#FF00FF",
				"neon-green": "#00FF88",
				"neon-purple": "#B026FF",
			},
			fontFamily: {
				display: ["Inter", "system-ui", "sans-serif"],
				body: ["Inter", "system-ui", "sans-serif"],
			},
			borderRadius: {
				launchpad: "16px",
			},
		},
	},
	plugins: [frostedThemePlugin()],
};

export default config;
