// ============================================================================
//  VitalSupply — Generador de Cotizaciones  (admin)
//    1) PEDIDO  -> Orden de compra a Sino-K (P/N Sino-K, costo USD)
//    2) CLIENTE -> Cotizacion VitalSupply (SKU MED-XXXX, precio de venta)
//  PDF (jsPDF + autotable) con logo + imagenes de producto, idioma ES/EN,
//  guardado en public.cotizaciones con folio consecutivo + historial.
//
//  Requisitos:  npm i jspdf jspdf-autotable
// ============================================================================

import { useState, useMemo, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "../../api/supabase";

const TABLA = "productos_medicos_v2";           // catalogo completo -> cotizaciones a CLIENTE (precio de venta)
const VISTA_PROVEEDOR = "v_cotizacion_proveedor"; // costos reales de proforma -> ordenes de compra a Sino-K
const COL = {
  pk: "mi_sku", sku_sinok: "sku_sinok", competencia: "sku_competencia",
  nombre: "nombre", precio: "precio", precio_sinok: "precio_sinok", imagen: "imagen_url",
  costo_proforma: "costo_proforma", costo_confirmado: "costo_confirmado",
};
const COLS_BUSQUEDA = [COL.pk, COL.nombre, COL.competencia, COL.sku_sinok];

const EMPRESA = {
  nombre: "VitalSupply", eslogan: "Sensores y cables compatibles para equipo medico",
  dir: "Torreon, Coahuila, Mexico", tel: "WhatsApp +52 871 782 1161",
  web: "vitalsupply.site", email: "sales.vitalsupplymx@gmail.com",
};
const PROVEEDOR = {
  nombre: "Shenzhen Sino-K Medical Technology Co., Ltd",
  attn: "Attn: Emma Huang", email: "sales08@sino-k.com", paypal: "sinok2026@163.com",
};

// Logo VitalSupply (incrustado)
const LOGO_DATA_URL = "data:image/png;base64,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";

const IVA_PCT = 16;
const AZUL = [30, 58, 95], AZUL_CLARO = [232, 238, 247], GRIS = [110, 116, 124];

// Traducciones del PDF
const T = {
  es: {
    cot: "COTIZACION", oc: "ORDEN DE COMPRA", folio: "Folio", fecha: "Fecha",
    de: "DE:", cliente: "CLIENTE:", proveedor: "PARA (PROVEEDOR):",
    img: "Imagen", desc: "Descripcion", cant: "Cant", importe: "Importe", totalCol: "Total",
    punit: (m) => `P. Unit (${m})`, subtotal: "Subtotal", descuento: "Descuento", descuentoVolumen: "Descuento por volumen",
    iva: "IVA", envio: "Envio", envioGratis: "Gratis", envioIncluido: "Incluido", envioAparte: "Se cotiza aparte",
    shipping: "Costo de envio", bank: "Cargo bancario",
    total: "TOTAL", validez: "Validez de la oferta", notas: "Notas:", condiciones: "Condiciones:",
    condCliente: (m) => `Precios en ${m}. Productos compatibles / refacciones. Tiempo de entrega 10-15 dias habiles.\nGarantia de compatibilidad: cambio o devolucion si el producto no funciona con su equipo.\nPago: transferencia / PayPal / tarjeta. Cotizacion sujeta a disponibilidad.`,
    condPedido: "100% pago por adelantado. Envio por FedEx.",
    rfq: "SOLICITUD DE COTIZACION",
    condRFQ: "Favor de cotizar sus mejores precios de distribuidor + envio FedEx a Torreon, Mexico (CP 27294).",
  },
  en: {
    cot: "QUOTATION", oc: "PURCHASE ORDER", folio: "Quote No", fecha: "Date",
    de: "FROM:", cliente: "CLIENT:", proveedor: "TO (SUPPLIER):",
    img: "Image", desc: "Description", cant: "Qty", importe: "Amount", totalCol: "Total",
    punit: (m) => `Unit Price (${m})`, subtotal: "Subtotal", descuento: "Discount", descuentoVolumen: "Volume discount",
    iva: "Tax", envio: "Shipping", envioGratis: "Free", envioIncluido: "Included", envioAparte: "Quoted separately",
    shipping: "Shipping cost", bank: "Bank charge",
    total: "TOTAL", validez: "Offer validity", notas: "Notes:", condiciones: "Terms:",
    condCliente: (m) => `Prices in ${m}. Compatible / replacement accessories. Lead time 10-15 business days.\nCompatibility guarantee: exchange or refund if the product does not work with your equipment.\nPayment: wire transfer / PayPal / card. Quotation subject to availability.`,
    condPedido: "100% payment in advance. Delivery by FedEx.",
    rfq: "REQUEST FOR QUOTATION",
    condRFQ: "Please quote your best distributor prices + FedEx shipping to Torreon, Mexico (ZIP 27294).",
  },
};

// ============================================================================
const fmt = (n, m) => new Intl.NumberFormat("es-MX", { style: "currency", currency: m }).format(Number.isFinite(+n) ? +n : 0);
const hoy = () => new Date().toISOString().slice(0, 10);

// Normaliza tipo de descuento/envio (con inferencia para historial previo a estos campos)
function descTipoDe(cot) { return cot.descuento_tipo || (Number(cot.descuento_pct) > 0 ? "pct" : "none"); }
function envioTipoDe(cot) {
  if (cot.tipo === "pedido") return "monto";
  return cot.envio_tipo || (Number(cot.envio) > 0 ? "monto" : "gratis");
}
function totales(cot) {
  const sub = (cot.items || []).reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.precio) || 0), 0);
  let desc = 0;
  if (cot.tipo === "cliente") {
    const dt = descTipoDe(cot);
    if (dt === "pct") desc = sub * (Number(cot.descuento_pct) || 0) / 100;
    else if (dt === "monto") desc = Math.min(Number(cot.descuento_monto) || 0, sub);
  }
  const base = sub - desc;
  const iva = base * (Number(cot.iva_pct) || 0) / 100;
  // El envio solo suma al total cuando es un monto; "incluido"/"gratis"/"se cotiza aparte" no suman.
  const envioMonto = envioTipoDe(cot) === "monto" ? (Number(cot.envio) || 0) : 0;
  const total = cot.tipo === "pedido"
    ? sub + envioMonto + (Number(cot.cargo_banco) || 0)
    : base + iva + envioMonto;
  return { subtotal: sub, descuento: desc, iva, total };
}
function agrupar(items) {
  const orden = [], map = new Map();
  (items || []).forEach((it) => { const g = it.grupo || ""; if (!map.has(g)) { map.set(g, []); orden.push(g); } map.get(g).push(it); });
  return orden.map((g) => ({ grupo: g, lista: map.get(g) }));
}
// PEDIDO: consolida lineas con el mismo P/N de Sino-K (suma cantidades) para no repetir el mismo item en la OC.
function consolidarPorSinok(items) {
  const orden = [], map = new Map();
  (items || []).forEach((it) => {
    const k = it.sinok ? `SINOK:${it.sinok}` : `SKU:${it.sku}:${orden.length}`; // sin P/N Sino-K: no se consolida
    if (map.has(k)) { const acc = map.get(k); acc.qty = (Number(acc.qty) || 0) + (Number(it.qty) || 0); }
    else { const copia = { ...it, qty: Number(it.qty) || 0 }; map.set(k, copia); orden.push(copia); }
  });
  return orden;
}
function escribeBloque(doc, x, y, titulo, lineas) {
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(30, 58, 95); doc.text(titulo, x, y);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(40, 40, 40);
  lineas.forEach((l, i) => doc.text(String(l), x, y + 13 + i * 12));
}
// Carga una imagen (URL o data URL) y regresa { url: PNG data URL, w, h }. Falla -> null
// Conserva la proporción real (w, h) para dibujarla sin deformar en el PDF.
function cargarImagen(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const max = 480;
        const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        const ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve({ url: c.toDataURL("image/png"), w, h });
      } catch (e) { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// construye el PDF (async por las imagenes). cot.idioma = 'es' | 'en'
async function construirPDF(cot) {
  const t = T[cot.idioma === "en" ? "en" : "es"];
  const moneda = cot.moneda || "USD";
  const { subtotal, descuento, iva, total } = totales(cot);

  // PEDIDO: consolidar por P/N de Sino-K (mismo producto físico). CLIENTE: se dejan tal cual.
  const itemsDoc = cot.tipo === "pedido" ? consolidarPorSinok(cot.items) : (cot.items || []);

  // precargar imagenes de producto
  const imgs = await Promise.all(itemsDoc.map((it) => cargarImagen(it.imagen)));

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth(), M = 40;
  let y = 44;

  // Encabezado: logo + nombre
  let textX = M;
  if (LOGO_DATA_URL && LOGO_DATA_URL.startsWith("data:")) {
    try { doc.addImage(LOGO_DATA_URL, "PNG", M, y - 22, 42, 42); textX = M + 50; } catch (_) {}
  }
  doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.setTextColor(...AZUL);
  doc.text("VitalSupply", textX, y + 6);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...GRIS);
  doc.text(EMPRESA.eslogan, textX, y + 18);

  doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(...AZUL);
  const titulo = cot.tipo === "pedido" ? (cot.sin_precios ? t.rfq : t.oc) : t.cot;
  doc.text(titulo, W - M, y, { align: "right" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...GRIS);
  doc.text(`${t.folio}: ${cot.folio || "-"}`, W - M, y + 16, { align: "right" });
  doc.text(`${t.fecha}: ${cot.fecha || hoy()}`, W - M, y + 29, { align: "right" });

  y += 48; doc.setDrawColor(...AZUL); doc.setLineWidth(1.2); doc.line(M, y, W - M, y); y += 18;
  const colDe = M, colPara = W / 2 + 10;
  if (cot.tipo === "pedido") {
    escribeBloque(doc, colDe, y, t.de, [EMPRESA.nombre, EMPRESA.dir, EMPRESA.tel, EMPRESA.email]);
    escribeBloque(doc, colPara, y, t.proveedor, [PROVEEDOR.nombre, cot.atencion || PROVEEDOR.attn, PROVEEDOR.email, `PayPal: ${PROVEEDOR.paypal}`]);
  } else {
    escribeBloque(doc, colDe, y, t.de, [EMPRESA.nombre, EMPRESA.dir, EMPRESA.tel, EMPRESA.email, EMPRESA.web]);
    escribeBloque(doc, colPara, y, t.cliente, [cot.destinatario || "_______________________", cot.atencion ? "Attn: " + cot.atencion : "", cot.correo_cliente || "", `${t.validez}: ${cot.validez || "15 dias"}`].filter(Boolean));
  }
  y += 86;

  const refHead = cot.tipo === "pedido" ? "Sino-K P/N" : "SKU";
  const rfq = !!cot.sin_precios; // solicitud de cotizacion: sin columnas de precio
  const nCols = rfq ? 5 : 7;
  const head = rfq
    ? [["#", t.img, refHead, t.desc, t.cant]]
    : [["#", t.img, refHead, t.desc, t.cant, t.punit(moneda), cot.tipo === "pedido" ? t.totalCol : t.importe]];
  const body = [], rowImgs = []; let n = 0;
  agrupar(itemsDoc).forEach(({ grupo, lista }) => {
    if (grupo) { body.push([{ content: grupo, colSpan: nCols, styles: { fontStyle: "bold", fillColor: AZUL_CLARO, textColor: AZUL } }]); rowImgs.push(null); }
    lista.forEach((it) => {
      const idx = itemsDoc.indexOf(it);
      const imp = (Number(it.qty) || 0) * (Number(it.precio) || 0);
      const ref = cot.tipo === "pedido" ? (it.sinok || "-") : (it.sku || "-");
      body.push(rfq
        ? [String(++n), "", ref, it.nombre, String(it.qty)]
        : [String(++n), "", ref, it.nombre, String(it.qty), fmt(it.precio, moneda), fmt(imp, moneda)]);
      rowImgs.push(imgs[idx] || null);
    });
  });

  autoTable(doc, {
    head, body, startY: y, margin: { left: M, right: M },
    styles: { fontSize: 8.5, cellPadding: 4, valign: "middle", minCellHeight: 116 },
    headStyles: { fillColor: AZUL, textColor: 255, fontStyle: "bold" },
    columnStyles: rfq
      ? {
          0: { cellWidth: 24, halign: "center" }, 1: { cellWidth: 140, halign: "center" },
          2: { cellWidth: 90 }, 4: { cellWidth: 50, halign: "center" },
        }
      : {
          0: { cellWidth: 22, halign: "center" }, 1: { cellWidth: 132, halign: "center" },
          2: { cellWidth: 70 }, 4: { cellWidth: 32, halign: "center" },
          5: { cellWidth: 70, halign: "right" }, 6: { cellWidth: 70, halign: "right" },
        },
    theme: "grid",
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 1) {
        const im = rowImgs[data.row.index];
        if (im && im.url) {
          const pad = 3;
          const boxW = data.cell.width - pad * 2;
          const boxH = data.cell.height - pad * 2;
          // Ajuste "contain": llena la celda lo más posible sin deformar la foto.
          const s = Math.min(boxW / im.w, boxH / im.h);
          const w = Math.max(1, im.w * s), h = Math.max(1, im.h * s);
          const x = data.cell.x + (data.cell.width - w) / 2;
          const yy = data.cell.y + (data.cell.height - h) / 2;
          try { doc.addImage(im.url, "PNG", x, yy, w, h); } catch (_) {}
        }
      }
    },
  });

  let yt = doc.lastAutoTable.finalY + 16;
  const xL = W - M - 200, xV = W - M;
  const linea = (lab, val) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(40, 40, 40);
    doc.text(lab, xL, yt); doc.text(val, xV, yt, { align: "right" }); yt += 15;
  };
  if (rfq) {
    // solicitud de cotizacion: no se muestran totales
  } else if (cot.tipo === "pedido") {
    linea(t.subtotal, fmt(subtotal, moneda));
    if (Number(cot.envio) > 0) linea(t.shipping, fmt(cot.envio, moneda));
    if (Number(cot.cargo_banco) > 0) linea(t.bank, fmt(cot.cargo_banco, moneda));
  } else {
    linea(t.subtotal, fmt(subtotal, moneda));
    if (descuento > 0) {
      const labDesc = descTipoDe(cot) === "pct" ? `${t.descuento} (${cot.descuento_pct}%)` : t.descuentoVolumen;
      linea(labDesc, "-" + fmt(descuento, moneda));
    }
    if (Number(cot.iva_pct) > 0) linea(`${t.iva} (${cot.iva_pct}%)`, fmt(iva, moneda));
    const et = envioTipoDe(cot);
    const valEnvio = et === "monto" ? fmt(cot.envio, moneda)
      : et === "incluido" ? t.envioIncluido
      : et === "aparte" ? t.envioAparte
      : t.envioGratis;
    linea(t.envio, valEnvio);
  }
  if (!rfq) {
    // barra de TOTAL resaltada
    yt += 8;
    const boxH = 26;
    doc.setFillColor(...AZUL); doc.roundedRect(xL, yt, xV - xL, boxH, 4, 4, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(255, 255, 255);
    doc.text(`${t.total} ${moneda}`, xL + 12, yt + 17);
    doc.text(fmt(total, moneda), xV - 12, yt + 17, { align: "right" });
    yt += boxH + 16;
  } else {
    yt += 4;
  }
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...AZUL);
  doc.text(cot.tipo === "pedido" ? t.notas : t.condiciones, M, yt);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...GRIS);
  const cond = cot.notas || (rfq ? t.condRFQ : cot.tipo === "cliente" ? t.condCliente(moneda) : t.condPedido);
  doc.text(doc.splitTextToSize(cond, W - 2 * M), M, yt + 13);

  doc.setFontSize(7.5); doc.setTextColor(...GRIS);
  doc.text(`VitalSupply · ${EMPRESA.web} · ${EMPRESA.tel}`, W / 2, doc.internal.pageSize.getHeight() - 24, { align: "center" });

  doc.save(`${cot.folio || "cotizacion"}.pdf`);
}

