// src/components/admin/AnalisisCostos.jsx
// VitalSupply · Análisis de Costos (SOLO ADMIN)
// -----------------------------------------------------------------------------
// Ventana de costo real (landed) vs. venta y margen por pedido, split 50/50
// Carlos / Ricardo. Reproduce fiel el diseño de referencia, pero CONECTADO A
// DATOS VIVOS de Supabase:
//   - pedidos:   ventas + ventas_items (precio_unitario en MXN)
//   - landed:    ventas.costo_* (proforma/flete/paypal/iva) y por renglón
//                ventas_items.costo_landed_usd (fallback precios_sinok_proforma)
//   - TC:        config.tipo_cambio_mxn (fallback 18)
//   - imágenes:  productos_medicos_v2.imagen_url
// Reglas: es solo-admin (ruta protegida + RLS es_admin). No expone costos en
// páginas públicas. No usa localStorage.
import { useEffect, useState } from "react";
import { supabase } from "../../api/supabase";

/* ── helpers ── */
const mx = (n) => new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(Math.round(n || 0));
const usd = (n) => new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fmtFecha = (s) => {
  if (!s) return "";
  const d = String(s).slice(0, 10).split("-"); // YYYY-MM-DD (sin líos de zona horaria)
  if (d.length !== 3) return String(s);
  return `${Number(d[2])} ${MES[Number(d[1]) - 1] || ""} ${d[0]}`;
};

function derive(o, TC) {
  const landedUsd = (o.costo.proformaUsd || 0) + (o.costo.fleteUsd || 0) + (o.costo.paypalUsd || 0) + (o.costo.ivaUsd || 0);
  const extra = o.extraMxn || 0;
  const landedMxn = landedUsd * TC + extra;
  const guia = o.guiaMxn || 0;
  const costoReal = landedMxn + guia;
  const ventaProd = o.items.reduce((s, it) => s + it.ventaMxn * it.qty, 0);
  const venta = ventaProd + (o.envioCobradoMxn || 0);
  const margen = venta - costoReal;
  return { landedUsd, landedMxn, guia, costoReal, ventaProd, venta, margen, ganancia: margen / 2, pct: venta ? margen / venta : 0 };
}

function Badge({ tone, children }) {
  return <span className={`vs-badge vs-badge--${tone}`}>{children}</span>;
}

function Thumb({ item }) {
  const [err, setErr] = useState(false);
  const mono = (item.mi || "").replace(/[^0-9]/g, "").slice(-4);
  if (item.img && !err) {
    return <img className="vs-thumb" src={item.img} alt="" loading="lazy" onError={() => setErr(true)} />;
  }
  return <div className="vs-thumb vs-thumb--ph"><span>{mono}</span></div>;
}

function CompositionBar({ d }) {
  const base = d.venta || 1;
  const wLanded = (d.landedMxn / base) * 100;
  const wGuia = (d.guia / base) * 100;
  const wMargen = Math.max(0, (d.margen / base) * 100);
  return (
    <div className="vs-bar" role="img" aria-label={`Composición: costo ${Math.round(wLanded)}%, guía ${Math.round(wGuia)}%, margen ${Math.round(wMargen)}%`}>
      <div className="vs-bar__seg vs-bar__seg--cost" style={{ width: wLanded + "%" }} />
      {wGuia > 0 && <div className="vs-bar__seg vs-bar__seg--guia" style={{ width: wGuia + "%" }} />}
      <div className="vs-bar__seg vs-bar__seg--margin" style={{ width: wMargen + "%" }} />
    </div>
  );
}

