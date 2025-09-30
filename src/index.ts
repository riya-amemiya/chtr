import { createElement, Fragment, type ReactElement } from "react";
import { nodeToReactElement } from "./converter.js";
import { parseHTML } from "./parser.js";

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

	const elements = nodes
		.map((node, i) => nodeToReactElement(node, i))
		.filter((el): el is ReactElement | string => el !== null);

	return createElement(Fragment, {}, ...elements);
}

export default chtr;
