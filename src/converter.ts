import { createElement, type ReactElement } from "react";
import { HTML_TO_REACT_ATTRS } from "./constants.js";
import type { ParsedNode } from "./types.js";
import { parseStyle } from "./utils.js";

export function convertAttributesToProps(
	attributes: Record<string, string>,
): Record<string, unknown> {
	const props: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(attributes)) {
		const reactKey = HTML_TO_REACT_ATTRS[key.toLowerCase()] || key;

		if (reactKey === "style" && typeof value === "string") {
			props.style = parseStyle(value);
		} else if (reactKey.startsWith("data-") || reactKey.startsWith("aria-")) {
			props[reactKey] = value;
		} else if (value === "" || value === key) {
			props[reactKey] = true;
		} else {
			props[reactKey] = value;
		}
	}

	return props;
}

export function nodeToReactElement(
	node: ParsedNode,
	index: number,
): ReactElement | string | null {
	if (node.type === "text") {
		return node.text || null;
	}

	if (node.type === "element" && node.tagName) {
		const props = node.attributes
			? convertAttributesToProps(node.attributes)
			: {};
		props.key = index;

		const children =
			node.children?.map((child, i) => nodeToReactElement(child, i)) || [];

		return createElement(node.tagName, props, ...children);
	}

	return null;
}
