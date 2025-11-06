import { withWhopAppConfig } from "@whop/react/next.config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [{ hostname: "**" }],
		formats: ["image/avif", "image/webp"],
	},
	
	// Security headers
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{
						key: "X-DNS-Prefetch-Control",
						value: "on",
					},
					{
						key: "Strict-Transport-Security",
						value: "max-age=63072000; includeSubDomains; preload",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "Referrer-Policy",
						value: "origin-when-cross-origin",
					},
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=()",
					},
					// Allow iframe embedding (required for Whop)
					{
						key: "X-Frame-Options",
						value: "SAMEORIGIN",
					},
				],
			},
		];
	},

	// Compression
	compress: true,

	// Generate static pages where possible
	output: "standalone",
};

export default withWhopAppConfig(nextConfig);
