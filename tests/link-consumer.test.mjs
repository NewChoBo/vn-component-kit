import assert from 'node:assert/strict';
import { lstat, mkdtemp, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { linkConsumer } from '../scripts/link-consumer.mjs';

test('consumer link is live, repeatable, and refuses existing paths', async (context) => {
	const temporaryRoot = await mkdtemp(join(tmpdir(), 'vn-components-link-'));
	context.after(() => rm(temporaryRoot, { recursive: true, force: true }));

	const consumerRoot = join(temporaryRoot, 'consumer');
	await mkdir(consumerRoot);

	const first = await linkConsumer(consumerRoot);
	assert.equal(first.created, true);
	assert.equal(first.mountPath, join(consumerRoot, 'node_modules', '@newchobo', 'vn-components'));
	assert.equal((await lstat(first.mountPath)).isSymbolicLink(), true);
	assert.equal(await realpath(first.mountPath), await realpath(first.packageRoot));

	const second = await linkConsumer(consumerRoot);
	assert.equal(second.created, false);

	const occupied = join(consumerRoot, 'occupied');
	await writeFile(occupied, 'keep');
	await assert.rejects(() => linkConsumer(consumerRoot, 'occupied'), /will not be replaced/);
	assert.equal(await readFile(occupied, 'utf8'), 'keep');
});

test('consumer link rejects paths outside the consumer root', async (context) => {
	const temporaryRoot = await mkdtemp(join(tmpdir(), 'vn-components-boundary-'));
	context.after(() => rm(temporaryRoot, { recursive: true, force: true }));
	const consumerRoot = join(temporaryRoot, 'consumer');
	await mkdir(consumerRoot);

	await assert.rejects(() => linkConsumer(consumerRoot, '../outside'), /stay inside/);
	await assert.rejects(() => linkConsumer('', 'packages/vn-components'), /consumer root is required/);
});
