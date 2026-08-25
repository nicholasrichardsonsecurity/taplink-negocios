"use client";
import { useEffect, useMemo, useState } from "react";
import type { PageSettings } from "@/lib/page-settings";

const valid = (url: string) => (/^https?:\/\//i.test(url) ? url : "#");
export default function PublicExperience({
  settings: s,
  slug,
}: {
  settings: PageSettings;
  slug: string;
}) {
  const [wifi, setWifi] = useState(false);
  const [wifiPassword, setWifiPassword] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const source = useMemo(() => {
    if (typeof window === "undefined") return "unknown";
    const value = new URLSearchParams(window.location.search).get("src");
    return ["nfc", "qr", "direct"].includes(value ?? "") ? value : "direct";
  }, []);
  function track(eventType: "page_view" | "action_click", action?: string) {
    const body = JSON.stringify({ eventType, action, source });
    const url = `/api/public/${slug}/events`;
    if (navigator.sendBeacon)
      navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    else
      fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
  }
  useEffect(() => {
    track("page_view");
  }, []);
  async function action(label: string) {
    track("action_click", label);
    if (label === "Wi-Fi") {
      setWifi(true);
      if (wifiPassword === null) {
        const response = await fetch(`/api/public/${slug}/wifi`);
        const data = await response.json();
        setWifiPassword(data.password ?? "");
      }
      return;
    }
    const urls: Record<string, string> = {
      Cardápio: s.menuUrl,
      Avaliar: s.googleReviewUrl,
      WhatsApp: s.whatsapp ? `https://wa.me/55${s.whatsapp}` : "",
      Instagram: s.instagram ? `https://instagram.com/${s.instagram}` : "",
      Localização: s.locationUrl,
    };
    location.href = valid(urls[label] ?? "");
  }
  return (
    <main
      className="business-page"
      style={
        {
          "--business": s.primaryColor,
          "--business2": s.secondaryColor,
        } as React.CSSProperties
      }
    >
      <header>
        <a href="#inicio">
          {s.logoUrl ? (
            <img src={s.logoUrl} alt={s.businessName} />
          ) : (
            <span>{s.businessName.charAt(0)}</span>
          )}
          <b>{s.businessName}</b>
        </a>
        <button onClick={() => setMenu(!menu)}>☰</button>
        {menu && (
          <nav>
            <a href="#cardapio">Cardápio</a>
            <a href="#avaliar">Avaliar</a>
            <a href="#sobre">Sobre</a>
            <a href="#local">Localização</a>
          </nav>
        )}
      </header>
      <section id="inicio" className="business-hero">
        <div>
          <small>{s.category}</small>
          <h1>{s.tagline}</h1>
          <p>{s.description}</p>
          <button onClick={() => action("Cardápio")}>Ver cardápio →</button>
        </div>
      </section>
      <section className="business-actions">
        {["Cardápio", "Wi-Fi", "Avaliar", "WhatsApp"].map((item) => (
          <button key={item} onClick={() => action(item)}>
            <i>
              {item === "Avaliar"
                ? "★"
                : item === "Wi-Fi"
                  ? "⌁"
                  : item === "Cardápio"
                    ? "⌑"
                    : "↗"}
            </i>
            <span>{item}</span>
          </button>
        ))}
      </section>
      {s.showPromo && (
        <section className="business-promo">
          <small>DESTAQUE DA CASA</small>
          <h2>Pizza feita para compartilhar.</h2>
          <p>
            Ingredientes escolhidos, massa caprichada e aquele sabor que reúne
            todo mundo.
          </p>
          <button onClick={() => action("Cardápio")}>Conhecer →</button>
        </section>
      )}
      <section id="cardapio" className="business-menu">
        <small>NOSSO CARDÁPIO</small>
        <h2>Escolha seu próximo favorito.</h2>
        <p>
          Acesse o cardápio completo para conhecer pizzas, bebidas e destaques.
        </p>
        <div>
          <article>
            🍕<b>Pizzas</b>
          </article>
          <article>
            🥤<b>Bebidas</b>
          </article>
          <article>
            ✨<b>Destaques</b>
          </article>
        </div>
        <button onClick={() => action("Cardápio")}>
          Abrir cardápio completo
        </button>
      </section>
      <section id="avaliar" className="business-review">
        <span>★★★★★</span>
        <h2>Sua opinião importa.</h2>
        <p>
          Conte como foi sua experiência e ajude outras pessoas a conhecerem o
          estabelecimento.
        </p>
        <button onClick={() => action("Avaliar")}>Avaliar no Google</button>
      </section>
      {s.showAbout && (
        <section id="sobre" className="business-about">
          <small>NOSSA HISTÓRIA</small>
          <h2>Tradição servida à mesa.</h2>
          <p>Carinho, bons momentos e sabores que atravessam gerações.</p>
        </section>
      )}
      {s.showLocation && (
        <section id="local" className="business-location">
          <small>VENHA NOS VISITAR</small>
          <h2>Estamos esperando você.</h2>
          <button onClick={() => action("Localização")}>
            Abrir localização
          </button>
        </section>
      )}
      <footer>
        <b>{s.businessName}</b>
        <div>
          <button onClick={() => action("Instagram")}>Instagram</button>
          <button onClick={() => action("WhatsApp")}>WhatsApp</button>
        </div>
        <small>Tecnologia TapLink Negócios</small>
      </footer>
      <nav className="business-bottom">
        <button onClick={() => (location.href = "#inicio")}>
          ⌂<small>Início</small>
        </button>
        {s.shortcuts.map((item) => (
          <button key={item} onClick={() => action(item)}>
            {item === "Avaliar" ? "★" : item === "Wi-Fi" ? "⌁" : "•"}
            <small>{item}</small>
          </button>
        ))}
      </nav>
      {wifi && (
        <div className="wifi-modal">
          <div>
            <button className="close" onClick={() => setWifi(false)}>
              ×
            </button>
            <i>⌁</i>
            <h2>Wi-Fi do estabelecimento</h2>
            <label>
              Rede<b>{s.wifiSsid || "Não informada"}</b>
            </label>
            <label>
              Senha
              <b>
                {wifiPassword === null
                  ? "Carregando…"
                  : wifiPassword || "Solicite no atendimento"}
              </b>
            </label>
            {wifiPassword && (
              <img
                src={`/api/public/${slug}/wifi-qr`}
                alt={`QR Code para conectar ao Wi-Fi ${s.wifiSsid}`}
                width={220}
                height={220}
                style={{
                  display: "block",
                  margin: "16px auto",
                  borderRadius: 16,
                }}
              />
            )}
            {wifiPassword && (
              <button
                onClick={() => navigator.clipboard.writeText(wifiPassword)}
              >
                Copiar senha
              </button>
            )}
            <small>
              Aponte a câmera para o QR. A confirmação final depende do
              aparelho.
            </small>
          </div>
        </div>
      )}
    </main>
  );
}
