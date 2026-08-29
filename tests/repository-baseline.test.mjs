import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('repository baseline enforces shared UTF-8, LF, binary, and lint rules', () => {
	const editorConfig = readFileSync(join(root, '.editorconfig'), 'utf8');
	const checker = JSON.parse(readFileSync(join(root, '.editorconfig-checker.json'), 'utf8'));
	const attributes = readFileSync(join(root, '.gitattributes'), 'utf8');
	const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

	assert.match(editorConfig, /charset = utf-8/);
	assert.match(editorConfig, /end_of_line = lf/);
	assert.match(editorConfig, /insert_final_newline = true/);
	assert.match(editorConfig, /trim_trailing_whitespace = true/);
	assert.equal(checker.Version, 'v3.11.1');
	assert.equal(checker.NoColor, true);
	assert.match(attributes, /^\* text=auto eol=lf/m);
	for (const extension of ['gif', 'ico', 'icns', 'jpg', 'jpeg', 'png', 'webp', 'woff', 'woff2']) {
		assert.match(attributes, new RegExp(`^\\*\\.${extension} binary$`, 'm'));
	}
	assert.equal(manifest.devDependencies['editorconfig-checker'], '6.1.1');
	assert.equal(manifest.scripts.lint, 'npm run lint:editorconfig');
	assert.match(manifest.scripts.validate, /^npm run lint/);
});
