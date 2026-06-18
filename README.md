# chtr

Convert HTML strings into React elements. `chtr` ("convert html to react") is a lightweight library that parses an HTML string and returns real React elements you can drop straight into your JSX.

[![npm version](https://img.shields.io/npm/v/chtr.svg)](https://www.npmjs.com/package/chtr)
[![license](https://img.shields.io/npm/l/chtr.svg)](https://github.com/riya-amemiya/chtr/blob/main/LICENSE)
[![CI](https://github.com/riya-amemiya/chtr/actions/workflows/ci.yml/badge.svg)](https://github.com/riya-amemiya/chtr/actions/workflows/ci.yml)

## Features

`chtr` translates HTML markup into the shape React expects, so the result behaves like ordinary JSX rather than raw markup injected through `dangerouslySetInnerHTML`.

It rewrites HTML attribute names into their React prop equivalents. For example `class` becomes `className`, `for` becomes `htmlFor`, `tabindex` becomes `tabIndex`, `colspan` becomes `colSpan`, and `maxlength` becomes `maxLength`. The full mapping lives in `HTML_TO_REACT_ATTRS`.

Boolean attributes such as `checked`, `disabled`, and `selected` are converted into real booleans. A boolean attribute is treated as `true` whenever it is present, unless it is explicitly written as `"false"`. The recognised set is defined in `HTML_BOOLEAN_ATTRIBUTES`.

Inline `style` strings are parsed into a camelCased `CSSProperties` object, so `style="background-color: red"` becomes `{ backgroundColor: "red" }`. CSS custom properties keep their literal form, so a `--my-var` declaration is preserved as-is rather than being camelCased.

HTML character references are decoded in both text content and attribute values. Named references (such as `&amp;`, `&nbsp;`, `&mdash;`), decimal references (`&#169;`), and hexadecimal references (`&#xA9;`) are all supported, and unknown references are left untouched.

Void elements (`br`, `img`, `input`, `hr`, and the rest of the HTML void element set) and self-closing tags written with a trailing slash are handled correctly. HTML comments and `<!DOCTYPE>` declarations are ignored. When the input contains more than one root element, every root is wrapped together in a React `Fragment`. Custom attributes such as `data-*` and `aria-*` pass through unchanged.

## Installation

```bash
npm install chtr
```

```bash
bun add chtr
```

React 19 is used as the rendering target.

## Usage

Call `chtr` with an HTML string inside a React component and embed the result directly in your JSX.

```tsx
import { chtr } from "chtr";

function Box() {
  return <div>{chtr('<div class="box">Hello</div>')}</div>;
}
```

The `class` attribute is converted to `className`, so the rendered element receives a proper React prop. Because the output is genuine React elements, `chtr` can serve as an alternative to `dangerouslySetInnerHTML` when you need to turn an HTML string into rendered content without bypassing React's reconciliation.

When the HTML has several top-level elements, they are returned together inside a Fragment, so you can still render the value as a single child:

```tsx
import { chtr } from "chtr";

function List() {
  return <ul>{chtr("<li>One</li><li>Two</li>")}</ul>;
}
```

## API Reference

### `chtr(html: string): ReactElement | ReactElement[]`

The primary entry point, available both as the default export and as a named export. It parses `html` and returns a single React element when the input has exactly one root node, or a Fragment wrapping every root node otherwise. Empty input yields an empty Fragment.

The following helpers are also exported for lower-level use.

`parseHTML(html: string): ParsedNode[]` parses an HTML string into a tree of `ParsedNode` objects, skipping comments and doctype declarations.

`convertAttributesToProps(attributes: Record<string, string>): Record<string, unknown>` converts a map of HTML attributes into React props, normalising attribute names, parsing inline styles, and turning boolean attributes into booleans.

`parseAttributes(attrString: string): Record<string, string>` parses the raw attribute string of an opening tag into a name/value map, decoding HTML entities in the values.

`parseStyle(styleString: string): CSSProperties` parses an inline `style` string into a React `CSSProperties` object.

`decodeEntities(input: string): string` decodes named, decimal, and hexadecimal HTML character references into the characters they represent.

`nodeToReactElement(node: ParsedNode, index: number): ReactElement | string | null` recursively converts a single `ParsedNode` into a React element, a text string, or `null`.

The `ParsedNode` type is exported as well, describing the intermediate parse tree with `type`, `tagName`, `attributes`, `children`, and `text` fields.

## Supported conversions

Attribute name rewriting through `HTML_TO_REACT_ATTRS`, including `class`, `for`, `tabindex`, `colspan`, `maxlength`, and many more. Boolean attribute conversion through `HTML_BOOLEAN_ATTRIBUTES`. Inline `style` parsing into camelCased `CSSProperties`, with CSS custom properties preserved. HTML entity decoding for named, decimal, and hexadecimal references. Void and self-closing tag handling. Comment and doctype removal. Multiple root elements wrapped in a Fragment. Pass-through of `data-*` and `aria-*` attributes.

## Limitations

`chtr` uses a lightweight regular-expression-based parser rather than a full HTML specification parser, which keeps it small but means certain edge cases are not handled.

Raw text content inside `<script>` or `<style>` elements that contains a `<` character cannot be parsed correctly, because the parser treats `<` as the start of a tag.

Style values that contain a semicolon inside them, such as a `data:` URI, can break when the inline style string is split on `;`.

Malformed or unclosed tags are handled leniently rather than rejected, so the resulting tree may not match what a strict HTML parser would produce.

## Development

Install dependencies with `bun install`, then build the TypeScript sources with `bun run build`, which runs `tsc`. Use `bun run check` to run Biome's checks and `bun run ci` to run Biome in CI mode.

## Testing

Run the Bun unit tests in `tests/unit` with `bun test`. Run the Vitest browser tests with `bun run test:browser`.

## License

MIT. See the [LICENSE](https://github.com/riya-amemiya/chtr/blob/main/LICENSE) file for details. Authored by [riya-amemiya](https://github.com/riya-amemiya).
