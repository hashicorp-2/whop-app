"use client";

/**
 * Suppress harmless postMessage warnings from Whop SDK in development
 * These warnings occur when the app runs outside Whop's iframe (localhost)
 * 
 * Uses a robust patching approach similar to Next.js's console patching
 */

import { useEffect } from 'react';

function patchConsoleMethod<T extends 'warn' | 'error'>(
	methodName: T,
	shouldCallOriginal: (methodName: T, ...args: any[]) => boolean
): () => void {
	const descriptor = Object.getOwnPropertyDescriptor(console, methodName);
	if (
		descriptor &&
		(descriptor.configurable || descriptor.writable) &&
		typeof descriptor.value === 'function'
	) {
		const originalMethod = descriptor.value as Console[T];
		const originalName = Object.getOwnPropertyDescriptor(originalMethod, 'name');
		
		const wrapperMethod = function (this: typeof console, ...args: any[]) {
			// Only call original if shouldCallOriginal returns true
			if (shouldCallOriginal(methodName, ...args)) {
				originalMethod.apply(this, args);
			}
			// Otherwise suppress (don't call original)
		};
		
		if (originalName) {
			Object.defineProperty(wrapperMethod, 'name', originalName);
		}
		
		Object.defineProperty(console, methodName, {
			value: wrapperMethod,
			writable: descriptor.writable,
			configurable: descriptor.configurable,
		});

		return () => {
			Object.defineProperty(console, methodName, {
				value: originalMethod,
				writable: descriptor.writable,
				configurable: descriptor.configurable,
			});
		};
	}

	return () => {};
}

function shouldSuppress(message: string): boolean {
	return (
		message.includes("Failed to execute 'postMessage' on 'DOMWindow'") ||
		message.includes('target origin provided') ||
		message.includes('postmessage.ts') ||
		message.includes('does not match the recipient window') ||
		message.includes('whop.com') ||
		message.includes('dash.whop.com') ||
		message.includes('agent terminals') ||
		message.includes('read only') ||
		message.includes('read-only')
	);
}

export default function SuppressWhopWarnings() {
	useEffect(() => {
		if (process.env.NODE_ENV === 'development') {
			// Patch console.warn - only call original if message should NOT be suppressed
			const unwarnWarn = patchConsoleMethod('warn', (methodName, ...args) => {
				const message = args[0]?.toString() || '';
				return !shouldSuppress(message); // Return true to call original, false to suppress
			});

			// Patch console.error - only call original if message should NOT be suppressed
			const unwarnError = patchConsoleMethod('error', (methodName, ...args) => {
				const message = args[0]?.toString() || '';
				return !shouldSuppress(message); // Return true to call original, false to suppress
			});

			// Cleanup on unmount
			return () => {
				unwarnWarn();
				unwarnError();
			};
		}
	}, []);

	return null; // This component doesn't render anything
}

