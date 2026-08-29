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

test('memory items are property-driven, validated, and immutable', () => {
	const items = components.normalizeMemoryItems([
		{ id: 'story', mark: 'MEM', title: 'Story memories', description: 'Locked' }
	]);

	assert.deepEqual(items, [
		{ id: 'story', mark: 'MEM', title: 'Story memories', description: 'Locked' }
	]);
	assert.equal(Object.isFrozen(items), true);
	assert.equal(Object.isFrozen(items[0]), true);
	assert.throws(() => components.normalizeMemoryItems({}), /items must be an array/);
	assert.throws(() => components.normalizeMemoryItems([
		{ id: 'Story Memory', mark: 'MEM', title: 'Story memories', description: 'Locked' }
	]), /lowercase letters/);
	assert.throws(() => components.normalizeMemoryItems([
		{ id: 'story', mark: 'MEM', title: 'Story memories' }
	]), /description must be a non-empty string/);
});

test('viewport guard classifies a consumer-owned continuous viewport contract', () => {
	const contract = components.normalizeViewportContract({
		minShortSide: 360,
		minLongSide: 640,
		maxWidth: 2560,
		maxHeight: 1440
	});

	assert.deepEqual(contract, { minShortSide: 360, minLongSide: 640, maxWidth: 2560, maxHeight: 1440 });
	assert.equal(components.viewportState({ width: 360, height: 640 }, contract), 'supported');
	assert.equal(components.viewportState({ width: 640, height: 360 }, contract), 'supported');
	assert.equal(components.viewportState({ width: 359, height: 640 }, contract), 'unsupported');
	assert.equal(components.viewportState({ width: 400, height: 400 }, contract), 'unsupported');
	assert.equal(components.viewportState({ width: 2561, height: 1440 }, contract), 'bounded');
	assert.throws(() => components.normalizeViewportContract({ minShortSide: 640, minLongSide: 360 }), /minLongSide/);
});

test('UI scale properties expose one bounded three-step accessibility contract', () => {
	const properties = components.normalizeUiScaleProperties({
		value: 'large',
		label: '  UI size  ',
		description: '  Changes text and control sizing  ',
		compactLabel: 'Small',
		standardLabel: 'Standard',
		largeLabel: 'Large',
		name: 'ui-scale'
	});

	assert.deepEqual(properties, {
		value: 'large',
		label: 'UI size',
		description: 'Changes text and control sizing',
		compactLabel: 'Small',
		standardLabel: 'Standard',
		largeLabel: 'Large',
		name: 'ui-scale',
		disabled: false
	});
	assert.equal(Object.isFrozen(properties), true);
	assert.deepEqual(components.uiScaleValues, ['compact', 'standard', 'large']);
	assert.throws(() => components.normalizeUiScaleProperties({
		value: 'huge',
		label: 'UI size',
		compactLabel: 'Small',
		standardLabel: 'Standard',
		largeLabel: 'Large'
	}), /Unsupported UI scale/);
});

test('runtime source constructs dynamic UI without markup strings', () => {
	const source = readFileSync(join(root, 'index.js'), 'utf8');
	const css = readFileSync(join(root, 'index.css'), 'utf8');

	assert.doesNotMatch(source, /innerHTML|outerHTML|insertAdjacentHTML|\.map\([^)]*\)\.join\(/);
	assert.match(source, /createElement\('button'\)/);
	assert.match(source, /createElement\('article'\)/);
	assert.match(source, /createElement\(buttonTag\)/);
	assert.match(source, /createElement\('fieldset'\)/);
	assert.match(source, /createElement\('input'\)/);
	assert.match(source, /ArrowRight:\s*1[\s\S]*ArrowLeft:\s*-1/);
	assert.match(source, /event\.key === ' '[\s\S]*event\.key === 'Enter'/);
	assert.match(source, /elements\.input\.focus\(\)[\s\S]*elements\.input\.click\(\)/);
	assert.match(source, /replaceChildren/);
	assert.match(source, /sibling\.setAttribute\('inert',\s*''\)/);
	assert.match(source, /for \(const sibling of this\.inertSiblings\) sibling\.removeAttribute\('inert'\)/);
	assert.match(source, /new root\.MutationObserver\(\(\) => this\.sync\(\)\)/);
	assert.match(css, /min-height:\s*2\.75rem/);
	assert.match(css, /user-select:\s*none/);
	assert.match(css, /\.nc-vn-ui-scale__option[^{]*\{[^}]*min-height:\s*2\.75rem/s);
	assert.match(css, /nc-vn-memory-grid[^{]*\{[^}]*display:\s*block/s);
	assert.match(css, /nc-vn-viewport-guard\[data-state="unsupported"\][^{]*\{[^}]*display:\s*grid/s);
	assert.doesNotMatch(css, /Nanum Myeongjo|lily-gold|lily-bone|rain-courtyard/);
});

test('package remains engine-independent and guarded from accidental publication', () => {
	const source = readFileSync(join(root, 'index.js'), 'utf8');
	const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
	const customElements = JSON.parse(readFileSync(join(root, 'custom-elements.json'), 'utf8'));

	assert.doesNotMatch(source, /Monogatari|monogatari|Lily|Aether/);
	assert.equal(manifest.private, true);
	assert.equal(manifest.browser, 'index.js');
	assert.equal(manifest.customElements, 'custom-elements.json');
	assert.equal(manifest.repository.url, 'git+https://github.com/NewChoBo/vn-component-kit.git');
	assert.deepEqual(manifest.engines, { node: '>=24 <25' });
	assert.deepEqual(manifest.dependencies, undefined);
	assert.equal(customElements.schemaVersion, '2.1.0');
	assert.deepEqual(
		customElements.modules[0].declarations.map(({ tagName }) => tagName),
		['nc-vn-button', 'nc-vn-choice', 'nc-vn-memory-grid', 'nc-vn-ui-scale', 'nc-vn-viewport-guard']
	);
	assert.deepEqual(
		customElements.modules[0].exports.map(({ name }) => name),
		['nc-vn-button', 'nc-vn-choice', 'nc-vn-memory-grid', 'nc-vn-ui-scale', 'nc-vn-viewport-guard']
	);
});
