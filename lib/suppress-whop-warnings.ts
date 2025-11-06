"use client";

/**
 * Suppress harmless postMessage warnings from Whop SDK in development
 * These warnings occur when the app runs outside Whop's iframe (localhost)
 * 
 * This is a client-side component that filters console warnings
 */

import { useEffect } from 'react';

export function SuppressWhopWarnings() {
	useEffect(() => {
		if (process.env.NODE_ENV === 'development') {
			const originalWarn = console.warn;
			const originalError = console.error;

			// Filter out postMessage warnings from Whop SDK
			console.warn = function (...args: any[]) {
				const message = args[0]?.toString() || '';
				if (
					message.includes("Failed to execute 'postMessage' on 'DOMWindow'") ||
					message.includes('target origin provided') ||
					message.includes('postmessage.ts') ||
					message.includes('does not match the recipient window')
				) {
					// Suppress these specific warnings - they're harmless in development
					return;
				}
				originalWarn.apply(console, args);
			};

			console.error = function (...args: any[]) {
				const message = args[0]?.toString() || '';
				if (
					message.includes("Failed to execute 'postMessage' on 'DOMWindow'") ||
					message.includes('target origin provided') ||
					message.includes('postmessage.ts') ||
					message.includes('does not match the recipient window')
				) {
					// Suppress these specific errors - they're harmless in development
					return;
				}
				originalError.apply(console, args);
			};

			// Cleanup on unmount (though this component should never unmount)
			return () => {
				console.warn = originalWarn;
				console.error = originalError;
			};
		}
	}, []);

	return null; // This component doesn't render anything
}

