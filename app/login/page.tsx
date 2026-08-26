"use client";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function Login(){
  const[error,setError]=useState("");
  const[loading,setLoading]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data=Object.fromEntries(new FormData(e.currentTarget));
      const response=await fetch("/api/auth/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(data)});
      if(response.ok){location.href="/dashboard";return}
      const body=await response.json().catch(()=>({error:"Não foi possível entrar."}));
      setError(body.error);
    } catch {
      setError("Não foi possível conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }
  return <main className="auth-page auth-modern">
    <section className="auth-card">
      <Link className="site-brand" href="/"><Image src="/brand/taplink-negocios-logo.png" alt="" width={42} height={42}/><span>TapLink <b>Negócios</b></span></Link>
      <div className="auth-content"><small>ÁREA DO ESTABELECIMENTO</small><h1>Que bom ter você de volta.</h1><p>Acesse seu painel para atualizar sua página, acompanhar resultados e cuidar do seu negócio.</p>
      <form onSubmit={submit}><label>E-mail<input name="email" type="email" autoComplete="email" placeholder="voce@empresa.com.br" required/></label><label><span>Senha <Link href="/forgot-password">Esqueci minha senha</Link></span><input name="password" type="password" autoComplete="current-password" placeholder="Digite sua senha" minLength={10} required/></label>{error?<div className="form-error" role="alert">{error}</div>:null}<button disabled={loading}>{loading?"Entrando…":"Entrar no painel →"}</button></form>
      <div className="auth-security"><span>✓</span> Ambiente seguro e acesso protegido</div></div>
      <footer>© 2026 TapLink Negócios · <Link href="/">Voltar ao site</Link></footer>
    </section>
    <aside><div className="auth-orb orb-one"/><div className="auth-orb orb-two"/><div className="auth-showcase"><span className="section-kicker">GESTÃO EM UM SÓ LUGAR</span><h2>Sua marca.<br/>Sua página.<br/><em>Seus resultados.</em></h2><p>Uma plataforma criada para transformar cada toque em uma experiência memorável.</p><div className="auth-quote"><div className="quote-stars">★★★★★</div><blockquote>“Mais autonomia para a empresa e uma jornada muito mais simples para o cliente.”</blockquote><small>EXPERIÊNCIA TAPLINK</small></div></div></aside>
  </main>;
}
