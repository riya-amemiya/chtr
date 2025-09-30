export interface ParsedNode {
	type: "element" | "text";
	tagName?: string;
	attributes?: Record<string, string>;
	children?: ParsedNode[];
	text?: string;
}
