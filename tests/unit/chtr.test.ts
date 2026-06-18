import { describe, expect, test } from "bun:test";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chtr } from "../../src/index.js";

// `chtr` returns a single element, an array of elements or a fragment, all of
// which `renderToStaticMarkup` accepts as a `ReactNode`.
function render(html: string): string {
	return renderToStaticMarkup(chtr(html) as ReactElement);
}

describe("chtr return shape", () => {
	test("empty input renders to an empty string", () => {
		expect(render("")).toBe("");
	});

	test("a single root renders that element", () => {
		expect(render("<div>Hello World</div>")).toBe("<div>Hello World</div>");
	});

	test("multiple roots are rendered side by side", () => {
		expect(render("<div>First</div><div>Second</div>")).toBe(
			"<div>First</div><div>Second</div>",
		);
	});
});

describe("chtr attribute rendering", () => {
	test("className is rendered as the HTML class attribute", () => {
		const markup = render('<div class="test-class">Content</div>');
		expect(markup).toContain('class="test-class"');
		expect(markup).toContain("Content");
	});

	test("for is rendered as the HTML for attribute via htmlFor", () => {
		const markup = render('<label for="input-id">Label</label>');
		expect(markup).toContain('for="input-id"');
	});

	test("inline styles are rendered", () => {
		const markup = render(
			'<div style="color: red; font-size: 16px">Styled</div>',
		);
		expect(markup).toContain("color:red");
		expect(markup).toContain("font-size:16px");
	});

	test("data and aria attributes are preserved", () => {
		const markup = render(
			'<button aria-label="Close" data-value="123">X</button>',
		);
		expect(markup).toContain('aria-label="Close"');
		expect(markup).toContain('data-value="123"');
	});
});

describe("chtr self-closing and nesting", () => {
	test("void elements render without children", () => {
		const markup = render('<img src="test.jpg" alt="Test" />');
		expect(markup).toContain('src="test.jpg"');
		expect(markup).toContain('alt="Test"');
	});

	test("an anchor with a slashed href keeps its text child", () => {
		expect(render('<a href="/home">Home</a>')).toBe('<a href="/home">Home</a>');
	});

	test("nested lists with slashed hrefs are rendered correctly", () => {
		expect(
			render('<ul><li><a href="/a">A</a></li><li><a href="/b">B</a></li></ul>'),
		).toBe('<ul><li><a href="/a">A</a></li><li><a href="/b">B</a></li></ul>');
	});
});

describe("chtr entity handling", () => {
	test("decoded ampersands are re-encoded on output", () => {
		// `decodeEntities` turns `&amp;` into `&`; React re-encodes it as `&amp;`.
		expect(render("<p>Tom &amp; Jerry</p>")).toBe("<p>Tom &amp; Jerry</p>");
	});
});
