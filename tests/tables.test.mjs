import assert from "node:assert/strict";
import { test } from "node:test";
import { processHtml } from "../dist/index.js";

function wrap(tableHtml) {
  return `<html><body><main>${tableHtml}</main></body></html>`;
}

test("table with a header row converts to a GFM pipe table", async () => {
  const html = wrap(
    "<table><thead><tr><th>Fruit</th><th>Color</th><th>Price</th></tr></thead>" +
      "<tbody><tr><td>Apple</td><td>Red</td><td>$1.20</td></tr>" +
      "<tr><td>Banana</td><td>Yellow</td><td>$0.50</td></tr></tbody></table>",
  );
  const { content } = await processHtml(html);
  assert.equal(
    content.trim(),
    [
      "| Fruit | Color | Price |",
      "| --- | --- | --- |",
      "| Apple | Red | $1.20 |",
      "| Banana | Yellow | $0.50 |",
    ].join("\n"),
  );
});

test("table with row headers (no header row) converts to a label: value list", async () => {
  const html = wrap(
    '<table><tr><th scope="row">Bedrooms</th><td>3</td></tr>' +
      '<tr><th scope="row">Bathrooms</th><td>2</td></tr></table>',
  );
  const { content } = await processHtml(html);
  assert.equal(content.trim(), ["- Bedrooms: 3", "- Bathrooms: 2"].join("\n"));
});

test("pages without a table are unaffected", async () => {
  const html = wrap("<p>Just a paragraph, no table.</p>");
  const { content } = await processHtml(html);
  assert.equal(content.trim(), "Just a paragraph, no table.");
});

test("a pipe character in cell content is escaped", async () => {
  const html = wrap(
    "<table><thead><tr><th>Note</th></tr></thead>" +
      "<tbody><tr><td>A | B</td></tr></tbody></table>",
  );
  const { content } = await processHtml(html);
  assert.equal(content.trim(), ["| Note |", "| --- |", "| A \\| B |"].join("\n"));
});
