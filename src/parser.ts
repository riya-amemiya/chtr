import { SELF_CLOSING_TAGS } from "./constants.js";
import type { ParsedNode } from "./types.js";
import { parseAttributes } from "./utils.js";

export function parseHTML(html: string): ParsedNode[] {
	const stack: ParsedNode[] = [];
	const result: ParsedNode[] = [];
	let currentParent: ParsedNode | null = null;

	const tagRegex =
		/<(\/)?([\w-]+)([^>]*)>|([^<]+)|<!--[\s\S]*?-->|<!DOCTYPE[^>]*>/gi;

	for (const match of html.matchAll(tagRegex)) {
		const isClosing = match[1];
		const tagName = match[2];
		const attrString = match[3];
		const textContent = match[4];

		if (textContent) {
			const trimmedText = textContent.trim();
			if (trimmedText) {
				const textNode: ParsedNode = {
					type: "text",
					text: textContent,
				};

				if (currentParent) {
					currentParent.children = currentParent.children || [];
					currentParent.children.push(textNode);
				} else {
					result.push(textNode);
				}
			}
		} else if (tagName) {
			if (isClosing) {
				if (stack.length > 0) {
					const node = stack.pop();
					if (stack.length > 0) {
						currentParent = stack[stack.length - 1];
					} else {
						currentParent = null;
						if (node) {
							result.push(node);
						}
					}
				}
			} else {
				const node: ParsedNode = {
					type: "element",
					tagName: tagName.toLowerCase(),
					attributes: attrString ? parseAttributes(attrString) : {},
					children: [],
				};

				if (currentParent) {
					currentParent.children = currentParent.children || [];
					currentParent.children.push(node);
				}

				const isSelfClosing =
					SELF_CLOSING_TAGS.has(node.tagName ?? "") ||
					(attrString ?? "").includes("/");

				if (!isSelfClosing) {
					stack.push(node);
					currentParent = node;
				} else if (!currentParent) {
					result.push(node);
				}
			}
		}
	}

	while (stack.length > 0) {
		const node = stack.pop();
		if (node) {
			result.push(node);
		}
	}

	return result;
}