// ── Mapea las filas vivas de Supabase al shape que consume la vista ──
function armarPedidos({ ventas, items, proforma, productos }) {
  const proMap = {};
  (proforma || []).forEach((p) => { proMap[p.sku_sinok] = p; });
  const imgMap = {};
  (productos || []).forEach((p) => { imgMap[p.mi_sku] = p.imagen_url; });
  const itemsPorVenta = {};
  (items || []).forEach((it) => { (itemsPorVenta[it.venta_id] = itemsPorVenta[it.venta_id] || []).push(it); });

  return (ventas || []).map((v) => ({
    folio: v.referencia || v.id,
    cliente: v.cliente || "Sin cliente",
    fecha: fmtFecha(v.fecha),
    estado: v.estado || "pagado",
    factura: !!v.con_factura,
    po: v.po || "—",
    ivaEstimada: !!v.iva_estimada,
    guiaMxn: v.guia_costo_mxn == null ? null : Number(v.guia_costo_mxn),
    envioCobradoMxn: Number(v.envio_cobrado_mxn || 0),
    ivaFacturaMxn: Number(v.iva_factura_mxn || 0),
    extraMxn: Number(v.costo_extra_mxn || 0),
    extraLabel: v.costo_extra_desc || "",
    nota: v.nota_costos || "",
    costo: {
      proformaUsd: Number(v.costo_proforma_usd || 0),
      fleteUsd: Number(v.costo_flete_usd || 0),
      paypalUsd: Number(v.costo_paypal_usd || 0),
      ivaUsd: Number(v.costo_iva_usd || 0),
    },
    items: (itemsPorVenta[v.id] || []).map((it) => ({
      mi: it.mi_sku,
      sinok: it.sku_sinok,
      nombre: it.nombre || it.mi_sku,
      img: imgMap[it.mi_sku] || null,
      qty: Number(it.cantidad || 0),
      proformaUsd: Number(proMap[it.sku_sinok]?.precio_proforma ?? 0),
      landedUsd: Number(it.costo_landed_usd ?? proMap[it.sku_sinok]?.costo_landed_usd ?? 0),
      ventaMxn: Number(it.precio_unitario || 0),
    })),
  }));
}

