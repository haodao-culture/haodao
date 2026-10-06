import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { parse, parseFragment } from 'parse5';
import { formatHtml } from './format-html.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const routes = JSON.parse(fs.readFileSync(path.join(root, 'website-src/routes.json'), 'utf8'));
const pages = [
  ...routes.map(route => path.posix.join(route.path, 'index.html').slice(1)),
  '404.html',
];

function structure(node, parentTag, preserveWhitespace = false) {
  if (node.nodeName === '#text') {
    // JSON-LD can be indented without changing its structured data.
    if (parentTag === 'script') return { text: node.value.trim() };
    return { text: preserveWhitespace ? node.value : node.value.replace(/[ \t\r\n\f]+/g, ' ') };
  }
  return {
    name: node.nodeName,
    namespace: node.namespaceURI,
    attrs: node.attrs,
    children: (node.childNodes || [])
      .filter(
        child =>
          !(
            node.namespaceURI === 'http://www.w3.org/2000/svg' &&
            child.nodeName === '#text' &&
            !child.value.trim()
          ),
      )
      .map(child =>
        structure(
          child,
          node.tagName,
          preserveWhitespace || ['pre', 'textarea'].includes(node.tagName),
        ),
      ),
    ...(node.content ? { template: structure(node.content) } : {}),
  };
}

const examples = [
  '<p>明理<a href="/">修煉</a>愿行</p>',
  '<p>明理 <a href="/">修煉</a> 愿行</p>',
  '<p><span>明理</span><span>修煉</span></p>',
  '<p><span>明理</span> <span>修煉</span></p>',
  '<pre>  keep  spaces\n next line</pre><textarea>  input\n next line</textarea>',
  '<template><p>課程<a href="/courses/">詳細資訊</a></p></template>',
  '<p title="a > b &amp; c">昊道 &amp; 文化<br>共學</p>',
];

for (const html of examples) {
  test(`preserves content and whitespace: ${html.slice(0, 60)}`, async () => {
    const formatted = await formatHtml(html);
    assert.deepEqual(structure(parseFragment(formatted.trim())), structure(parseFragment(html)));
    assert.equal(await formatHtml(formatted), formatted);
  });
}

for (const file of pages) {
  test(`generated page preserves structure and text: ${file}`, async () => {
    const original = fs.readFileSync(path.join(root, file), 'utf8');
    const formatted = await formatHtml(original);
    // The final newline lives outside the document body.
    assert.deepEqual(structure(parse(formatted.trim())), structure(parse(original.trim())));
    assert.equal(await formatHtml(formatted), formatted);
    assert.ok(formatted.split('\n').length > 20);
  });
}
