import {deleteSession} from "@/lib/auth/session";

export async function POST(request:Request){await deleteSession();return Response.redirect(new URL("/login",request.url),303)}
