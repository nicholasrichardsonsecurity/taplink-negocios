import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";

const bucket = process.env.STORAGE_BUCKET ?? "taplink-private";
let client: S3Client | undefined;
let bucketReady = false;

function filesystemPath(key: string) {
  const root = resolve(
    /* turbopackIgnore: true */
    process.env.STORAGE_PATH ?? "/app/data/uploads",
  );
  const target = resolve(root, key);
  const nested = relative(root, target);
  if (!key || isAbsolute(key) || nested.startsWith("..") || isAbsolute(nested))
    throw new Error("Chave de armazenamento inválida.");
  return target;
}

function usesFilesystem() {
  return (process.env.STORAGE_DRIVER ?? "filesystem") === "filesystem";
}

function storageClient() {
  if (client) return client;
  const endpoint = process.env.STORAGE_ENDPOINT;
  const accessKeyId = process.env.STORAGE_ACCESS_KEY;
  const secretAccessKey = process.env.STORAGE_SECRET_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey)
    throw new Error("Armazenamento não configurado.");
  client = new S3Client({
    endpoint,
    region: process.env.STORAGE_REGION ?? "us-east-1",
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });
  return client;
}

async function ensureBucket() {
  if (bucketReady) return;
  const s3 = storageClient();
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch {
    try {
      await s3.send(new CreateBucketCommand({ Bucket: bucket }));
    } catch (error) {
      if ((error as { name?: string }).name !== "BucketAlreadyOwnedByYou")
        throw error;
    }
  }
  bucketReady = true;
}

export async function putPrivateObject(
  key: string,
  body: Uint8Array,
  contentType: string,
) {
  if (usesFilesystem()) {
    const target = filesystemPath(key);
    await mkdir(dirname(target), { recursive: true, mode: 0o700 });
    await writeFile(target, body, { mode: 0o600 });
    return;
  }
  await ensureBucket();
  await storageClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

export async function getPrivateObject(key: string) {
  if (usesFilesystem()) {
    return {
      bytes: new Uint8Array(
        await readFile(/* turbopackIgnore: true */ filesystemPath(key)),
      ),
    };
  }
  const result = await storageClient().send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );
  if (!result.Body) throw new Error("Arquivo sem conteúdo.");
  return {
    bytes: await result.Body.transformToByteArray(),
    contentType: result.ContentType,
  };
}
