import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const bucket = process.env.STORAGE_BUCKET ?? "taplink-private";
let client: S3Client | undefined;
let bucketReady = false;

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
  const result = await storageClient().send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );
  if (!result.Body) throw new Error("Arquivo sem conteúdo.");
  return {
    bytes: await result.Body.transformToByteArray(),
    contentType: result.ContentType,
  };
}
