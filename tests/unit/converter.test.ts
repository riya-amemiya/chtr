import { describe, expect, test } from "bun:test";
import { convertAttributesToProps } from "../../src/index.js";

describe("convertAttributesToProps name mapping", () => {
	test("maps class to className", () => {
		expect(convertAttributesToProps({ class: "btn" })).toEqual({
			className: "btn",
		});
	});

	test("maps for to htmlFor", () => {
		expect(convertAttributesToProps({ for: "input-id" })).toEqual({
			htmlFor: "input-id",
		});
	});

	test("maps assorted HTML attribute names to their React equivalents", () => {
		expect(
			convertAttributesToProps({
				tabindex: "0",
				colspan: "2",
				maxlength: "10",
				cellpadding: "4",
			}),
		).toEqual({
			tabIndex: "0",
			colSpan: "2",
			maxLength: "10",
			cellPadding: "4",
		});
	});

	test("keeps data-* and aria-* keys verbatim", () => {
		expect(
			convertAttributesToProps({
				"data-testid": "x",
				"aria-label": "Close",
			}),
		).toEqual({
			"data-testid": "x",
			"aria-label": "Close",
		});
	});
});

describe("convertAttributesToProps boolean attributes", () => {
	test("an empty string value becomes true", () => {
		expect(convertAttributesToProps({ checked: "" })).toEqual({
			checked: true,
		});
	});

	test("the literal string false becomes false", () => {
		expect(convertAttributesToProps({ checked: "false" })).toEqual({
			checked: false,
		});
	});

	test("a present boolean attribute is true regardless of its value", () => {
		expect(convertAttributesToProps({ disabled: "disabled" })).toEqual({
			disabled: true,
		});
		expect(convertAttributesToProps({ readonly: "" })).toEqual({
			readOnly: true,
		});
	});
});

describe("convertAttributesToProps non-boolean attributes", () => {
	test("a string value is kept as a string and never coerced to true", () => {
		expect(convertAttributesToProps({ title: "title" })).toEqual({
			title: "title",
		});
	});

	test("an empty string on a non-boolean attribute stays an empty string", () => {
		expect(convertAttributesToProps({ value: "" })).toEqual({ value: "" });
	});
});

describe("convertAttributesToProps style", () => {
	test("parses an inline style string into an object", () => {
		expect(
			convertAttributesToProps({ style: "color: red; font-size: 16px" }),
		).toEqual({
			style: { color: "red", fontSize: "16px" },
		});
	});
});
