import Image from "next/image";
import Link from "next/link";

const features = [
  ["NFC + QR Code", "Um toque ou leitura abre a página certa, sem aplicativo e sem atrito."],
  ["Página white-label", "Logo, cores, fotos, seções e atalhos com a identidade de cada negócio."],
  ["Wi-Fi inteligente", "O cliente encontra a rede e conecta sem precisar chamar o atendimento."],
  ["Avaliações Google", "Transforme uma boa experiência em mais reputação e descoberta local."],
  ["Links que convertem", "Cardápio, WhatsApp, localização, redes e promoções em um só endereço."],
  ["Relatórios claros", "Acompanhe acessos, origens, cliques e ações que realmente geram resultado."],
];

const audiences = [
  ["Restaurantes", "Cardápio, pedido, Wi-Fi e avaliação na mesa."],
  ["Barbearias", "Agendamento, serviços, localização e portfólio."],
  ["Provedores", "Suporte, fatura, teste de velocidade e indicações."],
  ["Qualquer negócio", "Uma estrutura flexível que acompanha sua operação."],
];

function Icon({name}:{name:string}) {
  const paths:Record<string,string> = {
    tap:"M12 2v7m0 0 3-3m-3 3-3-3M5.5 9.5A7 7 0 1 0 18.5 9.5M8 17h8",
    chart:"M4 19V9m6 10V5m6 14v-7m4 7H2",
    wifi:"M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 20h.01",
    star:"m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9L7 20.8l1-6.1-4.4-4.3 6.1-.9L12 3Z",
    link:"M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1",
    palette:"M12 3a9 9 0 1 0 0 18h1.5a1.5 1.5 0 0 0 0-3H12a2 2 0 0 1 0-4h3a6 6 0 0 0 0-12h-3Zm-4 6h.01M12 7h.01M7 13h.01",
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d={paths[name]} /></svg>;
}

export default function Home(){
  return <main className="site-home">
    <header className="site-header">
      <Link className="site-brand" href="/" aria-label="TapLink Negócios — início"><Image src="/brand/taplink-negocios-logo.png" alt="" width={42} height={42}/><span>TapLink <b>Negócios</b></span></Link>
      <nav aria-label="Navegação principal"><a href="#solucao">Solução</a><a href="#segmentos">Segmentos</a><a href="#como-funciona">Como funciona</a><a href="#planos">Planos</a></nav>
      <div className="header-actions"><Link className="text-link" href="/login">Entrar</Link><a className="button button-small" href="#contato">Quero conhecer</a></div>
    </header>

    <section className="hero">
      <div className="hero-copy"><div className="eyebrow"><span/> Tecnologia simples. Resultado visível.</div><h1>Seu negócio inteiro na palma da mão.</h1><p>Transforme uma placa com NFC e QR Code em uma experiência digital completa: links, cardápio, Wi-Fi, avaliações e dados para vender melhor.</p><div className="hero-actions"><a className="button" href="#contato">Começar agora <b>→</b></a><a className="button button-ghost" href="#como-funciona">Ver como funciona</a></div><div className="hero-proof"><div className="avatars"><span>R</span><span>B</span><span>G</span></div><p><b>Feito para negócios reais</b><small>Restaurantes, serviços, telecom e muito mais.</small></p></div></div>
      <div className="hero-visual" aria-label="Demonstração da página móvel e painel TapLink"><div className="glow"/><div className="dashboard-preview"><div className="preview-top"><span/><span/><span/><b>Visão geral</b></div><div className="preview-body"><small>RESULTADOS DOS ÚLTIMOS 30 DIAS</small><strong>2.847</strong><p>interações com sua página</p><div className="mini-chart"><i/><i/><i/><i/><i/><i/><i/></div><div className="preview-stats"><span><b>+24%</b> Acessos</span><span><b>4,9</b> Avaliação</span></div></div></div><div className="phone-preview"><div className="phone-speaker"/><div className="phone-cover"/><div className="phone-logo">LR</div><b>Lisarojo Pizzaria</b><small>Pizza artesanal feita com paixão</small><div className="phone-actions"><span>Cardápio</span><span>WhatsApp</span><span>Wi-Fi</span></div><div className="phone-card"><small>DESTAQUE DA CASA</small><b>Pizza Lisarojo</b><span>Conhecer cardápio →</span></div><div className="phone-nav"><b>⌂</b><b>☰</b><b>★</b><b>⌁</b></div></div><div className="floating-card"><span>★</span><div><b>Nova avaliação</b><small>5 estrelas no Google</small></div></div></div>
    </section>

    <section className="trust-strip"><span>Um único sistema para</span><b>EXPERIÊNCIA</b><i/> <b>CONVERSÃO</b><i/> <b>REPUTAÇÃO</b><i/> <b>DADOS</b></section>
    <section className="section solution" id="solucao"><div className="section-heading"><div><span className="section-kicker">TUDO CONECTADO</span><h2>Menos atrito.<br/>Mais resultado.</h2></div><p>O TapLink reúne o que seu cliente procura e o que sua empresa precisa acompanhar — sem aplicativos, filas ou informações espalhadas.</p></div><div className="feature-grid">{features.map(([title,text],index)=><article key={title}><div className="feature-icon"><Icon name={["tap","palette","wifi","star","link","chart"][index]}/></div><h3>{title}</h3><p>{text}</p><span>0{index+1}</span></article>)}</div></section>
    <section className="dark-section" id="como-funciona"><div className="dark-copy"><span className="section-kicker">SIMPLES DE USAR</span><h2>Da placa ao resultado em três passos.</h2><p>A placa é física. A experiência é viva. Você atualiza tudo pelo painel sem imprimir novamente ou regravar a tag.</p><a className="button button-light" href="#contato">Ver uma demonstração →</a></div><div className="steps"><article><b>01</b><div><h3>Personalize</h3><p>Cadastre sua marca, cores, links, Wi-Fi e seções.</p></div></article><article><b>02</b><div><h3>Ative</h3><p>Grave o link na tag NFC e use o QR Code da placa.</p></div></article><article><b>03</b><div><h3>Acompanhe</h3><p>Veja acessos, ações e oportunidades no painel.</p></div></article></div></section>
    <section className="section audiences" id="segmentos"><div className="section-heading"><div><span className="section-kicker">WHITE-LABEL DE VERDADE</span><h2>Um padrão.<br/>A sua identidade.</h2></div><p>A estrutura permanece sólida e cada empresa escolhe sua própria experiência, seus atalhos e sua comunicação.</p></div><div className="audience-grid">{audiences.map(([title,text],i)=><article key={title} className={`audience-${i+1}`}><small>0{i+1}</small><div><h3>{title}</h3><p>{text}</p></div><b>↗</b></article>)}</div></section>
    <section className="numbers"><div><strong>1</strong><span>placa</span><p>NFC e QR na mesma experiência</p></div><div><strong>24h</strong><span>por dia</span><p>Seu negócio sempre acessível</p></div><div><strong>100%</strong><span>personalizável</span><p>Identidade de cada empresa</p></div><div><strong>0</strong><span>apps</span><p>O cliente acessa direto</p></div></section>
    <section className="section pricing" id="planos"><div className="pricing-copy"><span className="section-kicker">PLANOS PARA CRESCER</span><h2>Comece simples.<br/>Evolua no seu ritmo.</h2><p>A placa é adquirida separadamente. A mensalidade remunera o sistema, os relatórios, usuários e recursos de gestão.</p></div><div className="price-card"><small>MAIS ESCOLHIDO</small><h3>Negócios</h3><p>Para empresas que querem transformar acessos em decisões.</p><div><span>R$</span><strong>69,90</strong><small>/mês</small></div><ul><li>Até 3 unidades</li><li>5 usuários no painel</li><li>Analytics de 90 dias</li><li>Exportação de relatórios</li><li>Personalização completa</li></ul><a className="button" href="#contato">Quero este plano →</a><Link href="/login">Já sou cliente</Link></div></section>
    <section className="final-cta" id="contato"><div><span className="section-kicker">PRONTO PARA O PRÓXIMO TOQUE?</span><h2>Seu atendimento pode começar antes mesmo do “olá”.</h2></div><div><p>Conheça o TapLink Negócios e transforme cada aproximação em uma oportunidade.</p><Link className="button button-light" href="/login">Acessar painel →</Link></div></section>
    <footer className="site-footer"><Link className="site-brand" href="/"><Image src="/brand/taplink-negocios-logo-white.png" alt="" width={38} height={38}/><span>TapLink <b>Negócios</b></span></Link><p>Tudo do seu negócio em um toque.</p><div><a href="#solucao">Produto</a><a href="#planos">Planos</a><Link href="/login">Painel</Link></div><small>© 2026 Nicholas Richardson · GigaNetPe Telecom · Software proprietário</small></footer>
  </main>;
}
