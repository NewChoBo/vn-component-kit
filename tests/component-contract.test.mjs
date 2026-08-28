import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const components = require(join(root, 'index.js'));

test('button properties are explicit, normalized, and immutable', () => {
	const button = components.normalizeButtonProperties({
		variant: 'text',
		label: '  Continue  ',
		description: '  Keep reading  ',
		name: 'continue-story',
		value: 3
	});

	assert.deepEqual(button, {
		variant: 'text',
		type: 'button',
		label: 'Continue',
		description: 'Keep reading',
		icon: null,
		action: null,
		name: 'continue-story',
		value: '3',
		disabled: false
	});
	assert.equal(Object.isFrozen(button), true);
	assert.throws(() => components.normalizeButtonProperties({ variant: 'icon', label: 'Back' }), /require valid icon/);
});
test('choice definitions require a bounded set of unique property-driven options', () => {
	const definition = components.normalizeChoiceDefinition({
		id: 'first-response',
		ariaLabel: 'First response',
		situation: 'Two paths are closing.',
		constraint: 'Only one can be secured.',
		options: [
			{ id: 'secure-exit', label: 'Secure the exit' },
			{ id: 'check-signal', label: 'Check the signal', description: 'Learn what triggered the alarm' }
		]
	});

	assert.equal(definition.options.length, 2);
	assert.equal(definition.question, null);
	assert.equal(Object.isFrozen(definition), true);
	assert.equal(Object.isFrozen(definition.options), true);
	assert.equal(Object.isFrozen(definition.options[0]), true);

	assert.throws(() => components.normalizeChoiceDefinition({
		id: 'too-small',
		ariaLabel: 'Too small',
		situation: 'Only one option exists.',
		options: [{ id: 'only', label: 'Only option' }]
	}), /between 2 and 4/);

	assert.throws(() => components.normalizeChoiceDefinition({
		id: 'duplicate',
		ariaLabel: 'Duplicate options',
		situation: 'Two labels share an id.',
		options: [
			{ id: 'same', label: 'First' },
			{ id: 'same', label: 'Second' }
		]
	}), /Duplicate option id/);
});

test('runtime source constructs dynamic UI without markup strings', () => {
	const source = readFileSync(join(root, 'index.js'), 'utf8');
	const css = readFileSync(join(root, 'index.css'), 'utf8');

	assert.doesNotMatch(source, /innerHTML|outerHTML|insertAdjacentHTML|\.map\([^)]*\)\.join\(/);
	assert.match(source, /createElement\('button'\)/);
	assert.match(source, /createElement\(buttonTag\)/);
	assert.match(source, /replaceChildren/);
	assert.match(css, /min-height:\s*2\.75rem/);
	assert.match(css, /user-select:\s*none/);
});

test('package remains engine-independent and guarded from accidental publication', () => {
	const source = readFileSync(join(root, 'index.js'), 'utf8');
	const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

	assert.doesNotMatch(source, /Monogatari|monogatari|Lily|Aether/);
	assert.equal(manifest.private, true);
	assert.deepEqual(manifest.engines, { node: '>=24 <25' });
	assert.deepEqual(manifest.dependencies, undefined);
});
