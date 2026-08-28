'use strict';

(function exposeVnComponents(root) {
	const buttonTag = 'nc-vn-button';
	const choiceTag = 'nc-vn-choice';
	const uiScaleTag = 'nc-vn-ui-scale';
	const buttonVariants = Object.freeze(['icon', 'text']);
	const buttonTypes = Object.freeze(['button', 'submit', 'reset']);
	const uiScaleValues = Object.freeze(['compact', 'standard', 'large']);
	const tokenPattern = /^[a-z0-9_-]+(?:\s+[a-z0-9_-]+)*$/i;
	const identifierPattern = /^[a-z][a-z0-9-]*$/;
	let uiScaleInstanceCount = 0;

	function requiredText(value, property) {
		if (typeof value !== 'string' || value.trim() === '') throw new TypeError(`${property} must be a non-empty string.`);
		return value.trim();
	}

	function optionalText(value, property) {
		if (value === null || value === undefined || value === '') return null;
		return requiredText(value, property);
	}

	function optionalIdentifier(value, property) {
		if (value === null || value === undefined || value === '') return null;
		if (typeof value !== 'string' || !identifierPattern.test(value)) {
			throw new TypeError(`${property} must use lowercase letters, numbers, and hyphens.`);
		}
		return value;
	}

	function requiredIdentifier(value, property) {
		const text = requiredText(value, property);
		if (!identifierPattern.test(text)) throw new TypeError(`${property} must use lowercase letters, numbers, and hyphens.`);
		return text;
	}

	function normalizeButtonProperties(input = {}) {
		const variant = input.variant ?? 'text';
		const type = input.type ?? 'button';
		if (!buttonVariants.includes(variant)) throw new TypeError(`Unsupported button variant: ${variant}`);
		if (!buttonTypes.includes(type)) throw new TypeError(`Unsupported button type: ${type}`);

		const label = requiredText(input.label, 'label');
		const icon = input.icon ?? null;
		if (variant === 'icon' && (typeof icon !== 'string' || !tokenPattern.test(icon))) {
			throw new TypeError('icon buttons require valid icon class tokens.');
		}

		return Object.freeze({
			variant,
			type,
			label,
			description: variant === 'text' ? optionalText(input.description, 'description') : null,
			icon: variant === 'icon' ? icon : null,
			action: optionalIdentifier(input.action, 'action'),
			name: optionalIdentifier(input.name, 'name'),
			value: input.value === null || input.value === undefined ? '' : String(input.value),
			disabled: input.disabled === true
		});
	}

	function normalizeChoiceDefinition(input) {
		if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('definition must be an object.');
		if (!Array.isArray(input.options) || input.options.length < 2 || input.options.length > 4) {
			throw new TypeError('definition.options must contain between 2 and 4 options.');
		}

		const optionIds = new Set();
		const options = input.options.map((option, index) => {
			if (!option || typeof option !== 'object' || Array.isArray(option)) throw new TypeError(`options[${index}] must be an object.`);
			const id = requiredIdentifier(option.id, `options[${index}].id`);
			if (optionIds.has(id)) throw new TypeError(`Duplicate option id: ${id}`);
			optionIds.add(id);
			return Object.freeze({
				id,
				label: requiredText(option.label, `options[${index}].label`),
				description: optionalText(option.description, `options[${index}].description`),
				disabled: option.disabled === true
			});
		});

		return Object.freeze({
			id: requiredIdentifier(input.id, 'definition.id'),
			ariaLabel: requiredText(input.ariaLabel, 'definition.ariaLabel'),
			situation: requiredText(input.situation, 'definition.situation'),
			constraint: optionalText(input.constraint, 'definition.constraint'),
			question: optionalText(input.question, 'definition.question'),
			options: Object.freeze(options)
		});
	}

	function normalizeUiScaleProperties(input = {}) {
		const value = input.value ?? 'standard';
		if (!uiScaleValues.includes(value)) throw new TypeError(`Unsupported UI scale value: ${value}`);

		return Object.freeze({
			value,
			label: requiredText(input.label, 'label'),
			description: optionalText(input.description, 'description'),
			compactLabel: requiredText(input.compactLabel, 'compactLabel'),
			standardLabel: requiredText(input.standardLabel, 'standardLabel'),
			largeLabel: requiredText(input.largeLabel, 'largeLabel'),
			name: optionalIdentifier(input.name, 'name'),
			disabled: input.disabled === true
		});
	}

	function createElementClasses(HTMLElementBase) {
		class VnButtonElement extends HTMLElementBase {
			static get observedAttributes() {
				return ['variant', 'label', 'description', 'icon', 'type', 'action', 'name', 'value', 'disabled'];
			}

			constructor() {
				super();
				this.buttonElement = null;
			}

			connectedCallback() {
				if (!this.buttonElement) {
					this.buttonElement = this.ownerDocument.createElement('button');
					this.buttonElement.addEventListener('click', () => {
						const properties = this.properties;
						this.dispatchEvent(new root.CustomEvent('nc-vn-activate', {
							bubbles: true,
							detail: Object.freeze({ name: properties.name, value: properties.value, action: properties.action })
						}));
					});
					this.replaceChildren(this.buttonElement);
				}
				this.sync();
			}

			attributeChangedCallback() {
				if (this.buttonElement) this.sync();
			}

			get properties() {
				return normalizeButtonProperties({
					variant: this.getAttribute('variant') ?? 'text',
					label: this.getAttribute('label'),
					description: this.getAttribute('description'),
					icon: this.getAttribute('icon'),
					type: this.getAttribute('type') ?? 'button',
					action: this.getAttribute('action'),
					name: this.getAttribute('name'),
					value: this.getAttribute('value'),
					disabled: this.hasAttribute('disabled')
				});
			}

			get label() { return this.getAttribute('label') ?? ''; }
			set label(value) { this.setAttribute('label', requiredText(value, 'label')); }
			get description() { return this.getAttribute('description') ?? ''; }
			set description(value) {
				const normalized = optionalText(value, 'description');
				if (normalized) this.setAttribute('description', normalized);
				else this.removeAttribute('description');
			}
			get disabled() { return this.hasAttribute('disabled'); }
			set disabled(value) { this.toggleAttribute('disabled', value === true); }

			sync() {
				const properties = this.properties;
				const button = this.buttonElement;
				button.className = `nc-vn-button nc-vn-button--${properties.variant}`;
				button.type = properties.type;
				button.disabled = properties.disabled;
				button.removeAttribute('data-action');
				if (properties.action) button.dataset.action = properties.action;
				button.replaceChildren();

				if (properties.variant === 'icon') {
					button.setAttribute('aria-label', properties.label);
					button.setAttribute('title', properties.label);
					const icon = this.ownerDocument.createElement('span');
					icon.className = properties.icon;
					icon.setAttribute('aria-hidden', 'true');
					button.append(icon);
					return;
				}

				button.removeAttribute('aria-label');
				button.removeAttribute('title');
				const label = this.ownerDocument.createElement('span');
				label.className = 'nc-vn-button__label';
				label.textContent = properties.label;
				button.append(label);
				if (properties.description) {
					const description = this.ownerDocument.createElement('span');
					description.className = 'nc-vn-button__description';
					description.textContent = properties.description;
					button.append(description);
				}
			}
		}

		class VnChoiceElement extends HTMLElementBase {
			constructor() {
				super();
				this._definition = null;
			}

			connectedCallback() {
				this.setAttribute('role', 'group');
				this.render();
			}

			get definition() { return this._definition; }
			set definition(value) {
				this._definition = normalizeChoiceDefinition(value);
				if (this.isConnected) this.render();
			}

			render() {
				if (!this._definition) {
					this.replaceChildren();
					return;
				}

				const definition = this._definition;
				this.setAttribute('aria-label', definition.ariaLabel);
				const fragment = this.ownerDocument.createDocumentFragment();
				const context = this.ownerDocument.createElement('div');
				context.className = 'nc-vn-choice__context';
				for (const [kind, copy] of [
					['situation', definition.situation],
					['constraint', definition.constraint],
					['question', definition.question]
				]) {
					if (!copy) continue;
					const paragraph = this.ownerDocument.createElement('p');
					paragraph.className = `nc-vn-choice__${kind}`;
					paragraph.textContent = copy;
					context.append(paragraph);
				}

				const options = this.ownerDocument.createElement('div');
				options.className = 'nc-vn-choice__options';
				for (const option of definition.options) {
					const button = this.ownerDocument.createElement(buttonTag);
					button.setAttribute('variant', 'text');
					button.setAttribute('label', option.label);
					button.setAttribute('name', 'choice');
					button.setAttribute('value', option.id);
					if (option.description) button.setAttribute('description', option.description);
					if (option.disabled) button.setAttribute('disabled', '');
					button.addEventListener('nc-vn-activate', (event) => {
						this.dispatchEvent(new root.CustomEvent('nc-vn-choice', {
							bubbles: true,
							detail: Object.freeze({ definitionId: definition.id, optionId: event.detail.value })
						}));
					});
					options.append(button);
				}

				fragment.append(context, options);
				this.replaceChildren(fragment);
			}
		}

		class VnUiScaleElement extends HTMLElementBase {
			static get observedAttributes() {
				return ['value', 'label', 'description', 'compact-label', 'standard-label', 'large-label', 'name', 'disabled'];
			}

			constructor() {
				super();
				uiScaleInstanceCount += 1;
				this.controlName = `${uiScaleTag}-${uiScaleInstanceCount}`;
				this.fieldsetElement = null;
				this.legendElement = null;
				this.descriptionElement = null;
				this.optionElements = new Map();
			}

			connectedCallback() {
				if (!this.fieldsetElement) this.render();
				this.sync();
			}

			attributeChangedCallback() {
				if (this.fieldsetElement) this.sync();
			}

			get properties() {
				return normalizeUiScaleProperties({
					value: this.getAttribute('value') ?? 'standard',
					label: this.getAttribute('label'),
					description: this.getAttribute('description'),
					compactLabel: this.getAttribute('compact-label'),
					standardLabel: this.getAttribute('standard-label'),
					largeLabel: this.getAttribute('large-label'),
					name: this.getAttribute('name'),
					disabled: this.hasAttribute('disabled')
				});
			}

			get value() { return this.getAttribute('value') ?? 'standard'; }
			set value(value) {
				if (!uiScaleValues.includes(value)) throw new TypeError(`Unsupported UI scale value: ${value}`);
				this.setAttribute('value', value);
			}
			get disabled() { return this.hasAttribute('disabled'); }
			set disabled(value) { this.toggleAttribute('disabled', value === true); }

			render() {
				const fieldset = this.ownerDocument.createElement('fieldset');
				fieldset.className = 'nc-vn-ui-scale';
				const legend = this.ownerDocument.createElement('legend');
				legend.className = 'nc-vn-ui-scale__label';
				const description = this.ownerDocument.createElement('p');
				description.className = 'nc-vn-ui-scale__description';
				const options = this.ownerDocument.createElement('div');
				options.className = 'nc-vn-ui-scale__options';

				for (const optionValue of uiScaleValues) {
					const option = this.ownerDocument.createElement('label');
					option.className = 'nc-vn-ui-scale__option';
					const input = this.ownerDocument.createElement('input');
					input.type = 'radio';
					input.value = optionValue;
					const copy = this.ownerDocument.createElement('span');
					copy.className = 'nc-vn-ui-scale__option-label';
					input.addEventListener('change', () => {
						if (!input.checked) return;
						this.value = optionValue;
						this.dispatchEvent(new root.CustomEvent('nc-vn-ui-scale-change', {
							bubbles: true,
							detail: Object.freeze({ name: this.properties.name, value: optionValue })
						}));
					});
					option.append(input, copy);
					options.append(option);
					this.optionElements.set(optionValue, { input, copy });
				}

				fieldset.append(legend, description, options);
				this.replaceChildren(fieldset);
				this.fieldsetElement = fieldset;
				this.legendElement = legend;
				this.descriptionElement = description;
			}

			sync() {
				const properties = this.properties;
				this.legendElement.textContent = properties.label;
				this.descriptionElement.textContent = properties.description ?? '';
				this.descriptionElement.hidden = properties.description === null;
				this.fieldsetElement.disabled = properties.disabled;
				const inputName = properties.name ?? this.controlName;
				const labels = {
					compact: properties.compactLabel,
					standard: properties.standardLabel,
					large: properties.largeLabel
				};
				for (const [optionValue, elements] of this.optionElements) {
					elements.input.name = inputName;
					elements.input.checked = optionValue === properties.value;
					elements.copy.textContent = labels[optionValue];
				}
			}
		}

		return Object.freeze({ VnButtonElement, VnChoiceElement, VnUiScaleElement });
	}

	function register(registry = root.customElements, HTMLElementBase = root.HTMLElement) {
		if (!registry || typeof HTMLElementBase !== 'function') return false;
		const classes = createElementClasses(HTMLElementBase);
		if (!registry.get(buttonTag)) registry.define(buttonTag, classes.VnButtonElement);
		if (!registry.get(choiceTag)) registry.define(choiceTag, classes.VnChoiceElement);
		if (!registry.get(uiScaleTag)) registry.define(uiScaleTag, classes.VnUiScaleElement);
		return true;
	}

	const api = Object.freeze({
		buttonTag,
		choiceTag,
		uiScaleTag,
		uiScaleValues,
		createElementClasses,
		normalizeButtonProperties,
		normalizeChoiceDefinition,
		normalizeUiScaleProperties,
		register
	});
	root.NewChoboVnComponents = api;
	if (typeof module === 'object' && module.exports) module.exports = api;
	register();
}(globalThis));
