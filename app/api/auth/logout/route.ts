import { deleteSession, getSessionContext } from "@/lib/auth/session";
import { validCsrf } from "@/lib/security";

export async function POST(request: Request) {
  const session = await getSessionContext();
  const form = await request.formData().catch(() => new FormData());
  if (!session || !validCsrf(request, session.sessionTokenHash, form.get("csrf"))) return Response.json({ error: "Validação de segurança expirada." }, { status: 403 });
  await deleteSession();
  return Response.redirect(new URL("/login", request.url), 303);
}
