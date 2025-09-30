import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { chtr } from "../src/index.js";

test("renders a simple div", async () => {
	const { container } = render(chtr("<div>Hello World</div>"));
	await expect.element(container.querySelector("div")).toBeInTheDocument();
	await expect
		.element(container.querySelector("div"))
		.toHaveTextContent("Hello World");
});

test("converts class to className", async () => {
	const { container } = render(chtr('<div class="test-class">Content</div>'));
	const div = container.querySelector("div");
	await expect.element(div).toHaveClass("test-class");
});

test("handles nested elements", async () => {
	const html = `
    <div>
      <p>Paragraph</p>
      <span>Span</span>
    </div>
  `;
	const { container } = render(chtr(html));
	await expect.element(container.querySelector("div")).toBeInTheDocument();
	await expect
		.element(container.querySelector("p"))
		.toHaveTextContent("Paragraph");
	await expect
		.element(container.querySelector("span"))
		.toHaveTextContent("Span");
});

test("handles self-closing tags", async () => {
	const html = '<div><img src="test.jpg" alt="Test" /><br /></div>';
	const { container } = render(chtr(html));
	const img = container.querySelector("img");
	await expect.element(img).toBeInTheDocument();
	await expect.element(img).toHaveAttribute("src", "test.jpg");
	await expect.element(img).toHaveAttribute("alt", "Test");
	await expect.element(container.querySelector("br")).toBeInTheDocument();
});

test("parses style attributes", async () => {
	const html =
		'<div style="color: red; font-size: 16px; background-color: blue;">Styled</div>';
	const { container } = render(chtr(html));
	const div = container.querySelector("div");
	await expect.element(div).toHaveStyle({
		color: "red",
		fontSize: "16px",
		backgroundColor: "blue",
	});
});

test("handles multiple attributes", async () => {
	const html =
		'<input type="text" id="username" name="username" placeholder="Enter name" />';
	const { container } = render(chtr(html));
	const input = container.querySelector("input");
	await expect.element(input).toHaveAttribute("type", "text");
	await expect.element(input).toHaveAttribute("id", "username");
	await expect.element(input).toHaveAttribute("name", "username");
	await expect.element(input).toHaveAttribute("placeholder", "Enter name");
});

test("handles data attributes", async () => {
	const html = '<div data-testid="test-element" data-value="123">Data</div>';
	const { container } = render(chtr(html));
	const div = container.querySelector("div");
	await expect.element(div).toHaveAttribute("data-testid", "test-element");
	await expect.element(div).toHaveAttribute("data-value", "123");
});

test("handles aria attributes", async () => {
	const html = '<button aria-label="Close" aria-pressed="false">X</button>';
	const { container } = render(chtr(html));
	const button = container.querySelector("button");
	await expect.element(button).toHaveAttribute("aria-label", "Close");
	await expect.element(button).toHaveAttribute("aria-pressed", "false");
});

test("handles multiple root elements", async () => {
	const html = "<div>First</div><div>Second</div><div>Third</div>";
	const { container } = render(chtr(html));
	const divs = container.querySelectorAll("div");
	expect(divs.length).toBeGreaterThanOrEqual(3);
});

test("handles empty HTML", async () => {
	const { container } = render(chtr(""));
	expect(container.textContent).toBe("");
});

test("handles text nodes", async () => {
	const html = "<p>Hello <strong>World</strong>!</p>";
	const { container } = render(chtr(html));
	const p = container.querySelector("p");
	await expect.element(p).toHaveTextContent("Hello World!");
	await expect
		.element(container.querySelector("strong"))
		.toHaveTextContent("World");
});

test("converts for to htmlFor", async () => {
	const html = '<label for="input-id">Label</label>';
	const { container } = render(chtr(html));
	const label = container.querySelector("label");
	await expect.element(label).toBeInTheDocument();
});

test("handles complex nested structure", async () => {
	const html = `
    <div class="container">
      <header>
        <h1>Title</h1>
        <nav>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
          </ul>
        </nav>
      </header>
      <main>
        <article>
          <h2>Article Title</h2>
          <p>Article content</p>
        </article>
      </main>
    </div>
  `;
	const { container } = render(chtr(html));
	await expect
		.element(container.querySelector(".container"))
		.toBeInTheDocument();
	await expect
		.element(container.querySelector("h1"))
		.toHaveTextContent("Title");
	await expect.element(container.querySelector("nav")).toBeInTheDocument();
	await expect.element(container.querySelector("article")).toBeInTheDocument();
});

test("handles boolean attributes", async () => {
	const html = '<input type="checkbox" checked disabled />';
	const { container } = render(chtr(html));
	const input = container.querySelector("input");
	await expect.element(input).toHaveAttribute("checked");
	await expect.element(input).toHaveAttribute("disabled");
});

test("handles form elements", async () => {
	const html = `
    <form>
      <input type="text" name="username" />
      <textarea name="message"></textarea>
      <select name="country">
        <option value="us">USA</option>
        <option value="uk">UK</option>
      </select>
      <button type="submit">Submit</button>
    </form>
  `;
	const { container } = render(chtr(html));
	await expect.element(container.querySelector("form")).toBeInTheDocument();
	await expect
		.element(container.querySelector('input[name="username"]'))
		.toBeInTheDocument();
	await expect.element(container.querySelector("textarea")).toBeInTheDocument();
	await expect.element(container.querySelector("select")).toBeInTheDocument();
	await expect
		.element(container.querySelector('button[type="submit"]'))
		.toBeInTheDocument();
});
