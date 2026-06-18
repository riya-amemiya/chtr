import type { CSSProperties } from "react";
import { HTML_NAMED_ENTITIES } from "./constants.js";

const ATTR_REGEX = /([^\s/>"'=]+)(?:=(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
const ENTITY_REGEX = /&(#[xX]?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g;
const CSS_HYPHEN_REGEX = /-([a-z])/g;

/** Decodes named, decimal and hexadecimal HTML character references. */
export function decodeEntities(input: string): string {
	if (input.indexOf("&") === -1) {
		return input;
	}

	return input.replace(ENTITY_REGEX, (match, body: string) => {
		if (body[0] === "#") {
			const isHex = body[1] === "x" || body[1] === "X";
			const codePoint = Number.parseInt(
				body.slice(isHex ? 2 : 1),
				isHex ? 16 : 10,
			);
			if (Number.isNaN(codePoint) || codePoint < 0 || codePoint > 0x10ffff) {
				return match;
			}
			try {
				return String.fromCodePoint(codePoint);
			} catch {
				return match;
			}
		}

		const decoded = HTML_NAMED_ENTITIES[body];
		return decoded === undefined ? match : decoded;
	});
}

/** Parses an opening tag's attribute string into a name/value map. */
export function parseAttributes(attrString: string): Record<string, string> {
	const attributes: Record<string, string> = {};

	for (const match of attrString.matchAll(ATTR_REGEX)) {
		const name = match[1];
		const value = match[2] ?? match[3] ?? match[4] ?? "";
		attributes[name] = decodeEntities(value);
	}

	return attributes;
}

/** Parses an inline `style` string into a React `CSSProperties` object. */
export function parseStyle(styleString: string): CSSProperties {
	const style: Record<string, string> = {};
	const declarations = styleString.split(";");

	for (const declaration of declarations) {
		const colonIndex = declaration.indexOf(":");
		if (colonIndex === -1) {
			continue;
		}

		const property = declaration.slice(0, colonIndex).trim();
		const value = declaration.slice(colonIndex + 1).trim();
		if (!(property && value)) {
			continue;
		}

		const camelProperty = property.startsWith("--")
			? property
			: property.replace(CSS_HYPHEN_REGEX, (_, letter: string) =>
					letter.toUpperCase(),
				);
		style[camelProperty] = value;
	}

	return style as CSSProperties;
}
