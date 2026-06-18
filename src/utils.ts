import type { CSSProperties } from "react";
import { HTML_NAMED_ENTITIES } from "./constants.js";

// Matches a single attribute. The name allows any character that cannot
// terminate a name (whitespace, quotes, "=", "/", ">") so namespaced and
// hyphenated names such as `xml:lang` or `data-id` are captured too.
const ATTR_REGEX = /([^\s/>"'=]+)(?:=(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;

// Matches a named or numeric (decimal / hexadecimal) HTML character reference.
const ENTITY_REGEX = /&(#[xX]?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g;

// Matches a CSS hyphenated segment used when converting to camelCase.
const CSS_HYPHEN_REGEX = /-([a-z])/g;

/**
 * Decodes HTML character references (named, decimal and hexadecimal) into the
 * characters they represent. Unknown references are left untouched.
 */
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

/**
 * Parses the raw attribute string of an opening tag into a name/value map.
 * Attribute values have their HTML entities decoded.
 */
export function parseAttributes(attrString: string): Record<string, string> {
	const attributes: Record<string, string> = {};

	for (const match of attrString.matchAll(ATTR_REGEX)) {
		const name = match[1];
		const value = match[2] ?? match[3] ?? match[4] ?? "";
		attributes[name] = decodeEntities(value);
	}

	return attributes;
}

/**
 * Parses an inline `style` string into a React `CSSProperties` object,
 * converting hyphenated property names to camelCase while preserving CSS
 * custom properties (names beginning with `--`).
 */
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

		// CSS custom properties must keep their literal `--name` form.
		const camelProperty = property.startsWith("--")
			? property
			: property.replace(CSS_HYPHEN_REGEX, (_, letter: string) =>
					letter.toUpperCase(),
				);
		style[camelProperty] = value;
	}

	return style as CSSProperties;
}
