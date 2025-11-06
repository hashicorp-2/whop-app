#!/usr/bin/env node

const { chromium } = require('playwright');

const DEVICES = [
	{ width: 375, height: 667, name: 'iPhone SE' },
	{ width: 768, height: 1024, name: 'iPad' },
	{ width: 1280, height: 720, name: 'Desktop HD' },
	{ width: 1920, height: 1080, name: 'Desktop Full HD' },
];

const BASE_URL = process.env.AUDIT_BASE_URL || 'http://localhost:3000';
const PAGES = ['/', '/dashboard', '/showcase'];

async function testResponsive() {
	const browser = await chromium.launch();
	const results = [];
	for (const device of DEVICES) {
		for (const page of PAGES) {
			const context = await browser.newContext({
				viewport: { width: device.width, height: device.height },
			});
			const pageObj = await context.newPage();
			try {
				const startTime = Date.now();
				await pageObj.goto(`${BASE_URL}${page}`, { waitUntil: 'networkidle', timeout: 10000 });
				const loadTime = Date.now() - startTime;
				const bodyWidth = await pageObj.evaluate(() => document.body.scrollWidth);
				const viewportWidth = device.width;
				const hasHorizontalScroll = bodyWidth > viewportWidth;
				results.push({
					device: device.name,
					width: device.width,
					height: device.height,
					page,
					passed: !hasHorizontalScroll && loadTime < 5000,
					loadTime,
					hasHorizontalScroll,
					bodyWidth,
				});
			} catch (error) {
				results.push({
					device: device.name,
					width: device.width,
					height: device.height,
					page,
					passed: false,
					error: error.message,
				});
			} finally {
				await context.close();
			}
		}
	}
	await browser.close();
	const passed = results.every(r => r.passed);
	console.log(`Responsive QA: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
	if (!passed) {
		const failures = results.filter(r => !r.passed);
		console.log('\nFailures:');
		failures.forEach(f => {
			console.log(`  ${f.device} (${f.width}x${f.height}) - ${f.page}: ${f.error || 'Layout issue'}`);
		});
	}
	return results;
}

testResponsive().catch(console.error);
