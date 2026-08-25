import {eq} from "drizzle-orm";
import {db} from "@/packages/database/client";
import {publicPages} from "@/packages/database/schema";
import {lisarojoDefaults,type PageSettings} from "@/lib/page-settings";
import PublicExperience from "./PublicExperience";

export const dynamic="force-dynamic";
export default async function PublicPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const [page]=await db.select().from(publicPages).where(eq(publicPages.slug,slug)).limit(1);if(!page||!page.published)return <main className="unpublished"><div><span>T</span><h1>Página em preparação.</h1><p>O estabelecimento ainda não publicou esta experiência.</p></div></main>;const settings={...lisarojoDefaults,...JSON.parse(page.publishedSettingsJson),wifiPassword:""} as PageSettings;return <PublicExperience settings={settings} slug={slug}/>}
