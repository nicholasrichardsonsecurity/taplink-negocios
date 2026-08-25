import {z} from "zod";

export const loginSchema=z.object({email:z.email().trim().toLowerCase(),password:z.string().min(10).max(128)});
export const bootstrapSchema=loginSchema.extend({name:z.string().trim().min(3).max(100),organizationName:z.string().trim().min(3).max(120),organizationSlug:z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),bootstrapToken:z.string().min(16)});
