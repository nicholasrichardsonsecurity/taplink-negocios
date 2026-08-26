import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { getPrivateObject, putPrivateObject } from "../lib/storage";

test("armazena e recupera arquivo no volume privado", async () => {
  const root = await mkdtemp(join(tmpdir(), "taplink-storage-"));
  process.env.STORAGE_DRIVER = "filesystem";
  process.env.STORAGE_PATH = root;
  try {
    const expected = new TextEncoder().encode("logo de teste");
    await putPrivateObject("organizations/demo/branding/logo.webp", expected, "image/webp");
    const stored = await getPrivateObject("organizations/demo/branding/logo.webp");
    assert.deepEqual(stored.bytes, expected);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejeita tentativa de escapar do volume privado", async () => {
  const root = await mkdtemp(join(tmpdir(), "taplink-storage-"));
  process.env.STORAGE_DRIVER = "filesystem";
  process.env.STORAGE_PATH = root;
  try {
    await assert.rejects(() =>
      putPrivateObject("../escape.txt", new Uint8Array([1]), "text/plain"),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
