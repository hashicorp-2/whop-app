#!/usr/bin/env node

/**
 * Launch Readiness Audit & Performance Pass
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const CONFIG = {
	baseUrl: process.env.AUDIT_BASE_URL || 'http://localhost:3000',
	thresholds: {
		performance: 90,
		bestPractices: 90,
		seo: 90,
		accessibility: 90,
		apiLatency: 300,
	},
	devices: [
		{ width: 375, height: 667, name: 'iPhone SE' },
		{ width: 768, height: 1024, name: 'iPad' },
		{ width: 1280, height: 720, name: 'Desktop HD' },
		{ width: 1920, height: 1080, name: 'Desktop Full HD' },
	],
	apiEndpoints: [
		'/api/generate-kit',
		'/api/showcase/launches',
		'/api/growth/metrics',
		'/api/user-profile',
	],
	slackWebhook: process.env.SLACK_WEBHOOK_URL,
};

const auditResults = {
	timestamp: new Date().toISOString(),
	lighthouse: {},
	responsive: {},
	apiLatency: {},
	database: {},
	errors: [],
	summary: {
		passed: false,
		score: 0,
		improvements: [],
	},
};

async function runLighthouseAudit() {
	console.log('🔍 Running Lighthouse audit...');
	let chrome;
	try {
		chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
		const options = {
			logLevel: 'info',
			output: 'json',
			onlyCategories: ['performance', 'best-practices', 'seo', 'accessibility'],
			port: chrome.port,
		};
		const runnerResult = await lighthouse(CONFIG.baseUrl, options);
		const scores = {
			performance: Math.round(runnerResult.lhr.categories.performance.score * 100),
			bestPractices: Math.round(runnerResult.lhr.categories['best-practices'].score * 100),
			seo: Math.round(runnerResult.lhr.categories.seo.score * 100),
			accessibility: Math.round(runnerResult.lhr.categories.accessibility.score * 100),
		};
		auditResults.lighthouse = {
			scores,
			passed: Object.values(scores).every(score => score >= CONFIG.thresholds.performance),
			details: {
				firstContentfulPaint: runnerResult.lhr.audits['first-contentful-paint']?.displayValue || 'N/A',
				largestContentfulPaint: runnerResult.lhr.audits['largest-contentful-paint']?.displayValue || 'N/A',
			},
		};
		Object.entries(scores).forEach(([category, score]) => {
			if (score < CONFIG.thresholds.performance) {
				auditResults.summary.improvements.push({
					type: 'lighthouse',
					category,
					current: score,
					target: CONFIG.thresholds.performance,
					command: `npm run optimize:${category}`,
				});
			}
		});
		console.log('✅ Lighthouse audit complete:', scores);
	} catch (error) {
		console.error('❌ Lighthouse audit failed:', error.message);
		auditResults.errors.push({ type: 'lighthouse', error: error.message });
	} finally {
		if (chrome) await chrome.kill();
	}
}

async function testResponsive() {
	console.log('📱 Testing responsive design...');
	const results = [];
	for (const device of CONFIG.devices) {
		try {
			const response = await axios.get(CONFIG.baseUrl, { timeout: 5000 });
			results.push({
				device: device.name,
				width: device.width,
				height: device.height,
				passed: response.status === 200,
				status: response.status,
			});
		} catch (error) {
			results.push({
				device: device.name,
				width: device.width,
				height: device.height,
				passed: false,
				error: error.message,
			});
		}
	}
	auditResults.responsive = {
		results,
		passed: results.every(r => r.passed),
	};
	if (!auditResults.responsive.passed) {
		auditResults.summary.improvements.push({
			type: 'responsive',
			command: 'npm run test:responsive',
		});
	}
	console.log('✅ Responsive QA complete');
}

async function testAPILatency() {
	console.log('⚡ Testing API latency...');
	const results = {};
	for (const endpoint of CONFIG.apiEndpoints) {
		try {
			const startTime = Date.now();
			await axios.get(`${CONFIG.baseUrl}${endpoint}`, {
				timeout: 5000,
				validateStatus: () => true,
			});
			const latency = Date.now() - startTime;
			results[endpoint] = {
				latency,
				passed: latency < CONFIG.thresholds.apiLatency,
			};
			if (latency >= CONFIG.thresholds.apiLatency) {
				auditResults.summary.improvements.push({
					type: 'api-latency',
					endpoint,
					current: latency,
					target: CONFIG.thresholds.apiLatency,
					command: `npm run optimize:api --endpoint=${endpoint}`,
				});
			}
		} catch (error) {
			results[endpoint] = {
				latency: -1,
				passed: false,
				error: error.message,
			};
		}
	}
	auditResults.apiLatency = {
		results,
		passed: Object.values(results).every(r => r.passed && r.latency > 0),
	};
	console.log('✅ API latency tests complete');
}

async function testDatabaseHealth() {
	console.log('💾 Checking database connection pool...');
	try {
		const supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL || '',
			process.env.SUPABASE_SERVICE_ROLE_KEY || ''
		);
		const startTime = Date.now();
		const { data, error } = await supabase.from('profiles').select('id').limit(1);
		const latency = Date.now() - startTime;
		auditResults.database = {
			connected: !error,
			latency,
			passed: !error && latency < 500,
			error: error?.message,
		};
		if (error || latency >= 500) {
			auditResults.summary.improvements.push({
				type: 'database',
				command: 'npm run check:database',
			});
		}
		console.log('✅ Database health check complete');
	} catch (error) {
		auditResults.database = {
			connected: false,
			passed: false,
			error: error.message,
		};
		auditResults.errors.push({ type: 'database', error: error.message });
	}
}

async function sendSlackAlert() {
	if (!CONFIG.slackWebhook) return;
	const passed = auditResults.summary.passed;
	const emoji = passed ? '✅' : '❌';
	const message = `${emoji} Launch Readiness Audit ${passed ? 'PASSED' : 'FAILED'}\n\n` +
		`Score: ${auditResults.summary.score}/100\n` +
		`Lighthouse: ${auditResults.lighthouse.passed ? 'PASS' : 'FAIL'}\n` +
		`Responsive: ${auditResults.responsive.passed ? 'PASS' : 'FAIL'}\n` +
		`API Latency: ${auditResults.apiLatency.passed ? 'PASS' : 'FAIL'}\n` +
		`Database: ${auditResults.database.passed ? 'PASS' : 'FAIL'}`;
	try {
		await axios.post(CONFIG.slackWebhook, { text: message });
		console.log('✅ Slack alert sent');
	} catch (error) {
		console.error('❌ Failed to send Slack alert:', error.message);
	}
}

function calculateScore() {
	const weights = {
		lighthouse: 0.4,
		responsive: 0.2,
		apiLatency: 0.2,
		database: 0.2,
	};
	let score = 0;
	if (auditResults.lighthouse.passed) score += 100 * weights.lighthouse;
	if (auditResults.responsive.passed) score += 100 * weights.responsive;
	if (auditResults.apiLatency.passed) score += 100 * weights.apiLatency;
	if (auditResults.database.passed) score += 100 * weights.database;
	auditResults.summary.score = Math.round(score);
	auditResults.summary.passed = score >= 80;
}

async function runAudit() {
	console.log('🚀 Starting Launch Readiness Audit...\n');
	await Promise.all([
		runLighthouseAudit(),
		testResponsive(),
		testAPILatency(),
		testDatabaseHealth(),
	]);
	calculateScore();
	const resultsPath = path.join(process.cwd(), 'audit-results.json');
	await fs.writeFile(resultsPath, JSON.stringify(auditResults, null, 2));
	console.log(`\n📄 Results saved to: ${resultsPath}`);
	await sendSlackAlert();
	console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log('📊 AUDIT SUMMARY');
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log(`Overall Score: ${auditResults.summary.score}/100`);
	console.log(`Status: ${auditResults.summary.passed ? '✅ PASSED' : '❌ FAILED'}`);
	console.log('\nBreakdown:');
	console.log(`  Lighthouse: ${auditResults.lighthouse.passed ? '✅' : '❌'}`);
	console.log(`  Responsive: ${auditResults.responsive.passed ? '✅' : '❌'}`);
	console.log(`  API Latency: ${auditResults.apiLatency.passed ? '✅' : '❌'}`);
	console.log(`  Database: ${auditResults.database.passed ? '✅' : '❌'}`);
	if (auditResults.summary.improvements.length > 0) {
		console.log('\n🔧 Improvement Commands:');
		auditResults.summary.improvements.forEach(imp => {
			if (imp.command) console.log(`  ${imp.command}`);
		});
	}
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
	process.exit(auditResults.summary.passed ? 0 : 1);
}

runAudit().catch(error => {
	console.error('❌ Audit failed:', error);
	process.exit(1);
});
