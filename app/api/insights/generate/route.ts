import { getSessionContext } from "@/lib/auth/session";
import { createInsightRun } from "@/lib/insight-service";

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session) return Response.json({ error: "Autenticação necessária." }, { status: 401 });
  if (!['owner', 'manager'].includes(session.role)) return Response.json({ error: "Somente proprietário ou gerente pode gerar análises." }, { status: 403 });
  await createInsightRun(session.organizationId, session.userId);
  return Response.redirect(new URL("/dashboard/insights", request.url), 303);
}
