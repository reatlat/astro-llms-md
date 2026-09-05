import assert from "node:assert/strict";
import { test } from "node:test";
import { processHtml } from "../dist/index.js";

function wrap(html) {
  return `<html><body><main>${html}</main></body></html>`;
}

test("heading inside a link flattens to an inline link", async () => {
  const { content } = await processHtml(
    wrap('<a href="/tools/one"><h2>Tool One</h2></a>'),
  );
  assert.equal(content.trim(), "[Tool One](/tools/one)");
});

test("link with blocks with heading and description flattens to one line", async () => {
  const { content } = await processHtml(
    wrap('<a href="/x"><h3>Card Title</h3><p>Some description</p></a>'),
  );
  assert.equal(content.trim(), "[Card Title Some description](/x)");
});

test("nested blocks inside a link flatten", async () => {
  const { content } = await processHtml(
    wrap('<a href="/x"><div><h3>Hi</h3><p>d</p></div></a>'),
  );
  assert.equal(content.trim(), "[Hi d](/x)");
});

test("text around blocks inside a link is preserved with spaces", async () => {
  const { content } = await processHtml(
    wrap('<a href="/x">intro <h2>Head</h2> tail</a>'),
  );
  assert.equal(content.trim(), "[intro Head tail](/x)");
});

test("list inside a link flattens", async () => {
  const { content } = await processHtml(
    wrap('<a href="/x"><ul><li>one</li><li>two</li></ul></a>'),
  );
  assert.equal(content.trim(), "[one two](/x)");
});

test("link with blocks keeps sibling content as separate blocks", async () => {
  const { content } = await processHtml(
    wrap('<p>Before</p><a href="/x"><h2>Card</h2></a><p>After</p>'),
  );
  assert.equal(content.trim(), "Before\n\n[Card](/x)\n\nAfter");
});

test("link with blocks inside a list item", async () => {
  const { content } = await processHtml(
    wrap('<ul><li><a href="/x"><h4>Item</h4></a></li></ul>'),
  );
  assert.equal(content.trim(), "-   [Item](/x)");
});

test("markdown syntax in card text is stripped, not emitted", async () => {
  const { content } = await processHtml(
    wrap('<a href="/x"><h2>Card <em>styled</em> [bracket]</h2></a>'),
  );
  assert.equal(content.trim(), "[Card styled \\[bracket\\]](/x)");
});

test("link with blocks with title attribute keeps title", async () => {
  const { content } = await processHtml(
    wrap('<a href="/x" title="My Title"><h2>T</h2></a>'),
  );
  assert.equal(content.trim(), '[T](/x "My Title")');
});

test("plain inline links are untouched", async () => {
  const { content } = await processHtml(
    wrap('<p>See <a href="/about">the <strong>about</strong> page</a> now.</p>'),
  );
  assert.equal(content.trim(), "See [the **about** page](/about) now.");
});

test("image link is untouched", async () => {
  const { content } = await processHtml(
    wrap('<a href="/x"><img src="/i.png" alt="pic"></a>'),
  );
  assert.equal(content.trim(), "[![pic](/i.png)](/x)");
});

test("link without href stays plain", async () => {
  const { content } = await processHtml(wrap("<a>no href</a>"));
  assert.equal(content.trim(), "no href");
});
