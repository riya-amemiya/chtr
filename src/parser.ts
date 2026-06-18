import { SELF_CLOSING_TAGS } from "./constants.js";
import type { ParsedNode } from "./types.js";
import { decodeEntities, parseAttributes } from "./utils.js";

function isNameChar(code: number): boolean {
	return (
		(code >= 97 && code <= 122) ||
		(code >= 65 && code <= 90) ||
		(code >= 48 && code <= 57) ||
		code === 95 ||
		code === 45
	);
}

export function parseHTML(html: string): ParsedNode[] {
	const stack: ParsedNode[] = [];
	const result: ParsedNode[] = [];
	let currentParent: ParsedNode | null = null;
	const { length } = html;
	let i = 0;

	const addText = (raw: string): void => {
		if (!raw.trim()) {
			return;
		}
		const textNode: ParsedNode = { type: "text", text: decodeEntities(raw) };
		if (currentParent) {
			currentParent.children = currentParent.children || [];
			currentParent.children.push(textNode);
		} else {
			result.push(textNode);
		}
	};

	while (i < length) {
		const lt = html.indexOf("<", i);
		if (lt === -1) {
			addText(html.slice(i));
			break;
		}
		if (lt > i) {
			addText(html.slice(i, lt));
		}

		const next = html.charCodeAt(lt + 1);

		if (next === 33) {
			if (html[lt + 2] === "-" && html[lt + 3] === "-") {
				const end = html.indexOf("-->", lt + 4);
				i = end === -1 ? length : end + 3;
				continue;
			}
			const end = html.indexOf(">", lt + 2);
			i = end === -1 ? length : end + 1;
			continue;
		}

		if (next === 47) {
			const end = html.indexOf(">", lt + 2);
			if (end === -1) {
				addText(html.slice(lt));
				break;
			}
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
			i = end + 1;
			continue;
		}

		if (isNameChar(next)) {
			const end = html.indexOf(">", lt + 1);
			if (end === -1) {
				addText(html.slice(lt));
				break;
			}

			const inner = html.slice(lt + 1, end);
			let nameEnd = 0;
			while (nameEnd < inner.length && isNameChar(inner.charCodeAt(nameEnd))) {
				nameEnd++;
			}

			const tagName = inner.slice(0, nameEnd).toLowerCase();
			const attrString = inner.slice(nameEnd);
			const node: ParsedNode = {
				type: "element",
				tagName,
				attributes: attrString ? parseAttributes(attrString) : {},
				children: [],
			};

			if (currentParent) {
				currentParent.children = currentParent.children || [];
				currentParent.children.push(node);
			}

			const isSelfClosing =
				SELF_CLOSING_TAGS.has(tagName) || attrString.trimEnd().endsWith("/");

			if (!isSelfClosing) {
				stack.push(node);
				currentParent = node;
			} else if (!currentParent) {
				result.push(node);
			}

			i = end + 1;
			continue;
		}

		addText("<");
		i = lt + 1;
	}

	while (stack.length > 0) {
		const node = stack.pop();
		if (node) {
			result.push(node);
		}
	}

	return result;
}
