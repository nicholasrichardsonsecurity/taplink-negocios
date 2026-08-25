import {requireSession} from "@/lib/auth/session";
import Editor from "./Editor";

export default async function PageEditor(){const session=await requireSession();return <Editor companyName={session.organizationName} slug={session.organizationSlug}/>}
