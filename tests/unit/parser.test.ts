import { describe, expect, test } from "bun:test";
import type { ParsedNode } from "../../src/index.js";
import { parseHTML } from "../../src/index.js";

describe("parseHTML basic structure", () => {
	test("parses a single element with a text child", () => {
		const nodes = parseHTML("<div>Hello</div>");
		expect(nodes).toHaveLength(1);
		const div = nodes[0];
		expect(div.type).toBe("element");
		expect(div.tagName).toBe("div");
		expect(div.children).toHaveLength(1);
		const text = (div.children as ParsedNode[])[0];
		expect(text.type).toBe("text");
		expect(text.text).toBe("Hello");
	});

	test("lower-cases tag names", () => {
		const nodes = parseHTML("<DIV><SPAN>x</SPAN></DIV>");
		expect(nodes[0].tagName).toBe("div");
		expect((nodes[0].children as ParsedNode[])[0].tagName).toBe("span");
	});

	test("parses attributes into the attributes map", () => {
		const nodes = parseHTML('<a href="/home" class="link">Home</a>');
		expect(nodes[0].attributes).toEqual({
			href: "/home",
			class: "link",
		});
	});

	test("drops whitespace-only text between elements", () => {
		const nodes = parseHTML("<ul>\n  <li>A</li>\n</ul>");
		const ul = nodes[0];
		expect(ul.children).toHaveLength(1);
		expect((ul.children as ParsedNode[])[0].tagName).toBe("li");
	});

	test("returns multiple roots for sibling elements", () => {
		const nodes = parseHTML("<p>one</p><p>two</p>");
		expect(nodes).toHaveLength(2);
		expect(nodes[0].tagName).toBe("p");
		expect(nodes[1].tagName).toBe("p");
	});
});

describe("parseHTML self-closing and void elements", () => {
	test("void elements have no children", () => {
		const nodes = parseHTML('<img src="a.jpg" /><br><hr>');
		expect(nodes).toHaveLength(3);
		expect(nodes[0].tagName).toBe("img");
		expect(nodes[0].children).toEqual([]);
		expect(nodes[1].tagName).toBe("br");
		expect(nodes[2].tagName).toBe("hr");
	});

	test("a slash inside an attribute value is not treated as self-closing", () => {
		const nodes = parseHTML('<a href="/home">Home</a>');
		expect(nodes).toHaveLength(1);
		const anchor = nodes[0];
		expect(anchor.tagName).toBe("a");
		expect(anchor.children).toHaveLength(1);
		const text = (anchor.children as ParsedNode[])[0];
		expect(text.type).toBe("text");
		expect(text.text).toBe("Home");
	});

	test("builds nested lists with anchors that have slashed hrefs", () => {
		const nodes = parseHTML(
			'<ul><li><a href="/a">A</a></li><li><a href="/b">B</a></li></ul>',
		);
		expect(nodes).toHaveLength(1);
		const ul = nodes[0];
		expect(ul.tagName).toBe("ul");
		const items = ul.children as ParsedNode[];
		expect(items).toHaveLength(2);

		const firstAnchor = (items[0].children as ParsedNode[])[0];
		expect(firstAnchor.tagName).toBe("a");
		expect(firstAnchor.attributes).toEqual({ href: "/a" });
		expect((firstAnchor.children as ParsedNode[])[0].text).toBe("A");

		const secondAnchor = (items[1].children as ParsedNode[])[0];
		expect(secondAnchor.tagName).toBe("a");
		expect(secondAnchor.attributes).toEqual({ href: "/b" });
		expect((secondAnchor.children as ParsedNode[])[0].text).toBe("B");
	});
});

describe("parseHTML entities, comments and doctype", () => {
	test("decodes entities in text nodes", () => {
		const nodes = parseHTML("<p>Tom &amp; Jerry</p>");
		const text = (nodes[0].children as ParsedNode[])[0];
		expect(text.text).toBe("Tom & Jerry");
	});

	test("ignores comments and doctype declarations", () => {
		const nodes = parseHTML("<!DOCTYPE html><!-- a comment --><p>hi</p>");
		expect(nodes).toHaveLength(1);
		expect(nodes[0].tagName).toBe("p");
		expect((nodes[0].children as ParsedNode[])[0].text).toBe("hi");
	});
});
