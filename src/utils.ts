import type { CSSProperties } from "react";

export function parseAttributes(attrString: string): Record<string, string> {
	const attributes: Record<string, string> = {};
	const attrRegex = /(\w+(?:-\w+)*)(?:=(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;

	for (const match of attrString.matchAll(attrRegex)) {
		const name = match[1];
		const value = match[2] || match[3] || match[4] || "";
		attributes[name] = value;
	}

	return attributes;
}

export function parseStyle(styleString: string): CSSProperties {
	const style: Record<string, string> = {};
	const declarations = styleString.split(";");

	for (const declaration of declarations) {
		const [property, value] = declaration.split(":").map((s) => s.trim());
		if (property && value) {
			const camelProperty = property.replace(/-([a-z])/g, (_, letter) =>
				letter.toUpperCase(),
			);
			style[camelProperty] = value;
		}
	}

	return style as CSSProperties;
}