// ============================================================================
export default function CotizacionGenerator() {
  const [tipo, setTipo] = useState("cliente");
  const [idioma, setIdioma] = useState("es");
  const [folio, setFolio] = useState("");
  const [fecha, setFecha] = useState(hoy());
  const [destinatario, setDestinatario] = useState("");
  const [atencion, setAtencion] = useState("");
  const [correoCliente, setCorreoCliente] = useState("");
  const [validez, setValidez] = useState("15 dias");
  const [notas, setNotas] = useState("");

  const [items, setItems] = useState([]);
  const [sinPrecios, setSinPrecios] = useState(false); // pedido: solicitud de cotizacion (RFQ) sin precios
  const [descTipo, setDescTipo] = useState("none");     // none | pct | monto
  const [descPct, setDescPct] = useState(0);
  const [descMonto, setDescMonto] = useState(0);
  const [ivaOn, setIvaOn] = useState(false);
  const [envioTipo, setEnvioTipo] = useState("gratis"); // incluido | gratis | monto | aparte
  const [envio, setEnvio] = useState(0);
  const [cargoBanco, setCargoBanco] = useState(0);
  const [monedaCliente, setMonedaCliente] = useState("MXN");
  const [fx, setFx] = useState(18);
  const [fxAviso, setFxAviso] = useState(false);        // true si se uso el fallback por defecto

  const [q, setQ] = useState(""); const [res, setRes] = useState([]);
  const [buscando, setBuscando] = useState(false); const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false); const [ok, setOk] = useState("");
  const [historial, setHistorial] = useState([]);
  const tRef = useRef();

  const moneda = tipo === "pedido" ? "USD" : monedaCliente;

  useEffect(() => { if (monedaCliente === "USD") setIvaOn(false); }, [monedaCliente]);

  // Al cambiar la moneda del documento, reconvierte los precios ya capturados (USD <-> MXN)
  const cambiarMoneda = (nueva) => {
    const t = Number(fx) || 18;
    setItems((prev) => prev.map((it) => {
      let precio = Number(it.precio) || 0;
      if (monedaCliente === "USD" && nueva === "MXN") precio = Math.round(precio * t);
      else if (monedaCliente === "MXN" && nueva === "USD") precio = +(precio / t).toFixed(2);
      return { ...it, precio };
    }));
    setMonedaCliente(nueva);
  };

  const cargarHistorial = async () => {
    try { const { data } = await supabase.from("cotizaciones").select("*").order("created_at", { ascending: false }).limit(20); setHistorial(data || []); } catch (_) {}
  };
  useEffect(() => { cargarHistorial(); }, []);

  // Tipo de cambio configurable en Supabase (public.config). Fallback 18.0 + aviso discreto.
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from("config").select("valor").eq("clave", "tipo_cambio_mxn").single();
        const v = parseFloat(data?.valor);
        if (error || !Number.isFinite(v) || v <= 0) throw error || new Error("valor invalido");
        setFx(v); setFxAviso(false);
      } catch (_) {
        setFx(18.0); setFxAviso(true);
      }
    })();
  }, []);

  useEffect(() => {
    clearTimeout(tRef.current);
    if (q.trim().length < 2) { setRes([]); return; }
    tRef.current = setTimeout(async () => {
      setBuscando(true); setError("");
      try {
        const orFilter = COLS_BUSQUEDA.map((c) => `${c}.ilike.%${q.trim()}%`).join(",");
        // PEDIDO -> vista con costos reales de proforma (nunca expone precio de venta)
        // CLIENTE -> catalogo completo con precio de venta
        const fuente = tipo === "pedido" ? VISTA_PROVEEDOR : TABLA;
        const { data, error } = await supabase.from(fuente).select("*").or(orFilter).limit(30);
        if (error) throw error;
        // Dedup por P/N de Sino-K: mismo sku_sinok = mismo producto fisico -> se muestra 1 solo (evita "repetidos").
        const vistos = new Set();
        const dedup = (data || []).filter((p) => {
          const s = p[COL.sku_sinok];
          if (!s) return true;
          if (vistos.has(s)) return false;
          vistos.add(s); return true;
        }).slice(0, 15);
        setRes(dedup);
      } catch (e) { setError("Error en busqueda: " + (e.message || e)); setRes([]); }
      finally { setBuscando(false); }
    }, 300);
    return () => clearTimeout(tRef.current);
  }, [q, tipo]);

  const agregar = (p) => {
    // PEDIDO: costo real de proforma en USD (si no esta confirmado queda 0 -> Emma cotiza).
    //         NUNCA usar precio de venta en documentos a proveedor.
    // CLIENTE: el precio unitario se guarda en la MONEDA del documento. En MXN se pre-llena
    //          con la sugerencia precio_usd * TC redondeada; el usuario puede sobreescribirlo
    //          (p. ej. precio de canal 799) antes de generar el PDF.
    const t = Number(fx) || 18;
    // CLIENTE: usar el MISMO precio que ve el cliente en la tienda (precio_venta_sugerido con fallback a precio),
    //          no la columna `precio` cruda (que puede traer valores viejos/inflados).
    const precioUsd = Number(p.precio_venta_sugerido) > 0 ? Number(p.precio_venta_sugerido) : (Number(p[COL.precio]) || 0);
    const precioLinea = tipo === "pedido"
      ? (Number(p[COL.costo_proforma]) || 0)
      : (monedaCliente === "MXN" ? Math.round(precioUsd * t) : precioUsd);
    const confirmado = tipo === "pedido" ? !!p[COL.costo_confirmado] : true;
    setItems((prev) => [...prev, { key: crypto.randomUUID(), grupo: "", sinok: p[COL.sku_sinok] || "", sku: p[COL.pk] || "", nombre: p[COL.nombre] || "(sin nombre)", imagen: p[COL.imagen] || "", qty: 1, precio: precioLinea, precio_usd: precioUsd, confirmado }]);
    setQ(""); setRes([]);
  };
  const upd = (key, c, v) => setItems((prev) => prev.map((it) => (it.key === key ? { ...it, [c]: v } : it)));
  const quitar = (key) => setItems((prev) => prev.filter((it) => it.key !== key));

  const cotActual = () => ({
    tipo, idioma, folio: folio || null, fecha, destinatario, atencion,
    correo_cliente: tipo === "cliente" ? (correoCliente || null) : null,
    validez, moneda,
    sin_precios: tipo === "pedido" && sinPrecios,
    descuento_tipo: tipo === "cliente" ? descTipo : "none",
    descuento_pct: tipo === "cliente" && descTipo === "pct" ? Number(descPct) || 0 : 0,
    descuento_monto: tipo === "cliente" && descTipo === "monto" ? Number(descMonto) || 0 : 0,
    iva_pct: tipo === "cliente" && ivaOn ? IVA_PCT : 0,
    envio_tipo: tipo === "cliente" ? envioTipo : "monto",
    envio: tipo === "cliente" ? (envioTipo === "monto" ? Number(envio) || 0 : 0) : (Number(envio) || 0),
    cargo_banco: tipo === "pedido" ? Number(cargoBanco) || 0 : 0,
    tipo_cambio: tipo === "cliente" ? Number(fx) || 0 : null,
    notas,
    items: items.map((it) => ({ grupo: it.grupo || "", sku: it.sku, sinok: it.sinok, nombre: it.nombre, imagen: it.imagen || "", qty: Number(it.qty) || 0, precio: Number(it.precio) || 0 })),
  });

  const display = useMemo(() => totales(cotActual()), [items, descTipo, descPct, descMonto, ivaOn, envioTipo, envio, cargoBanco, monedaCliente, fx, tipo]);

  const generarYGuardar = async () => {
    if (items.length === 0) { alert("Agrega al menos un producto."); return; }
    setGuardando(true); setOk(""); setError("");
    const cot = cotActual();
    const { subtotal, total } = totales(cot);
    let folioFinal = cot.folio;
    try {
      const { sin_precios: _sp, ...cotDB } = cot; // columna no existe en la tabla; solo controla el PDF
      const { data, error } = await supabase.from("cotizaciones").insert({ ...cotDB, subtotal, total }).select("folio").single();
      if (error) throw error;
      folioFinal = data.folio; setOk(`Guardada con folio ${folioFinal}`); cargarHistorial();
    } catch (e) {
      folioFinal = cot.folio || `${tipo === "pedido" ? "PO" : "VS-COT"}-${hoy()}`;
      setError("No se pudo guardar (se genera el PDF igual): " + (e.message || e));
    } finally { setGuardando(false); }
    await construirPDF({ ...cot, folio: folioFinal });
  };

  const borrarHistorial = async (id) => {
    if (!confirm("Borrar esta cotizacion guardada?")) return;
    await supabase.from("cotizaciones").delete().eq("id", id); cargarHistorial();
  };

  return (
    <div style={S.wrap}>
      <div style={S.tabs}>
        <button style={tab(tipo === "cliente")} onClick={() => setTipo("cliente")}>Cotizacion a cliente</button>
        <button style={tab(tipo === "pedido")} onClick={() => setTipo("pedido")}>Orden de compra (Sino-K)</button>
      </div>

      <div style={S.grid}>
        <Campo label="Folio (vacio = automatico)"><input style={S.in} value={folio} onChange={(e) => setFolio(e.target.value)} placeholder="(automatico)" /></Campo>
        <Campo label="Fecha"><input style={S.in} type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></Campo>
        <Campo label="Idioma del PDF"><select style={S.in} value={idioma} onChange={(e) => setIdioma(e.target.value)}><option value="es">Espanol</option><option value="en">English</option></select></Campo>
        <Campo label={tipo === "pedido" ? "Proveedor / Attn" : "Cliente"}><input style={S.in} value={destinatario} onChange={(e) => setDestinatario(e.target.value)} placeholder={tipo === "pedido" ? "Emma Huang" : "Nombre del cliente / hospital"} /></Campo>
        <Campo label="Atencion / contacto"><input style={S.in} value={atencion} onChange={(e) => setAtencion(e.target.value)} /></Campo>
        {tipo === "cliente" && <Campo label="Correo del cliente"><input style={S.in} type="email" value={correoCliente} onChange={(e) => setCorreoCliente(e.target.value)} placeholder="cliente@correo.com" /></Campo>}
        {tipo === "cliente" && <Campo label="Validez"><input style={S.in} value={validez} onChange={(e) => setValidez(e.target.value)} /></Campo>}
        {tipo === "cliente" && (<Campo label="Moneda"><select style={S.in} value={monedaCliente} onChange={(e) => cambiarMoneda(e.target.value)}><option value="MXN">MXN</option><option value="USD">USD</option></select></Campo>)}
        {tipo === "cliente" && monedaCliente === "MXN" && (
          <Campo label="Tipo de cambio (MXN/USD)">
            <input style={S.in} type="number" step="0.01" value={fx} onChange={(e) => setFx(e.target.value)} />
            {fxAviso && <span style={{ fontSize: 11, color: "#8a5a00" }}>⚠ Valor por defecto (18.0): no se pudo leer config.</span>}
          </Campo>
        )}
      </div>

      <div style={{ position: "relative", marginTop: 12 }}>
        <input style={S.in} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar producto por SKU, nombre o competencia..." />
        {buscando && <span style={S.small}>buscando...</span>}
        {error && <div style={S.err}>{error}</div>}
        {res.length > 0 && (
          <div style={S.dropdown}>
            {res.map((p) => (
              <div key={p[COL.pk]} style={S.opt} onClick={() => agregar(p)}>
                {p[COL.imagen] ? <img src={p[COL.imagen]} alt="" style={S.thumb} /> : <div style={S.thumb} />}
                <div style={{ flex: 1 }}>
                  <b>{p[COL.pk]}</b>{p[COL.sku_sinok] ? ` · ${p[COL.sku_sinok]}` : ""}
                  <div style={S.small}>{p[COL.nombre]}</div>
                </div>
                <span style={S.precioOpt}>
                  {tipo === "pedido"
                    ? (p[COL.costo_confirmado]
                        ? fmt(p[COL.costo_proforma], "USD") + " proforma ✓"
                        : "sin costo confirmado")
                    : fmt(Number(p.precio_venta_sugerido) > 0 ? p.precio_venta_sugerido : p[COL.precio], "USD")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <table style={S.table}>
        <thead><tr>
          <th style={S.th}>Img</th><th style={S.th}>Grupo / Equipo</th><th style={S.th}>{tipo === "pedido" ? "Sino-K P/N" : "SKU"}</th>
          <th style={S.th}>Producto</th><th style={S.th}>Cant</th><th style={S.th}>P. Unit ({moneda})</th>
          <th style={S.th}>Importe ({moneda})</th><th style={S.th}></th>
        </tr></thead>
        <tbody>
          {items.length === 0 && <tr><td style={S.td} colSpan={8}>Busca y agrega productos arriba.</td></tr>}
          {items.map((it) => (
            <tr key={it.key}>
              <td style={S.td}>{it.imagen ? <img src={it.imagen} alt="" style={S.thumbSm} /> : <div style={S.thumbSm} />}</td>
              <td style={S.td}><input style={S.inSm} value={it.grupo} placeholder="(opcional)" onChange={(e) => upd(it.key, "grupo", e.target.value)} /></td>
              <td style={S.td}>{tipo === "pedido" ? (it.sinok || "-") : it.sku}</td>
              <td style={S.td}>{it.nombre}</td>
              <td style={S.td}><input style={S.inNum} type="number" min="1" value={it.qty} onChange={(e) => upd(it.key, "qty", e.target.value)} /></td>
              <td style={S.td}>
                <input style={S.inNum} type="number" step="0.01" value={it.precio} onChange={(e) => upd(it.key, "precio", e.target.value)} />
                {tipo === "cliente" && it.precio_usd ? <div style={S.small}>ref USD {it.precio_usd}</div> : null}
              </td>
              <td style={S.td}>{fmt((Number(it.qty) || 0) * (Number(it.precio) || 0), moneda)}</td>
              <td style={S.td}><button style={S.del} onClick={() => quitar(it.key)}>x</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={S.grid}>
        {tipo === "cliente" && (<>
          <Campo label="Descuento">
            <select style={S.in} value={descTipo} onChange={(e) => setDescTipo(e.target.value)}>
              <option value="none">Sin descuento</option>
              <option value="pct">Porcentaje (%)</option>
              <option value="monto">Monto fijo ({moneda})</option>
            </select>
          </Campo>
          {descTipo === "pct" && <Campo label="Descuento %"><input style={S.in} type="number" min="0" value={descPct} onChange={(e) => setDescPct(e.target.value)} /></Campo>}
          {descTipo === "monto" && <Campo label={`Descuento (${moneda})`}><input style={S.in} type="number" min="0" value={descMonto} onChange={(e) => setDescMonto(e.target.value)} /></Campo>}
          <Campo label={`IVA ${IVA_PCT}%`}><label style={{ display: "flex", gap: 6, alignItems: "center", paddingTop: 6 }}><input type="checkbox" checked={ivaOn} onChange={(e) => setIvaOn(e.target.checked)} /> incluir</label></Campo>
          <Campo label="Envio">
            <select style={S.in} value={envioTipo} onChange={(e) => setEnvioTipo(e.target.value)}>
              <option value="incluido">Incluido</option>
              <option value="gratis">Gratis</option>
              <option value="monto">Monto ({moneda})</option>
              <option value="aparte">Se cotiza aparte</option>
            </select>
          </Campo>
          {envioTipo === "monto" && <Campo label={`Envio (${moneda})`}><input style={S.in} type="number" min="0" value={envio} onChange={(e) => setEnvio(e.target.value)} /></Campo>}
        </>)}
        {tipo === "pedido" && (<>
          <Campo label="Shipping cost (USD)"><input style={S.in} type="number" value={envio} onChange={(e) => setEnvio(e.target.value)} /></Campo>
          <Campo label="Bank charge (USD)"><input style={S.in} type="number" value={cargoBanco} onChange={(e) => setCargoBanco(e.target.value)} /></Campo>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#1e3a5f", margin: "10px 0" }}>
            <input type="checkbox" checked={sinPrecios} onChange={(e) => setSinPrecios(e.target.checked)} />
            Solicitud de cotizacion (RFQ) — generar PDF sin precios para que el proveedor cotice
          </label>
          {!sinPrecios && items.some((it) => it.confirmado === false) && (
            <div style={{ background: "#fff7e6", border: "1px solid #f0c36d", borderRadius: 8, padding: "8px 12px", fontSize: 12.5, color: "#8a5a00", margin: "6px 0" }}>
              ⚠️ Hay productos sin costo confirmado en proforma (aparecen en 0). Pide cotizacion a Sino-K antes de enviar esta orden, o activa el modo RFQ.
            </div>
          )}
        </>)}
      </div>

      <Campo label="Notas / condiciones (opcional, sobreescribe el texto por defecto)"><textarea style={{ ...S.in, height: 56 }} value={notas} onChange={(e) => setNotas(e.target.value)} /></Campo>

      <div style={S.totBox}>
        <div>Subtotal: <b>{fmt(display.subtotal, moneda)}</b></div>
        {tipo === "cliente" && display.descuento > 0 && <div>{descTipo === "pct" ? `Descuento (${descPct}%)` : "Descuento por volumen"}: -{fmt(display.descuento, moneda)}</div>}
        {tipo === "cliente" && ivaOn && <div>IVA: {fmt(display.iva, moneda)}</div>}
        {tipo === "cliente" && <div>Envio: {envioTipo === "monto" ? fmt(Number(envio) || 0, moneda) : envioTipo === "incluido" ? "Incluido" : envioTipo === "aparte" ? "Se cotiza aparte" : "Gratis"}</div>}
        <div style={S.totBig}>TOTAL: {fmt(display.total, moneda)}</div>
      </div>

      {ok && <div style={S.ok}>{ok}</div>}
      <button style={{ ...S.btnPDF, opacity: guardando ? 0.6 : 1 }} disabled={guardando} onClick={generarYGuardar}>{guardando ? "Guardando..." : "Generar y guardar PDF"}</button>

      <h3 style={{ color: "#1e3a5f", marginTop: 32 }}>Historial</h3>
      <table style={S.table}>
        <thead><tr><th style={S.th}>Folio</th><th style={S.th}>Tipo</th><th style={S.th}>Idioma</th><th style={S.th}>Fecha</th><th style={S.th}>Para</th><th style={S.th}>Total</th><th style={S.th}></th></tr></thead>
        <tbody>
          {historial.length === 0 && <tr><td style={S.td} colSpan={7}>Sin cotizaciones guardadas.</td></tr>}
          {historial.map((r) => (
            <tr key={r.id}>
              <td style={S.td}><b>{r.folio}</b></td><td style={S.td}>{r.tipo}</td><td style={S.td}>{(r.idioma || "es").toUpperCase()}</td>
              <td style={S.td}>{r.fecha}</td><td style={S.td}>{r.destinatario || "-"}</td><td style={S.td}>{fmt(r.total, r.moneda)}</td>
              <td style={S.td}><button style={S.btnSm} onClick={() => construirPDF(r)}>PDF</button><button style={S.del} onClick={() => borrarHistorial(r.id)}>x</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Campo({ label, children }) {
  return (<div style={{ display: "flex", flexDirection: "column", gap: 3 }}><span style={{ fontSize: 12, color: "#6e747c", fontWeight: 600 }}>{label}</span>{children}</div>);
}
const tab = (a) => ({ padding: "10px 16px", border: "none", cursor: "pointer", fontWeight: 700, background: a ? "#1e3a5f" : "#e8eef7", color: a ? "#fff" : "#1e3a5f", borderRadius: 8 });
const S = {
  wrap: { fontFamily: "system-ui, sans-serif", color: "#1f2937" },
  tabs: { display: "flex", gap: 8, marginBottom: 16 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginTop: 8 },
  in: { padding: "8px 10px", border: "1px solid #cdd3da", borderRadius: 8, fontSize: 14, width: "100%", boxSizing: "border-box" },
  inSm: { padding: "5px 7px", border: "1px solid #cdd3da", borderRadius: 6, fontSize: 12, width: 110 },
  inNum: { padding: "5px 7px", border: "1px solid #cdd3da", borderRadius: 6, fontSize: 13, width: 70 },
  small: { fontSize: 11, color: "#6e747c" },
  precioOpt: { fontSize: 12, color: "#1e3a5f", fontWeight: 700, whiteSpace: "nowrap" },
  thumb: { width: 38, height: 38, objectFit: "contain", borderRadius: 6, background: "#f1f5f9", marginRight: 10, flexShrink: 0 },
  thumbSm: { width: 34, height: 34, objectFit: "contain", borderRadius: 6, background: "#f1f5f9" },
  dropdown: { position: "absolute", zIndex: 20, background: "#fff", border: "1px solid #cdd3da", borderRadius: 8, width: "100%", maxHeight: 300, overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,.12)" },
  opt: { padding: "8px 10px", borderBottom: "1px solid #eef1f5", cursor: "pointer", display: "flex", alignItems: "center" },
  err: { color: "#b91c1c", fontSize: 12, marginTop: 6 },
  ok: { color: "#15803d", fontSize: 13, marginTop: 10, fontWeight: 600 },
  table: { width: "100%", borderCollapse: "collapse", marginTop: 16, fontSize: 13 },
  th: { textAlign: "left", padding: "8px", background: "#1e3a5f", color: "#fff", fontSize: 12 },
  td: { padding: "7px 8px", borderBottom: "1px solid #eef1f5", verticalAlign: "middle" },
  del: { border: "none", background: "#fee2e2", color: "#b91c1c", borderRadius: 6, width: 26, height: 26, cursor: "pointer", fontWeight: 700, marginLeft: 6 },
  btnSm: { border: "none", background: "#e8eef7", color: "#1e3a5f", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 700 },
  totBox: { marginTop: 16, padding: 14, background: "#f4f6f9", borderRadius: 10, textAlign: "right", lineHeight: 1.7 },
  totBig: { fontSize: 18, fontWeight: 800, color: "#1e3a5f", marginTop: 4 },
  btnPDF: { marginTop: 12, padding: "12px 22px", border: "none", borderRadius: 10, background: "#1e3a5f", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" },
};