export default function AnalisisCostos() {
  const [tab, setTab] = useState("resumen");
  const [TC, setTC] = useState(18);
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    (async () => {
      setCargando(true); setError("");
      try {
        const [rv, ri, rp, rc] = await Promise.all([
          supabase.from("ventas").select("*").order("fecha", { ascending: true }),
          supabase.from("ventas_items").select("*"),
          supabase.from("precios_sinok_proforma").select("sku_sinok, precio_proforma, costo_landed_usd"),
          supabase.from("config").select("valor").eq("clave", "tipo_cambio_mxn").single(),
        ]);
        if (rv.error) throw rv.error;
        if (ri.error) throw ri.error;
        // proforma/config no son fatales: se degradan con fallback.
        const miSkus = [...new Set((ri.data || []).map((it) => it.mi_sku).filter(Boolean))];
        let productos = [];
        if (miSkus.length) {
          const rprod = await supabase.from("productos_medicos_v2").select("mi_sku, imagen_url").in("mi_sku", miSkus);
          productos = rprod.data || [];
        }
        if (!activo) return;
        const tc = Number(rc?.data?.valor);
        if (Number.isFinite(tc) && tc > 0) setTC(tc);
        setPedidos(armarPedidos({ ventas: rv.data, items: ri.data, proforma: rp.data, productos }));
      } catch (e) {
        if (activo) setError("No se pudo cargar el análisis: " + (e.message || e));
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, []);

  const rows = pedidos.map((o) => ({ o, d: derive(o, TC) }));
  const tot = rows.reduce(
    (a, { o, d }) => ({
      venta: a.venta + d.venta,
      costo: a.costo + d.costoReal,
      margen: a.margen + d.margen,
      ganancia: a.ganancia + d.ganancia,
      iva: a.iva + (o.ivaFacturaMxn || 0),
      pendientes: a.pendientes + (o.guiaMxn == null ? 1 : 0),
    }),
    { venta: 0, costo: 0, margen: 0, ganancia: 0, iva: 0, pendientes: 0 }
  );

  const sel = tab === "resumen" ? null : rows.find((r) => r.o.folio === tab);
  // Si el tab seleccionado ya no existe (recarga), cae a resumen.
  const vistaResumen = tab === "resumen" || !sel;

  return (
    <div className="vs-root">
      <style>{CSS}</style>

      <header className="vs-top">
        <div className="vs-brand">
          <svg className="vs-mark" viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="19" fill="none" stroke="#4FB0E0" strokeWidth="1.5" />
            <path d="M6 21 h7 l3 -9 l4 17 l3 -12 l2 4 h9" fill="none" stroke="#12305C" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          <div>
            <div className="vs-brand__name">VitalSupply</div>
            <div className="vs-brand__sub">Análisis de costos · margen real por pedido</div>
          </div>
        </div>
        <button className="vs-print" onClick={() => window.print()}>Exportar PDF</button>
      </header>

      {cargando ? (
        <div className="vs-loading"><i className="fas fa-spinner fa-spin" /> Cargando análisis…</div>
      ) : error ? (
        <div className="vs-panel"><p className="vs-flag">{error}</p></div>
      ) : !rows.length ? (
        <div className="vs-panel"><p className="vs-flag">Aún no hay pedidos con costos capturados.</p></div>
      ) : (
        <>
          <nav className="vs-tabs" aria-label="Pedidos">
            <button className={`vs-tab ${vistaResumen ? "is-on" : ""}`} onClick={() => setTab("resumen")}>Resumen</button>
            {rows.map(({ o }) => (
              <button key={o.folio} className={`vs-tab ${tab === o.folio ? "is-on" : ""}`} onClick={() => setTab(o.folio)}>
                {o.cliente.split(" ")[0]} {o.cliente.split(" ")[1]?.[0] ? o.cliente.split(" ")[1][0] + "." : ""}
              </button>
            ))}
          </nav>

          {vistaResumen ? (
            <section className="vs-panel">
              <div className="vs-kpis">
                <div className="vs-kpi vs-kpi--hero">
                  <span className="vs-kpi__eyebrow">Tu ganancia (50%)</span>
                  <span className="vs-kpi__val">${mx(tot.ganancia)}<em>MXN</em></span>
                  <span className="vs-kpi__note">Ricardo recibe lo mismo · margen total ${mx(tot.margen)}</span>
                </div>
                <div className="vs-kpi">
                  <span className="vs-kpi__eyebrow">Venta total</span>
                  <span className="vs-kpi__val vs-kpi__val--sm">${mx(tot.venta)}</span>
                </div>
                <div className="vs-kpi">
                  <span className="vs-kpi__eyebrow">Costo real</span>
                  <span className="vs-kpi__val vs-kpi__val--sm">${mx(tot.costo)}</span>
                </div>
                <div className="vs-kpi">
                  <span className="vs-kpi__eyebrow">Margen bruto</span>
                  <span className="vs-kpi__val vs-kpi__val--sm vs-pos">${mx(tot.margen)}</span>
                </div>
              </div>

              {tot.pendientes > 0 && (
                <p className="vs-flag">
                  {tot.pendientes} pedido(s) con guía nacional pendiente — el margen bajará un poco al capturar esas guías.
                </p>
              )}

              <div className="vs-tablewrap">
                <table className="vs-table">
                  <thead>
                    <tr>
                      <th>Pedido</th><th className="r">Venta</th><th className="r">Costo real</th>
                      <th className="r">Margen</th><th className="r">%</th><th className="r">Tú (50%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ o, d }) => (
                      <tr key={o.folio} className="vs-rowlink" onClick={() => setTab(o.folio)}>
                        <td>
                          <div className="vs-cell-main">{o.cliente}</div>
                          <div className="vs-cell-sub">{o.folio}{o.guiaMxn == null ? " · guía pendiente" : ""}</div>
                        </td>
                        <td className="r num">${mx(d.venta)}</td>
                        <td className="r num">${mx(d.costoReal)}</td>
                        <td className="r num vs-pos">${mx(d.margen)}</td>
                        <td className="r num">{Math.round(d.pct * 100)}%</td>
                        <td className="r num strong">${mx(d.ganancia)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Total</td>
                      <td className="r num">${mx(tot.venta)}</td>
                      <td className="r num">${mx(tot.costo)}</td>
                      <td className="r num vs-pos">${mx(tot.margen)}</td>
                      <td className="r num">{tot.venta ? Math.round((tot.margen / tot.venta) * 100) : 0}%</td>
                      <td className="r num strong">${mx(tot.ganancia)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              {tot.iva > 0 && <p className="vs-foot-note">IVA facturado: ${mx(tot.iva)} — es traslado al SAT, no forma parte del margen.</p>}
            </section>
          ) : (
            <OrderView o={sel.o} d={sel.d} TC={TC} />
          )}
        </>
      )}
    </div>
  );
}

function OrderView({ o, d, TC }) {
  return (
    <section className="vs-panel">
      <div className="vs-orderhead">
        <div>
          <div className="vs-orderhead__folio">{o.folio}</div>
          <h2 className="vs-orderhead__name">{o.cliente}</h2>
          <div className="vs-orderhead__meta">{o.fecha} · {o.po}</div>
        </div>
        <div className="vs-orderhead__badges">
          <Badge tone={o.estado === "pagado" ? "ok" : "wait"}>{o.estado}</Badge>
          <Badge tone={o.factura ? "info" : "muted"}>{o.factura ? "con factura" : "sin factura"}</Badge>
        </div>
      </div>

      <div className="vs-hero">
        <div className="vs-hero__main">
          <span className="vs-kpi__eyebrow">Ganancia · tú</span>
          <span className="vs-hero__val">${mx(d.ganancia)}<em>MXN</em></span>
          <span className="vs-hero__split">Ricardo ${mx(d.ganancia)} · margen bruto ${mx(d.margen)}{o.guiaMxn == null ? " (antes de guía)" : ""}</span>
        </div>
        <div className="vs-hero__pct">
          <span className="vs-hero__pctnum">{Math.round(d.pct * 100)}%</span>
          <span className="vs-hero__pctlbl">margen</span>
        </div>
      </div>

      <CompositionBar d={d} />
      <div className="vs-legend">
        <span><i className="dot dot--cost" /> Costo landed ${mx(d.landedMxn)}</span>
        <span><i className="dot dot--guia" /> Guía {o.guiaMxn == null ? "pendiente" : "$" + mx(d.guia)}</span>
        <span><i className="dot dot--margin" /> Margen ${mx(d.margen)}</span>
      </div>

      {o.nota && <p className="vs-flag">{o.nota}</p>}
      {o.ivaEstimada && <p className="vs-flag vs-flag--soft">IVA de aduana estimado — embarque {o.po} aún en tránsito. Se ajusta al liberar.</p>}

      {/* Productos */}
      <h3 className="vs-h3">Productos</h3>
      <div className="vs-items">
        {o.items.map((it, i) => {
          const landedLine = it.landedUsd * it.qty * TC;
          const ventaLine = it.ventaMxn * it.qty;
          const margenLine = ventaLine - landedLine;
          return (
            <article className="vs-item" key={i}>
              <Thumb item={it} />
              <div className="vs-item__body">
                <div className="vs-item__top">
                  <span className="vs-item__sku">{it.mi}</span>
                  <span className="vs-item__sinok">{it.sinok}</span>
                </div>
                <p className="vs-item__name">{it.nombre}</p>
                <div className="vs-item__grid">
                  <div><span>Cant.</span><b>{it.qty}</b></div>
                  <div><span>Proforma</span><b>${usd(it.proformaUsd)}</b></div>
                  <div><span>Landed c/u</span><b>${mx(it.landedUsd * TC)}</b></div>
                  <div><span>Venta c/u</span><b>${mx(it.ventaMxn)}</b></div>
                  <div><span>Costo línea</span><b>${mx(landedLine)}</b></div>
                  <div><span>Margen línea</span><b className="vs-pos">${mx(margenLine)}</b></div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Cómo se forma el costo */}
      <h3 className="vs-h3">Cómo se forma el costo landed</h3>
      <div className="vs-breakdown">
        <Row label="Producto (proforma)" usdv={o.costo.proformaUsd} TC={TC} />
        <Row label="Flete internacional (prorrateado)" usdv={o.costo.fleteUsd} TC={TC} />
        <Row label="Comisión PayPal" usdv={o.costo.paypalUsd} TC={TC} />
        <Row label={`IVA aduana${o.ivaEstimada ? " (estimado)" : ""}`} usdv={o.costo.ivaUsd} TC={TC} />
        {o.extraMxn > 0 && (
          <div className="vs-brow">
            <span>{o.extraLabel || "Compra local"}</span>
            <span className="num">${mx(o.extraMxn)} MXN</span>
          </div>
        )}
        <Row label="Costo landed" usdv={d.landedUsd} total extraMxn={o.extraMxn} TC={TC} />
      </div>

      {/* Resumen del pedido */}
      <h3 className="vs-h3">Resumen del pedido</h3>
      <div className="vs-summary">
        <SRow label="Costo landed (productos)" val={d.landedMxn} />
        <SRow label={o.guiaMxn == null ? "Guía nacional (pendiente)" : "Guía nacional"} val={d.guia} muted={o.guiaMxn == null} />
        <SRow label="Costo real total" val={d.costoReal} strong />
        <div className="vs-summary__gap" />
        <SRow label="Venta a cliente" val={d.ventaProd} />
        {o.envioCobradoMxn > 0 && <SRow label="Envío cobrado" val={o.envioCobradoMxn} />}
        {o.factura && <SRow label="IVA trasladado (SAT)" val={o.ivaFacturaMxn} muted note="no es margen" />}
        <SRow label="Venta total" val={d.venta} strong />
        <div className="vs-summary__gap" />
        <SRow label={`Margen bruto${o.guiaMxn == null ? " (antes de guía)" : ""}`} val={d.margen} pos big />
        <div className="vs-split">
          <div><span>Carlos</span><b>${mx(d.ganancia)}</b></div>
          <div className="vs-split__x">/</div>
          <div><span>Ricardo</span><b>${mx(d.ganancia)}</b></div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, usdv, total, extraMxn, TC }) {
  return (
    <div className={`vs-brow ${total ? "vs-brow--total" : ""}`}>
      <span>{label}</span>
      <span className="num">${usd(usdv)} <em>· ${mx(usdv * TC + (extraMxn || 0))} MXN{extraMxn ? " c/local" : ""}</em></span>
    </div>
  );
}

function SRow({ label, val, strong, muted, pos, big, note }) {
  return (
    <div className={`vs-srow ${strong ? "is-strong" : ""} ${big ? "is-big" : ""}`}>
      <span>{label}{note ? <em className="vs-srow__note"> · {note}</em> : null}</span>
      <span className={`num ${pos ? "vs-pos" : ""} ${muted ? "vs-muted" : ""}`}>${mx(val)}</span>
    </div>
  );
}

const CSS = `
.vs-root{--navy:#12305C;--blue:#4FB0E0;--ink:#0E1B2E;--muted:#6B7B90;--line:#E3EAF2;--bg:#F4F7FB;--card:#fff;--pos:#0E9F6E;--amber:#B8860B;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,Helvetica,Arial,sans-serif;
  color:var(--ink);background:var(--bg);min-height:100%;line-height:1.45;-webkit-font-smoothing:antialiased;}
.vs-root *{box-sizing:border-box;}
.num{font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1;}
.vs-pos{color:var(--pos);}
.vs-muted{color:var(--muted);}
.r{text-align:right;}
.vs-loading{padding:60px 18px;text-align:center;color:var(--muted);font-size:14px;font-weight:600;}
.vs-loading i{margin-right:8px;color:var(--blue);}

.vs-top{display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:16px 18px;background:var(--navy);color:#fff;position:sticky;top:0;z-index:5;}
.vs-brand{display:flex;align-items:center;gap:12px;min-width:0;}
.vs-mark{width:34px;height:34px;flex:none;background:#fff;border-radius:50%;padding:3px;}
.vs-brand__name{font-weight:700;letter-spacing:-.01em;font-size:16px;}
.vs-brand__sub{font-size:11.5px;color:#B8CBE4;letter-spacing:.02em;}
.vs-print{flex:none;background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.25);
  border-radius:8px;padding:8px 12px;font-size:12.5px;font-weight:600;cursor:pointer;transition:background .15s;}
.vs-print:hover{background:rgba(255,255,255,.22);}

.vs-tabs{display:flex;gap:6px;overflow-x:auto;padding:12px 18px;background:var(--card);border-bottom:1px solid var(--line);
  -webkit-overflow-scrolling:touch;scrollbar-width:none;}
.vs-tabs::-webkit-scrollbar{display:none;}
.vs-tab{flex:none;border:1px solid var(--line);background:#fff;color:var(--muted);border-radius:999px;
  padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .15s;}
.vs-tab:hover{border-color:var(--blue);color:var(--navy);}
.vs-tab.is-on{background:var(--navy);border-color:var(--navy);color:#fff;}

.vs-panel{padding:18px;max-width:920px;margin:0 auto;}

.vs-kpis{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.vs-kpi{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:4px;}
.vs-kpi--hero{grid-column:1/-1;background:linear-gradient(135deg,var(--navy),#1C4B8A);border:none;color:#fff;padding:22px;}
.vs-kpi__eyebrow{font-size:10.5px;text-transform:uppercase;letter-spacing:.13em;font-weight:700;color:var(--muted);}
.vs-kpi--hero .vs-kpi__eyebrow{color:#9FC3E8;}
.vs-kpi__val{font-size:34px;font-weight:750;letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1.05;}
.vs-kpi__val em{font-size:14px;font-weight:600;font-style:normal;margin-left:6px;color:#B8CBE4;}
.vs-kpi__val--sm{font-size:22px;color:var(--navy);}
.vs-kpi__note{font-size:12px;color:#C9DBF0;margin-top:2px;}

.vs-flag{margin:14px 0 0;background:#FFF8E8;border:1px solid #F0DFB0;color:#7A5B10;
  font-size:12.5px;padding:10px 12px;border-radius:10px;}
.vs-flag--soft{background:#F1F6FC;border-color:#D6E6F5;color:#3A5B80;}

.vs-tablewrap{margin-top:16px;background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden;}
.vs-table{width:100%;border-collapse:collapse;font-size:13.5px;}
.vs-table th{font-size:10.5px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:700;
  text-align:left;padding:12px 14px;background:#FAFCFE;border-bottom:1px solid var(--line);}
.vs-table td{padding:12px 14px;border-bottom:1px solid var(--line);}
.vs-table tbody tr:last-child td{border-bottom:1px solid var(--line);}
.vs-rowlink{cursor:pointer;transition:background .12s;}
.vs-rowlink:hover{background:#F6FAFE;}
.vs-cell-main{font-weight:600;}
.vs-cell-sub{font-size:11.5px;color:var(--muted);}
.strong{font-weight:700;color:var(--navy);}
.vs-table tfoot td{padding:13px 14px;font-weight:700;background:#FAFCFE;border-top:2px solid var(--navy);color:var(--navy);}
.vs-foot-note{font-size:11.5px;color:var(--muted);margin-top:10px;}

/* order view */
.vs-orderhead{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;}
.vs-orderhead__folio{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--blue);font-weight:700;}
.vs-orderhead__name{margin:2px 0 0;font-size:20px;font-weight:730;letter-spacing:-.01em;}
.vs-orderhead__meta{font-size:12.5px;color:var(--muted);margin-top:2px;}
.vs-orderhead__badges{display:flex;flex-direction:column;gap:6px;align-items:flex-end;flex:none;}
.vs-badge{font-size:10.5px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;padding:4px 9px;border-radius:999px;}
.vs-badge--ok{background:#E4F6EE;color:#0E7A52;}
.vs-badge--wait{background:#FFF4E0;color:#9A6B00;}
.vs-badge--info{background:#E7F1FB;color:#1C4B8A;}
.vs-badge--muted{background:#EEF2F7;color:#6B7B90;}

.vs-hero{margin-top:16px;background:linear-gradient(135deg,var(--navy),#1C4B8A);color:#fff;border-radius:16px;
  padding:20px 22px;display:flex;align-items:center;justify-content:space-between;gap:16px;}
.vs-hero__main{display:flex;flex-direction:column;gap:3px;min-width:0;}
.vs-hero__main .vs-kpi__eyebrow{color:#9FC3E8;}
.vs-hero__val{font-size:38px;font-weight:760;letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1.02;}
.vs-hero__val em{font-size:15px;font-style:normal;font-weight:600;margin-left:7px;color:#B8CBE4;}
.vs-hero__split{font-size:12.5px;color:#C9DBF0;}
.vs-hero__pct{flex:none;text-align:center;background:rgba(255,255,255,.12);border-radius:12px;padding:12px 16px;}
.vs-hero__pctnum{display:block;font-size:26px;font-weight:750;color:var(--blue);font-variant-numeric:tabular-nums;}
.vs-hero__pctlbl{font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#B8CBE4;}

.vs-bar{display:flex;height:14px;border-radius:8px;overflow:hidden;margin-top:16px;background:#E7EDF4;}
.vs-bar__seg{height:100%;transition:width .5s cubic-bezier(.4,0,.2,1);}
.vs-bar__seg--cost{background:var(--navy);}
.vs-bar__seg--guia{background:var(--amber);}
.vs-bar__seg--margin{background:var(--pos);}
.vs-legend{display:flex;flex-wrap:wrap;gap:14px;margin-top:10px;font-size:12px;color:var(--muted);}
.vs-legend .dot{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:6px;vertical-align:middle;}
.dot--cost{background:var(--navy);}.dot--guia{background:var(--amber);}.dot--margin{background:var(--pos);}

.vs-h3{font-size:11px;text-transform:uppercase;letter-spacing:.11em;color:var(--muted);font-weight:700;
  margin:24px 0 10px;padding-bottom:8px;border-bottom:1px solid var(--line);}

.vs-items{display:flex;flex-direction:column;gap:10px;}
.vs-item{display:flex;gap:12px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px;}
.vs-thumb{width:64px;height:64px;flex:none;border-radius:10px;object-fit:cover;background:#EEF3F8;border:1px solid var(--line);}
.vs-thumb--ph{display:flex;align-items:center;justify-content:center;color:var(--navy);font-weight:700;font-size:12px;
  background:repeating-linear-gradient(45deg,#EEF3F8,#EEF3F8 6px,#E7EDF4 6px,#E7EDF4 12px);letter-spacing:.04em;}
.vs-item__body{min-width:0;flex:1;}
.vs-item__top{display:flex;align-items:center;gap:8px;}
.vs-item__sku{font-weight:700;font-size:12.5px;color:var(--navy);}
.vs-item__sinok{font-size:10.5px;color:var(--muted);background:#EEF2F7;padding:2px 7px;border-radius:6px;font-variant-numeric:tabular-nums;}
.vs-item__name{margin:3px 0 8px;font-size:12.5px;color:#33465E;}
.vs-item__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px 10px;}
.vs-item__grid > div{display:flex;flex-direction:column;}
.vs-item__grid span{font-size:9.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);font-weight:700;}
.vs-item__grid b{font-size:13.5px;font-weight:650;font-variant-numeric:tabular-nums;}

.vs-breakdown,.vs-summary{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:6px 16px;}
.vs-brow{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid var(--line);font-size:13.5px;}
.vs-brow:last-child{border-bottom:none;}
.vs-brow span:first-child{color:#33465E;}
.vs-brow .num em{font-style:normal;color:var(--muted);font-size:11.5px;}
.vs-brow--total{font-weight:750;color:var(--navy);border-top:2px solid var(--navy);}
.vs-brow--total span:first-child{color:var(--navy);}

.vs-srow{display:flex;justify-content:space-between;align-items:baseline;padding:9px 0;font-size:13.5px;border-bottom:1px solid var(--line);}
.vs-srow:last-of-type{border-bottom:none;}
.vs-srow span:first-child{color:#33465E;}
.vs-srow__note{font-style:normal;font-size:11px;color:var(--muted);}
.vs-srow.is-strong{font-weight:750;color:var(--navy);}
.vs-srow.is-strong span:first-child{color:var(--navy);}
.vs-srow.is-big{font-size:17px;font-weight:750;padding:14px 0;}
.vs-srow.is-big .num{font-size:19px;}
.vs-summary__gap{height:6px;}

.vs-split{display:flex;align-items:center;gap:14px;margin-top:8px;padding:14px;border-radius:12px;
  background:linear-gradient(135deg,#EAF3FB,#F4F9FE);border:1px solid #D6E6F5;}
.vs-split > div{flex:1;display:flex;flex-direction:column;gap:2px;}
.vs-split span{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);font-weight:700;}
.vs-split b{font-size:20px;font-weight:750;color:var(--navy);font-variant-numeric:tabular-nums;}
.vs-split__x{flex:none!important;color:var(--blue);font-size:20px;font-weight:300;}

@media(min-width:560px){
  .vs-kpis{grid-template-columns:repeat(4,1fr);}
  .vs-kpi--hero{grid-column:1/-1;}
}
@media(max-width:420px){
  .vs-item{flex-direction:column;}
  .vs-thumb{width:100%;height:120px;}
  .vs-item__grid{grid-template-columns:repeat(2,1fr);}
  .vs-hero__val{font-size:32px;}
  .vs-kpi__val{font-size:28px;}
}
@media(prefers-reduced-motion:reduce){.vs-bar__seg{transition:none;}}

@media print{
  .vs-root{background:#fff;}
  .vs-top{position:static;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .vs-tabs,.vs-print,.vs-rowlink{display:none!important;}
  .vs-kpi--hero,.vs-hero,.vs-split{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .vs-panel{max-width:none;}
}
`;
