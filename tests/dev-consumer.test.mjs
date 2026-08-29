import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import test from 'node:test';

import { isMainModule, parseDevArguments } from '../scripts/dev-consumer.mjs';

test('dev consumer defaults to the installed component package', () => {
	assert.deepEqual(parseDevArguments([], '/workspace/game'), {
		consumerRoot: resolve('/workspace/game'),
		port: '5173',
		componentsRoot: null
	});
});

test('dev consumer resolves a local component source from the consumer root', () => {
	assert.deepEqual(parseDevArguments([
		'--root', 'game',
		'--port', '4173',
		'--components', '../vn-component-kit'
	], '/workspace'), {
		consumerRoot: resolve('/workspace/game'),
		port: '4173',
		componentsRoot: resolve('/workspace/vn-component-kit')
	});
});

test('dev consumer rejects incomplete or unsafe option values', () => {
	assert.throws(() => parseDevArguments(['--components']), /requires a value/);
	assert.throws(() => parseDevArguments(['--port', '0']), /between 1 and 65535/);
	assert.throws(() => parseDevArguments(['--unknown']), /Unknown option/);
});

test('dev consumer recognizes a linked package entrypoint by real path', async () => {
	const realPaths = new Map([
		[resolve('/consumer/node_modules/@newchobo/vn-components/scripts/dev-consumer.mjs'), resolve('/kit/scripts/dev-consumer.mjs')],
		[resolve('/kit/scripts/dev-consumer.mjs'), resolve('/kit/scripts/dev-consumer.mjs')],
		[resolve('/other/dev-consumer.mjs'), resolve('/other/dev-consumer.mjs')]
	]);
	const resolveRealPath = async (path) => realPaths.get(path) ?? path;

	assert.equal(await isMainModule(
		'/consumer/node_modules/@newchobo/vn-components/scripts/dev-consumer.mjs',
		'/kit/scripts/dev-consumer.mjs',
		resolveRealPath
	), true);
	assert.equal(await isMainModule('/other/dev-consumer.mjs', '/kit/scripts/dev-consumer.mjs', resolveRealPath), false);
});
