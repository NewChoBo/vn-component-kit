import { lstat, mkdir, readFile, realpath, symlink } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const packageRoot = resolve(dirname(scriptPath), '..');
const defaultMount = 'node_modules/@newchobo/vn-components';

function isInside(parent, child) {
	const candidate = relative(parent, child);
	return candidate !== '' && candidate !== '..' && !candidate.startsWith(`..${sep}`) && !isAbsolute(candidate);
}

async function requireDirectory(path, label) {
	let stats;
	try {
		stats = await lstat(path);
	} catch (error) {
		if (error?.code === 'ENOENT') throw new Error(`${label} does not exist: ${path}`);
		throw error;
	}
	if (!stats.isDirectory()) throw new Error(`${label} must be a directory: ${path}`);
}

export async function linkConsumer(consumerRootInput, mountInput = defaultMount) {
	if (typeof consumerRootInput !== 'string' || consumerRootInput.trim() === '') {
		throw new TypeError('consumer root is required.');
	}
	if (typeof mountInput !== 'string' || mountInput.trim() === '' || isAbsolute(mountInput)) {
		throw new TypeError('mount path must be a non-empty relative path.');
	}

	const consumerRoot = resolve(consumerRootInput);
	const mountPath = resolve(consumerRoot, mountInput);
	if (!isInside(consumerRoot, mountPath)) {
		throw new Error('mount path must stay inside the consumer root.');
	}

	await requireDirectory(consumerRoot, 'consumer root');
	const manifest = JSON.parse(await readFile(resolve(packageRoot, 'package.json'), 'utf8'));
	if (manifest.name !== '@newchobo/vn-components') {
		throw new Error('link source is not @newchobo/vn-components.');
	}

	try {
		const existing = await lstat(mountPath);
		if (!existing.isSymbolicLink()) {
			throw new Error(`mount path already exists and will not be replaced: ${mountPath}`);
		}
		const target = await realpath(mountPath);
		if (target !== await realpath(packageRoot)) {
			throw new Error(`mount path points to another target and will not be replaced: ${mountPath}`);
		}
		return Object.freeze({ consumerRoot, mountPath, packageRoot, created: false });
	} catch (error) {
		if (error?.code !== 'ENOENT') throw error;
	}

	await mkdir(dirname(mountPath), { recursive: true });
	await symlink(packageRoot, mountPath, process.platform === 'win32' ? 'junction' : 'dir');
	return Object.freeze({ consumerRoot, mountPath, packageRoot, created: true });
}

async function main() {
	const [, , consumerRoot, mountPath] = process.argv;
	const result = await linkConsumer(consumerRoot, mountPath);
	const state = result.created ? 'created' : 'already linked';
	console.log(`${state}: ${result.mountPath} -> ${result.packageRoot}`);
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
	main().catch((error) => {
		console.error(error.message);
		process.exitCode = 1;
	});
}
