"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("ErrorBoundary caught an error:", error, errorInfo);
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="rounded-xl bg-red-500/10 border border-red-400/30 p-8 text-center">
					<div className="text-4xl mb-4">⚠️</div>
					<h3 className="text-xl font-semibold text-white mb-2">Something went wrong</h3>
					<p className="text-gray-400 mb-4">
						{this.state.error?.message || "An unexpected error occurred"}
					</p>
					<button
						onClick={this.handleReset}
						className="px-6 py-2 bg-ion-600 hover:bg-ion-500 rounded-lg text-white font-medium transition-colors"
					>
						Try Again
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}
