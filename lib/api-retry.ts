/**
 * Retry utility for external API calls
 * Implements exponential backoff with jitter
 */

interface RetryOptions {
	maxRetries?: number;
	initialDelay?: number;
	maxDelay?: number;
	factor?: number;
	retryable?: (error: any) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
	maxRetries: 3,
	initialDelay: 1000,
	maxDelay: 10000,
	factor: 2,
	retryable: (error) => {
		// Retry on network errors or 5xx status codes
		if (error instanceof TypeError) return true;
		if (error?.status >= 500 && error?.status < 600) return true;
		return false;
	},
};

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
	const exponentialDelay = options.initialDelay * Math.pow(options.factor, attempt);
	const jitter = Math.random() * 0.3 * exponentialDelay; // 30% jitter
	const delay = Math.min(exponentialDelay + jitter, options.maxDelay);
	return delay;
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
	fn: () => Promise<T>,
	options: RetryOptions = {}
): Promise<T> {
	const opts = { ...DEFAULT_OPTIONS, ...options };
	let lastError: any;

	for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;

			// Don't retry if it's not a retryable error
			if (!opts.retryable(error)) {
				throw error;
			}

			// Don't delay after the last attempt
			if (attempt < opts.maxRetries) {
				const delay = calculateDelay(attempt, opts);
				console.warn(`[Retry] Attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms...`, error);
				await sleep(delay);
			}
		}
	}

	throw lastError;
}

/**
 * Retry fetch with built-in error handling
 */
export async function retryFetch(
	url: string,
	options: RequestInit = {},
	retryOptions: RetryOptions = {}
): Promise<Response> {
	return retry(async () => {
		const response = await fetch(url, options);
		
		// Treat 5xx errors as retryable
		if (response.status >= 500 && response.status < 600) {
			throw { status: response.status, statusText: response.statusText };
		}

		return response;
	}, {
		...retryOptions,
		retryable: (error) => {
			if (retryOptions.retryable) {
				return retryOptions.retryable(error);
			}
			// Default: retry on network errors or 5xx
			if (error instanceof TypeError) return true;
			if (error?.status >= 500 && error?.status < 600) return true;
			return false;
		},
	});
}
