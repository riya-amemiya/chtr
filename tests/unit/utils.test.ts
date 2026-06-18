import { describe, expect, test } from "bun:test";
import {
	decodeEntities,
	parseAttributes,
	parseStyle,
} from "../../src/index.js";

describe("decodeEntities", () => {
	test("decodes named entities", () => {
		expect(decodeEntities("Tom &amp; Jerry")).toBe("Tom & Jerry");
		expect(decodeEntities("&lt;tag&gt;")).toBe("<tag>");
		expect(decodeEntities("&quot;quoted&quot;")).toBe('"quoted"');
	});

	test("decodes nbsp to U+00A0", () => {
		expect(decodeEntities("a&nbsp;b")).toBe("a b");
	});

	test("decodes decimal numeric references", () => {
		expect(decodeEntities("&#65;")).toBe("A");
	});

	test("decodes hexadecimal numeric references", () => {
		expect(decodeEntities("&#x41;")).toBe("A");
		expect(decodeEntities("&#x263A;")).toBe("☺");
	});

	test("leaves unknown entities untouched", () => {
		expect(decodeEntities("&unknownentity;")).toBe("&unknownentity;");
	});

	test("returns the input unchanged when there is no ampersand", () => {
		expect(decodeEntities("plain text")).toBe("plain text");
	});
});

describe("parseAttributes", () => {
	test("parses a simple double-quoted attribute", () => {
		expect(parseAttributes('id="main"')).toEqual({ id: "main" });
	});

	test("parses multiple attributes", () => {
		expect(parseAttributes('type="text" name="username"')).toEqual({
			type: "text",
			name: "username",
		});
	});

	test("decodes entities inside attribute values", () => {
		expect(parseAttributes('href="/s?a=1&amp;b=2"')).toEqual({
			href: "/s?a=1&b=2",
		});
	});

	test("keeps hyphenated and namespaced names verbatim", () => {
		expect(parseAttributes('data-id="42" xml:lang="en"')).toEqual({
			"data-id": "42",
			"xml:lang": "en",
		});
	});

	test("treats a valueless attribute as an empty string", () => {
		expect(parseAttributes("disabled")).toEqual({ disabled: "" });
	});
});

describe("parseStyle", () => {
	test("parses simple declarations", () => {
		expect(parseStyle("color: red; font-size: 16px")).toEqual({
			color: "red",
			fontSize: "16px",
		});
	});

	test("converts hyphenated property names to camelCase", () => {
		expect(parseStyle("background-color: blue")).toEqual({
			backgroundColor: "blue",
		});
	});

	test("preserves a value that itself contains a colon", () => {
		expect(parseStyle("background: url(http://x/y)")).toEqual({
			background: "url(http://x/y)",
		});
	});

	test("keeps CSS custom property names verbatim", () => {
		expect(parseStyle("--my-var: 10px")).toEqual({ "--my-var": "10px" });
	});
});
