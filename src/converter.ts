import { createElement, type ReactElement } from "react";
import { HTML_BOOLEAN_ATTRIBUTES, HTML_TO_REACT_ATTRS } from "./constants.js";
import type { ParsedNode } from "./types.js";
import { parseStyle } from "./utils.js";

export function convertAttributesToProps(
	attributes: Record<string, string>,
): Record<string, unknown> {
	const props: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(attributes)) {
		const lowerKey = key.toLowerCase();
		const reactKey = HTML_TO_REACT_ATTRS[lowerKey] || key;

		if (reactKey === "style") {
			props.style = parseStyle(value);
		} else if (HTML_BOOLEAN_ATTRIBUTES.has(lowerKey)) {
			props[reactKey] = value !== "false";
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
