import {z} from "zod";

const optionalUrl=z.union([z.literal(""),z.url().max(500).refine(value=>{const protocol=new URL(value).protocol;return protocol==="https:"||protocol==="http:"},"Use apenas endereço HTTP ou HTTPS.")]);
export const shortcutOptions=["Cardápio","Avaliar","Wi-Fi","WhatsApp","Instagram","Localização"] as const;
export const pageSettingsSchema=z.object({
 businessName:z.string().trim().min(2).max(100),
 category:z.string().trim().min(2).max(120),
 tagline:z.string().trim().min(3).max(120),
 description:z.string().trim().min(3).max(300),
 logoUrl:optionalUrl,
 primaryColor:z.string().regex(/^#[0-9a-fA-F]{6}$/),
 secondaryColor:z.string().regex(/^#[0-9a-fA-F]{6}$/),
 heroImageUrl:optionalUrl,
 theme:z.enum(["light","dark"]),
 whatsapp:z.string().regex(/^\d{10,13}$/).or(z.literal("")),
 instagram:z.string().trim().regex(/^[a-zA-Z0-9._]{1,30}$/).or(z.literal("")),
 googleReviewUrl:optionalUrl,
 menuUrl:optionalUrl,
 locationUrl:optionalUrl,
 wifiSsid:z.string().trim().max(64),
 wifiPassword:z.string().max(128),
 shortcuts:z.array(z.enum(shortcutOptions)).length(3).refine(items=>new Set(items).size===items.length,"Atalhos não podem repetir."),
 showPromo:z.boolean(),
 showAbout:z.boolean(),
 showLocation:z.boolean()
});
export type PageSettings=z.infer<typeof pageSettingsSchema>;

export const lisarojoDefaults:PageSettings={
 businessName:"Pizzaria Lisarojo",category:"Restaurante e pizzaria · desde 1994",tagline:"Sabor que atravessa gerações.",description:"Conheça nossos sabores, faça seu pedido e aproveite sua experiência.",logoUrl:"",primaryColor:"#a9362d",secondaryColor:"#d56b35",heroImageUrl:"",theme:"light",whatsapp:"81986708073",instagram:"pizzarialisarojo",googleReviewUrl:"",menuUrl:"",locationUrl:"",wifiSsid:"LISAROJO_CLIENTES",wifiPassword:"",shortcuts:["Cardápio","Avaliar","Wi-Fi"],showPromo:true,showAbout:true,showLocation:true
};
