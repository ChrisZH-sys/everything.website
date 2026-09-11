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
  for (const label of ["范围：衡复及周边", "时间：半天", "同行：一个人"]) {
    assert.match(
      html,
      new RegExp(`<button(?=[^>]*aria-label="${label}")(?=[^>]*aria-expanded="false")[^>]*>`),
      `${label}应渲染为可展开的按钮`,
    );
  }
  assert.match(html, /<button(?=[^>]*aria-pressed="true")[^>]*>半天<\/button>/);
  assert.match(html, /<button(?=[^>]*aria-pressed="true")[^>]*>一个人<\/button>/);
  assert.match(html, /查看推荐理由/);
  assert.equal((html.match(/<article\b/g) ?? []).length, 30, "默认显示全部30个地点");
  assert.equal((html.match(/class="place-details-button"/g) ?? []).length, 30, "每个地点可打开详情与来源");
  assert.match(html, /地点索引/);
  assert.doesNotMatch(html, /社区小馆样本|咖啡休息点样本|约2.4公里|HIGH-CONFIDENCE AREA/);
});
