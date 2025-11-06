"use client";

import { useState } from "react";
import { Button } from "@whop/react/components";

interface WhopCredentialsFormProps {
	onSubmit: (apiKey: string, storeId: string, communityId?: string) => void;
	initialApiKey?: string;
	initialStoreId?: string;
}

export default function WhopCredentialsForm({
	onSubmit,
	initialApiKey = "",
	initialStoreId = "",
}: WhopCredentialsFormProps) {
	const [apiKey, setApiKey] = useState(initialApiKey);
	const [storeId, setStoreId] = useState(initialStoreId);
	const [communityId, setCommunityId] = useState("");
	const [showHelp, setShowHelp] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (apiKey && storeId) {
			onSubmit(apiKey, storeId, communityId || undefined);
		}
	};

	return (
		<div className="bg-white rounded-xl border border-gray-200 p-6">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-bold text-gray-900">Whop API Credentials</h3>
				<button
					type="button"
					onClick={() => setShowHelp(!showHelp)}
					className="text-sm text-blue-600 hover:text-blue-800"
				>
					{showHelp ? "Hide" : "How to get these?"}
				</button>
			</div>

			{showHelp && (
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm text-gray-700">
					<p className="font-semibold mb-2">Getting your Whop API credentials:</p>
					<ol className="list-decimal list-inside space-y-1">
						<li>Go to your Whop Dashboard</li>
						<li>Navigate to Settings → API</li>
						<li>Create an API key with product creation permissions</li>
						<li>Copy your Store ID from your store URL or settings</li>
						<li>Optional: Get your Community ID if you want to auto-create posts</li>
					</ol>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Whop API Key <span className="text-red-500">*</span>
					</label>
					<input
						type="password"
						value={apiKey}
						onChange={(e) => setApiKey(e.target.value)}
						placeholder="whop_api_key_..."
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						required
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Store ID <span className="text-red-500">*</span>
					</label>
					<input
						type="text"
						value={storeId}
						onChange={(e) => setStoreId(e.target.value)}
						placeholder="store_..."
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						required
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Community ID <span className="text-gray-500">(Optional)</span>
					</label>
					<input
						type="text"
						value={communityId}
						onChange={(e) => setCommunityId(e.target.value)}
						placeholder="community_... (for auto-creating posts)"
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<p className="text-xs text-gray-500 mt-1">
						If provided, a draft community post will be created automatically
					</p>
				</div>

				<Button
					type="submit"
					variant="classic"
					size="4"
					className="w-full"
					disabled={!apiKey || !storeId}
				>
					Save Credentials
				</Button>
			</form>
		</div>
	);
}
