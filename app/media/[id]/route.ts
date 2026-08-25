import { eq } from "drizzle-orm";
import { getPrivateObject } from "@/lib/storage";
import { db } from "@/packages/database/client";
import { mediaAssets } from "@/packages/database/schema";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [asset] = await db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .limit(1);
  if (!asset || asset.visibility !== "public")
    return new Response("Não encontrado", { status: 404 });
  try {
    const object = await getPrivateObject(asset.objectKey);
    return new Response(Buffer.from(object.bytes), {
      headers: {
        "content-type": object.contentType ?? asset.contentType,
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new Response("Não encontrado", { status: 404 });
  }
}
