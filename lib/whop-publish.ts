/**
 * Hermes: Whop Publishing Layer
 * Functions for publishing products to Whop via their API
 */

import FormData from 'form-data';
import { Readable } from 'stream';

interface WhopProductData {
	name: string;
	description: string;
	content: string; // Markdown content
	price?: number;
	tags?: string[];
}

interface WhopDraftPostData {
	title: string;
	content: string;
}

/**
 * Create a digital product on Whop
 */
export async function createWhopProduct(
	apiKey: string,
	storeId: string,
	productData: WhopProductData
): Promise<{ productId: string; productUrl: string }> {
	try {
		// For now, include content in description (Whop API structure may vary)
		const response = await fetch(`https://api.whop.com/api/v2/stores/${storeId}/products`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name: productData.name,
				description: productData.description + '\n\n---\n\n' + productData.content.substring(0, 5000), // Include content in description
				type: 'digital',
				price: productData.price || 0,
				tags: productData.tags || [],
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Whop API error:', errorText);
			throw new Error(`Failed to create Whop product: ${response.statusText}`);
		}

		const data = await response.json();
		
		// Try to upload content as file if product was created successfully
		if (productData.content && (data.id || data.data?.id)) {
			const productId = data.id || data.data?.id;
			try {
				await uploadProductContent(apiKey, storeId, productId, productData.content, productData.name);
			} catch (uploadError) {
				console.warn('[Hermes] Content file upload failed, but product was created:', uploadError);
				// Continue - product is already created
			}
		}

		return {
			productId: data.id || data.data?.id || '',
			productUrl: data.url || data.data?.url || `https://whop.com/products/${data.id || data.data?.id}`,
		};
	} catch (error) {
		console.error('Error creating Whop product:', error);
		throw error;
	}
}

/**
 * Upload product content as a file (Node.js compatible)
 */
async function uploadProductContent(
	apiKey: string,
	storeId: string,
	productId: string,
	content: string,
	fileName: string
): Promise<void> {
	try {
		// Create FormData for Node.js
		const formData = new FormData();
		const contentStream = Readable.from([content]);
		
		const safeFileName = fileName.replace(/[^a-z0-9]/gi, '_') + '.md';
		formData.append('file', contentStream, {
			filename: safeFileName,
			contentType: 'text/markdown',
		});
		formData.append('product_id', productId);

		const response = await fetch(`https://api.whop.com/api/v2/stores/${storeId}/products/${productId}/files`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				...formData.getHeaders(),
			},
			body: formData as any,
		});

		if (!response.ok) {
			console.warn('Failed to upload product content file, but product was created');
		}
	} catch (error) {
		console.warn('Error uploading product content:', error);
		// Don't throw - product creation succeeded
	}
}

/**
 * Create a draft community post on Whop
 */
export async function createWhopDraftPost(
	apiKey: string,
	communityId: string,
	postData: WhopDraftPostData
): Promise<{ postId: string; postUrl: string }> {
	try {
		const response = await fetch(`https://api.whop.com/api/v2/communities/${communityId}/posts`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				title: postData.title,
				content: postData.content,
				status: 'draft',
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Whop API error:', errorText);
			throw new Error(`Failed to create draft post: ${response.statusText}`);
		}

		const data = await response.json();
		
		return {
			postId: data.id || data.data?.id || '',
			postUrl: data.url || data.data?.url || `https://whop.com/communities/${communityId}/posts/${data.id || data.data?.id}`,
		};
	} catch (error) {
		console.error('Error creating Whop draft post:', error);
		throw error;
	}
}
