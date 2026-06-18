import { createElement, Fragment, type ReactElement } from "react";
import { nodeToReactElement } from "./converter.js";
import { parseHTML } from "./parser.js";

export { convertAttributesToProps, nodeToReactElement } from "./converter.js";
export { parseHTML } from "./parser.js";
export type { ParsedNode } from "./types.js";
export { decodeEntities, parseAttributes, parseStyle } from "./utils.js";

export function chtr(html: string): ReactElement | ReactElement[] {
	const nodes = parseHTML(html);

	if (nodes.length === 0) {
		return createElement(Fragment, {});
	}

	if (nodes.length === 1) {
		const element = nodeToReactElement(nodes[0], 0);
		if (typeof element === "string") {
			return createElement(Fragment, {}, element);
		}
		return element || createElement(Fragment, {});
	}

	const elements: (ReactElement | string)[] = [];
	for (let i = 0; i < nodes.length; i++) {
		const element = nodeToReactElement(nodes[i], i);
		if (element !== null) {
			elements.push(element);
		}
	}

	return createElement(Fragment, {}, ...elements);
}

export default chtr;
