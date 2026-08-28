import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import test from 'node:test';

import { parseDevArguments } from '../scripts/dev-consumer.mjs';

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
