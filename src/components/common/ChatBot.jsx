// src/components/common/ChatBot.jsx
// Chatbot GUIADO (sin IA, sin costos). Objetivo: llevar al cliente a WhatsApp.
// - Botón flotante abajo-derecha (el de WhatsApp va abajo-izquierda).
// - Menú de respuestas rápidas; cada rama termina con un CTA a WhatsApp con
//   mensaje pre-llenado según el contexto.
// - Bilingüe: usa el idioma activo de i18n (es / en) con un diccionario local.
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NAVY = "#12305C";
const BLUE = "#4FB0E0";
const WA_NUM = "528717821161";
const waLink = (texto) => `https://wa.me/${WA_NUM}?text=${encodeURIComponent(texto)}`;

const DICT = {
  es: {
    abrir: "Abrir chat de ayuda",
    titulo: "Asistente VitalSupply",
    subtitulo: "En línea · respondemos en minutos",
    saludo: "¡Hola! 👋 Soy el asistente de VitalSupply. ¿Con qué te ayudo?",
    volver: "← Menú",
    waCta: "Continuar en WhatsApp",
    catalogo: "Explorar catálogo",
    cerrar: "Cerrar",
    opciones: [
      {
        id: "buscar",
        label: "🔍 Buscar un producto",
        respuesta:
          "Dime la marca y modelo de tu equipo (por ej. «GE Dash 4000» o «Mindray BeneView») y te digo el sensor o cable compatible. Lo más rápido es por WhatsApp 👇",
        wa: "Hola, busco un producto compatible para mi equipo. Mi equipo es: ",
        verCatalogo: true,
      },
      {
        id: "cotizar",
        label: "🧾 Cotizar o hacer pedido",
        respuesta:
          "Con gusto te preparo una cotización sin costo. Escríbenos por WhatsApp con lo que necesitas y te la mando en minutos 👇",
        wa: "Hola, quiero una cotización de estos productos: ",
      },
      {
        id: "envios",
        label: "🚚 Envíos y entregas",
        respuesta:
          "📦 Enviamos a todo México. Entrega estimada de 10 a 15 días hábiles. Algunos productos se fabrican bajo pedido y pueden tardar de 10 a 12 días. ¿Te ayudo con algo más?",
        wa: "Hola, tengo una duda sobre envíos y tiempos de entrega.",
      },
      {
        id: "garantia",
        label: "🛡️ Garantía y pagos",
        respuesta:
          "🛡️ Garantía de compatibilidad: si el producto no funciona con tu equipo, te lo cambiamos o devolvemos.\n💳 Pagos: transferencia, PayPal o tarjeta.",
        wa: "Hola, tengo una duda sobre garantía o formas de pago.",
      },
    ],
  },
  en: {
    abrir: "Open help chat",
    titulo: "VitalSupply Assistant",
    subtitulo: "Online · we reply in minutes",
    saludo: "Hi! 👋 I'm the VitalSupply assistant. How can I help?",
    volver: "← Menu",
    waCta: "Continue on WhatsApp",
    catalogo: "Browse catalog",
    cerrar: "Close",
    opciones: [
      {
        id: "buscar",
        label: "🔍 Find a product",
        respuesta:
          "Tell me the brand and model of your equipment (e.g. “GE Dash 4000” or “Mindray BeneView”) and I'll point you to the compatible sensor or cable. Fastest is via WhatsApp 👇",
        wa: "Hi, I'm looking for a compatible product for my equipment. My equipment is: ",
        verCatalogo: true,
      },
      {
        id: "cotizar",
        label: "🧾 Get a quote / order",
        respuesta:
          "Happy to prepare a free quote. Message us on WhatsApp with what you need and we'll send it in minutes 👇",
        wa: "Hi, I'd like a quote for these products: ",
      },
      {
        id: "envios",
        label: "🚚 Shipping & delivery",
        respuesta:
          "📦 We ship anywhere in Mexico. Estimated delivery 10–15 business days. Some products are made to order and may take 10–12 days. Anything else?",
        wa: "Hi, I have a question about shipping and delivery times.",
      },
      {
        id: "garantia",
        label: "🛡️ Warranty & payments",
        respuesta:
          "🛡️ Compatibility warranty: if the product doesn't work with your equipment, we replace or refund it.\n💳 Payments: bank transfer, PayPal or card.",
        wa: "Hi, I have a question about warranty or payment methods.",
      },
    ],
  },
};

