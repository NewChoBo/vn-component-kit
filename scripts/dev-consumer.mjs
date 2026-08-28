#!/usr/bin/env node

import { access, readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);

function requiredValue(argv, index, option) {
	const value = argv[index + 1];
	if (!value || value.startsWith('--')) throw new Error(`${option} requires a value.`);
	return value;
}

export function parseDevArguments(argv, cwd = process.cwd()) {
	let root = cwd;
	let port = '5173';
	let components = null;

	for (let index = 0; index < argv.length; index += 1) {
		const option = argv[index];
		if (option === '--root') {
			root = requiredValue(argv, index, option);
			index += 1;
		} else if (option === '--port') {
			port = requiredValue(argv, index, option);
			index += 1;
		} else if (option === '--components') {
			components = requiredValue(argv, index, option);
			index += 1;
		} else {
			throw new Error(`Unknown option: ${option}`);
		}
	}

	if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
		throw new Error('--port must be an integer between 1 and 65535.');
	}

	const consumerRoot = resolve(cwd, root);
	return Object.freeze({
		consumerRoot,
		port,
		componentsRoot: components ? resolve(consumerRoot, components) : null
	});
}

async function verifyComponentPackage(packageRoot) {
	const manifest = JSON.parse(await readFile(resolve(packageRoot, 'package.json'), 'utf8'));
	if (manifest.name !== '@newchobo/vn-components') {
		throw new Error(`Expected @newchobo/vn-components at ${packageRoot}`);
	}
	await access(resolve(packageRoot, 'index.js'));
	await access(resolve(packageRoot, 'index.css'));
}

function run(command, args, cwd) {
	return new Promise((resolvePromise, reject) => {
		const child = spawn(command, args, { cwd, stdio: 'inherit' });
		child.once('error', reject);
		child.once('exit', (code, signal) => {
			if (code === 0) resolvePromise();
			else reject(new Error(`${command} exited with ${signal ?? code}.`));
		});
	});
}

export async function prepareComponents(options) {
	if (options.componentsRoot) {
		await verifyComponentPackage(options.componentsRoot);
		const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
		await run(npmCommand, ['link', options.componentsRoot, '--save=false', '--ignore-scripts'], options.consumerRoot);
	}

	const installedRoot = resolve(options.consumerRoot, 'node_modules', '@newchobo', 'vn-components');
	await verifyComponentPackage(installedRoot);
	return installedRoot;
}

async function main() {
	const options = parseDevArguments(process.argv.slice(2));
	const componentRoot = await prepareComponents(options);
	console.log(`VN components: ${componentRoot}`);
	const serveCommand = process.platform === 'win32' ? 'serve.cmd' : 'serve';
	await run(serveCommand, ['.', '--listen', options.port, '--no-clipboard'], options.consumerRoot);
}

if (process.argv[1] && isAbsolute(scriptPath) && resolve(process.argv[1]) === scriptPath) {
	main().catch((error) => {
		console.error(error.message);
		process.exitCode = 1;
	});
}
