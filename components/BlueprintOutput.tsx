"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@whop/react/components";
import jsPDF from "jspdf";

interface BlueprintOutputProps {
	content: string;
}

export default function BlueprintOutput({ content }: BlueprintOutputProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(content).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	};

	const handleDownload = () => {
		const doc = new jsPDF();
		doc.setFontSize(16);
		doc.text("Your Ironclad Blueprint", 14, 20);
		
		// Split content into lines and add to PDF
		const lines = content.split('\n');
		let y = 35;
		doc.setFontSize(10);
		
		lines.forEach((line) => {
			// Handle headers
			if (line.startsWith('# ')) {
				doc.setFontSize(14);
				doc.text(line.replace('# ', ''), 14, y);
				y += 8;
				doc.setFontSize(10);
			} else if (line.startsWith('## ')) {
				doc.setFontSize(12);
				doc.text(line.replace('## ', ''), 14, y);
				y += 6;
				doc.setFontSize(10);
			} else if (line.startsWith('### ')) {
				doc.setFontSize(11);
				doc.text(line.replace('### ', ''), 14, y);
				y += 5;
				doc.setFontSize(10);
			} else if (line.trim()) {
				doc.text(line, 14, y);
				y += 5;
			} else {
				y += 3;
			}
			
			// New page if needed
			if (y > 280) {
				doc.addPage();
				y = 20;
			}
		});
		
		doc.save("ironclad-blueprint.pdf");
	};

	if (!content) {
		return (
			<div className="flex items-center justify-center h-full text-gray-10">
				<p>Your personalized Blueprint will appear here...</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full">
			<div className="flex gap-2 mb-4">
				<Button
					variant="classic"
					size="3"
					onClick={handleCopy}
					className="flex-1"
				>
					{copied ? "✓ Copied!" : "Copy to Clipboard"}
				</Button>
				<Button
					variant="classic"
					size="3"
					onClick={handleDownload}
					className="flex-1"
				>
					Download as PDF
				</Button>
			</div>
			
			<div className="flex-1 overflow-auto border border-gray-a4 rounded-lg p-6 bg-white">
				<div className="prose prose-sm max-w-none">
					<ReactMarkdown
						components={{
							h1: ({ node, ...props }) => (
								<h1 className="text-2xl font-bold mb-4 text-gray-12" {...props} />
							),
							h2: ({ node, ...props }) => (
								<h2 className="text-xl font-bold mt-6 mb-3 text-gray-12" {...props} />
							),
							h3: ({ node, ...props }) => (
								<h3 className="text-lg font-semibold mt-4 mb-2 text-gray-12" {...props} />
							),
							p: ({ node, ...props }) => (
								<p className="mb-3 text-gray-11" {...props} />
							),
							ul: ({ node, ...props }) => (
								<ul className="list-disc pl-6 mb-3 text-gray-11" {...props} />
							),
							ol: ({ node, ...props }) => (
								<ol className="list-decimal pl-6 mb-3 text-gray-11" {...props} />
							),
							li: ({ node, ...props }) => (
								<li className="mb-1" {...props} />
							),
						}}
					>
						{content}
					</ReactMarkdown>
				</div>
			</div>
		</div>
	);
}
