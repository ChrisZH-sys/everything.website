import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']shanghai-beta["'])[^>]*>/i;

test("renders development preview metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, developmentPreviewMeta);
  for (const label of ["范围：衡复样板区", "时间：半天", "同行：一个人"]) {
    assert.match(
      html,
      new RegExp(`<button(?=[^>]*aria-label="${label}")(?=[^>]*aria-expanded="false")[^>]*>`),
      `${label}应渲染为可展开的按钮`,
    );
  }
  assert.match(html, /<button(?=[^>]*aria-pressed="true")[^>]*>半天<\/button>/);
  assert.match(html, /<button(?=[^>]*aria-pressed="true")[^>]*>一个人<\/button>/);
  assert.match(html, /查看推荐理由/);
});
