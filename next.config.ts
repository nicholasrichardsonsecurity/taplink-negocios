import type {NextConfig} from "next";

const nextConfig:NextConfig={
 output:"standalone",
 poweredByHeader:false,
 reactStrictMode:true,
 experimental:{typedEnv:true},
 headers:async()=>[{
  source:"/:path*",
  headers:[
   {key:"X-Content-Type-Options",value:"nosniff"},
   {key:"X-Frame-Options",value:"DENY"},
   {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
   {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"}
   ,{key:"Content-Security-Policy",value:"default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; upgrade-insecure-requests"}
   ,{key:"Cross-Origin-Opener-Policy",value:"same-origin"}
   ,{key:"Cross-Origin-Resource-Policy",value:"same-origin"}
  ]
 }]
};
export default nextConfig;
