import type {Metadata} from "next";
import "./globals.css";

export const metadata:Metadata={title:"TapLink Negócios",description:"Tudo do seu negócio em um toque."};

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="pt-BR"><body>{children}</body></html>;
}
