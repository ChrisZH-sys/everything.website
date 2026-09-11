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
  assert.match(html, /这次，想在上海怎么过/);
  for (const label of ["有多久", "和谁去", "想怎么过"]) {
    assert.ok(html.includes('aria-label="' + label + '"'));
  }
  assert.equal((html.match(/<article\b/g) ?? []).length, 3, "初次打开先展示三个候选");
  assert.equal((html.match(/查看详情与地址/g) ?? []).length, 3);
  assert.match(html, /全部地点/);
  assert.match(html, /为什么列入这次候选/);
  assert.doesNotMatch(html, /画像可信度|示例匹配分|匹配百分比|HIGH-CONFIDENCE AREA|松弛探索型/);
});