function Burbuja({ from, children }) {
  const bot = from === "bot";
  return (
    <div style={{ display: "flex", justifyContent: bot ? "flex-start" : "flex-end", marginBottom: 8 }}>
      <div
        style={{
          maxWidth: "85%",
          padding: "9px 12px",
          borderRadius: 14,
          fontSize: 13.5,
          lineHeight: 1.45,
          whiteSpace: "pre-line",
          background: bot ? "#f1f5f9" : NAVY,
          color: bot ? "#1e293b" : "#fff",
          borderTopLeftRadius: bot ? 4 : 14,
          borderTopRightRadius: bot ? 14 : 4,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function ChatBot() {
  const { i18n } = useTranslation();
  const lang = String(i18n.language || "es").startsWith("en") ? "en" : "es";
  const L = DICT[lang];

  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([{ from: "bot", texto: L.saludo }]);
  const finRef = useRef(null);
  const scrollRef = useRef(null);

  // Reinicia el saludo si cambia el idioma mientras está cerrado
  useEffect(() => {
    setMensajes([{ from: "bot", texto: L.saludo }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    if (abierto && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes, abierto]);

  const elegir = (op) => {
    setMensajes((m) => [
      ...m,
      { from: "user", texto: op.label },
      { from: "bot", texto: op.respuesta, cta: { wa: op.wa, verCatalogo: !!op.verCatalogo } },
    ]);
  };

  const reiniciar = () => setMensajes([{ from: "bot", texto: L.saludo }]);

  return (
    <>
      {/* Botón flotante */}
      {!abierto && (
        <button
          onClick={() => setAbierto(true)}
          aria-label={L.abrir}
          className="fixed bottom-8 right-8 z-[100] flex items-center justify-center rounded-full shadow-2xl transition-all hover:scale-110"
          style={{ width: 60, height: 60, background: NAVY, color: "#fff" }}
        >
          <i className="fas fa-comment-dots" style={{ fontSize: 26 }}></i>
          <span
            style={{
              position: "absolute", top: -2, right: -2, width: 14, height: 14,
              background: BLUE, borderRadius: "50%", border: "2px solid #fff",
            }}
          />
        </button>
      )}

      {/* Panel de chat */}
      {abierto && (
        <div
          className="fixed z-[101] flex flex-col overflow-hidden shadow-2xl"
          style={{
            bottom: 24, right: 24,
            width: "min(92vw, 360px)",
            height: "min(72vh, 540px)",
            borderRadius: 18,
            background: "#fff",
            border: "1px solid #e2e8f0",
          }}
        >
          {/* Encabezado */}
          <div style={{ background: NAVY, color: "#fff", padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#ffffff22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className="fas fa-headset" style={{ fontSize: 16 }}></i>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>{L.titulo}</div>
              <div style={{ fontSize: 11, opacity: 0.85, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                {L.subtitulo}
              </div>
            </div>
            <button onClick={() => setAbierto(false)} aria-label={L.cerrar}
              style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: 18, padding: 4 }}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Conversación */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px 12px", background: "#fafcff" }}>
            {mensajes.map((m, i) => (
              <div key={i}>
                <Burbuja from={m.from}>{m.texto}</Burbuja>
                {m.cta && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "2px 0 12px" }}>
                    <a href={waLink(m.cta.wa)} target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                               background: "#22c55e", color: "#fff", fontWeight: 700, fontSize: 13.5,
                               padding: "10px 14px", borderRadius: 10, textDecoration: "none" }}>
                      <i className="fab fa-whatsapp" style={{ fontSize: 18 }}></i> {L.waCta}
                    </a>
                    {m.cta.verCatalogo && (
                      <Link to="/categorias" onClick={() => setAbierto(false)}
                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                                 background: "#fff", color: NAVY, fontWeight: 700, fontSize: 13,
                                 padding: "9px 14px", borderRadius: 10, textDecoration: "none", border: `1px solid ${NAVY}` }}>
                        <i className="fas fa-magnifying-glass"></i> {L.catalogo}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={finRef} />
          </div>

          {/* Respuestas rápidas (menú siempre disponible) */}
          <div style={{ borderTop: "1px solid #eef1f5", padding: 10, background: "#fff" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {L.opciones.map((op) => (
                <button key={op.id} onClick={() => elegir(op)}
                  style={{ border: `1px solid ${BLUE}`, background: "#fff", color: NAVY, fontWeight: 600,
                           fontSize: 12.5, padding: "7px 11px", borderRadius: 20, cursor: "pointer" }}>
                  {op.label}
                </button>
              ))}
            </div>
            {mensajes.length > 1 && (
              <button onClick={reiniciar}
                style={{ marginTop: 8, border: "none", background: "transparent", color: "#64748b", fontSize: 12, cursor: "pointer", padding: 2 }}>
                {L.volver}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
