// src/components/admin/Ventas.jsx
// Módulo de VENTAS del panel admin.
// - Registrar una venta (cliente + líneas de producto). Al guardar, el inventario
//   se descuenta automáticamente (trigger en la BD -> movimiento tipo 'venta').
// - Si vendes algo sin stock suficiente, la venta se registra igual y el stock
//   queda negativo: ese faltante aparece en el apartado "Por surtir" (pedir a proveedor).
// - Lista de ventas recientes con detalle; borrar una venta revierte su inventario.
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../api/supabase";

const NAVY = "#12305C";
const BLUE = "#4FB0E0";

const fmtFechaHora = (s) => {
  if (!s) return "";
  const d = String(s);
  return d.slice(0, 10) + " " + d.slice(11, 16);
};

function Thumb({ url, alt }) {
  if (!url) return <div style={{ width: 34, height: 34, borderRadius: 6, background: "#eef2f7" }} />;
  return (
    <img src={url} alt={alt || ""} loading="lazy"
      onError={(e) => { e.currentTarget.style.display = "none"; }}
      style={{ width: 34, height: 34, objectFit: "contain", borderRadius: 6, background: "#f8fafc" }} />
  );
}

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [porSurtir, setPorSurtir] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [detalle, setDetalle] = useState(null); // { venta, items, cargando }

  // ---- Formulario de alta ----
  const [cliente, setCliente] = useState("");
  const [items, setItems] = useState([]); // [{sku_sinok, mi_sku, nombre, imagen_url, stock, cantidad}]
  const [guardando, setGuardando] = useState(false);
  const [okMsg, setOkMsg] = useState("");

  const cargar = async () => {
    setCargando(true); setError("");
    try {
      const [{ data: vs, error: e1 }, { data: ps, error: e2 }] = await Promise.all([
        supabase.from("v_ventas_resumen").select("*").order("fecha", { ascending: false }).limit(100),
        supabase.from("v_inventario_stock").select("*").lt("stock", 0).order("stock", { ascending: true }).limit(500),
      ]);
      if (e1) throw e1; if (e2) throw e2;
      setVentas(vs || []);
      setPorSurtir(ps || []);
    } catch (e) { setError("No se pudo cargar: " + (e.message || e)); }
    finally { setCargando(false); }
  };
  useEffect(() => { cargar(); }, []);

  const totalPorSurtir = useMemo(
    () => porSurtir.reduce((s, r) => s + Math.max(0, -Number(r.stock || 0)), 0),
    [porSurtir]
  );

  // ---- Agregar / quitar líneas ----
  const agregarLinea = (p) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.sku_sinok === p.sku_sinok);
      if (i >= 0) { const n = [...prev]; n[i] = { ...n[i], cantidad: n[i].cantidad + 1 }; return n; }
      return [...prev, {
        sku_sinok: p.sku_sinok, mi_sku: p.mi_sku, nombre: p.nombre,
        imagen_url: p.imagen_url, stock: Number(p.stock || 0), cantidad: 1,
      }];
    });
  };
  const setCantidad = (sku, val) => {
    const q = Math.max(1, parseInt(val, 10) || 1);
    setItems((prev) => prev.map((x) => (x.sku_sinok === sku ? { ...x, cantidad: q } : x)));
  };
  const quitarLinea = (sku) => setItems((prev) => prev.filter((x) => x.sku_sinok !== sku));

  const guardar = async () => {
    setOkMsg(""); setError("");
    if (!items.length) { setError("Agrega al menos un producto."); return; }
    setGuardando(true);
    try {
      const payload = items.map((x) => ({
        sku_sinok: x.sku_sinok, mi_sku: x.mi_sku, nombre: x.nombre, cantidad: x.cantidad,
      }));
      const { error } = await supabase.rpc("registrar_venta", {
        p_cliente: cliente.trim() || null, p_notas: null, p_items: payload,
      });
      if (error) throw error;
      const piezas = items.reduce((s, x) => s + x.cantidad, 0);
      setOkMsg(`Venta registrada (${piezas} pza${piezas !== 1 ? "s" : ""}). Inventario actualizado.`);
      setItems([]); setCliente("");
      cargar();
    } catch (e) { setError("No se pudo registrar la venta: " + (e.message || e)); }
    finally { setGuardando(false); }
  };

  // ---- Detalle de una venta ----
  const abrirDetalle = async (v) => {
    setDetalle({ venta: v, items: [], cargando: true });
    try {
      const { data, error } = await supabase
        .from("ventas_items").select("*").eq("venta_id", v.id).order("created_at");
      if (error) throw error;
      setDetalle({ venta: v, items: data || [], cargando: false });
    } catch (e) { setDetalle({ venta: v, items: [], cargando: false }); }
  };

  const borrarVenta = async (v) => {
    if (!window.confirm(`¿Borrar la venta de ${v.cliente || "sin cliente"} (${v.piezas} pzas)? Se restaurará el inventario.`)) return;
    try {
      const { error } = await supabase.from("ventas").delete().eq("id", v.id);
      if (error) throw error;
      setDetalle(null);
      cargar();
    } catch (e) { alert("No se pudo borrar: " + (e.message || e)); }
  };

  const piezasEnVenta = items.reduce((s, x) => s + x.cantidad, 0);

  return (
    <div>
      {/* ---- Formulario de nueva venta ---- */}
      <div style={{ border: `1px solid #e2e8f0`, borderRadius: 12, padding: 16, marginBottom: 18 }}>
        <div style={{ fontWeight: 800, color: NAVY, fontSize: 15, marginBottom: 12 }}>Registrar venta</div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end", marginBottom: 12 }}>
          <div style={{ flex: "1 1 220px" }}>
            <Lbl>Cliente (opcional)</Lbl>
            <input value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nombre o referencia del cliente" style={inp} />
          </div>
          <div style={{ flex: "2 1 280px" }}>
            <Lbl>Agregar producto</Lbl>
            <BuscadorSKU onSelect={agregarLinea} />
          </div>
        </div>

        {/* Líneas */}
        {items.length > 0 ? (
          <div style={{ overflowX: "auto", border: "1px solid #eef1f5", borderRadius: 8, marginBottom: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f1f5f9", color: "#64748b", fontSize: 11, textTransform: "uppercase" }}>
                  <th style={{ padding: "6px 8px", textAlign: "left" }}>Producto</th>
                  <th style={{ padding: "6px 8px", textAlign: "right" }}>Stock</th>
                  <th style={{ padding: "6px 8px", textAlign: "center" }}>Cantidad</th>
                  <th style={{ padding: "6px 8px" }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((x) => {
                  const falta = x.cantidad - x.stock;
                  return (
                    <tr key={x.sku_sinok} style={{ borderBottom: "1px solid #eef1f5" }}>
                      <td style={{ padding: "6px 8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Thumb url={x.imagen_url} alt={x.nombre} />
                          <div>
                            <div style={{ fontWeight: 700, color: NAVY }}>{x.mi_sku} <span style={{ fontFamily: "monospace", fontWeight: 400, color: "#64748b" }}>· {x.sku_sinok}</span></div>
                            <div style={{ color: "#475569", fontSize: 12 }}>{String(x.nombre || "").slice(0, 54)}</div>
                            {falta > 0 && (
                              <div style={{ color: "#b45309", fontSize: 11, fontWeight: 700 }}>
                                ⚠ Faltan {falta} — se pedirán al proveedor
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, color: x.stock > 0 ? NAVY : "#dc2626" }}>{x.stock}</td>
                      <td style={{ padding: "6px 8px", textAlign: "center" }}>
                        <input type="number" min="1" value={x.cantidad}
                          onChange={(e) => setCantidad(x.sku_sinok, e.target.value)}
                          style={{ width: 64, padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 6, textAlign: "center" }} />
                      </td>
                      <td style={{ padding: "6px 8px", textAlign: "right" }}>
                        <button onClick={() => quitarLinea(x.sku_sinok)}
                          style={{ border: "none", background: "transparent", color: "#dc2626", cursor: "pointer", fontWeight: 800 }}>×</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 12 }}>Busca y agrega productos a la venta.</div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <button onClick={guardar} disabled={guardando || !items.length}
            style={{ padding: "10px 18px", border: "none", borderRadius: 8, background: NAVY, color: "#fff", fontWeight: 800, cursor: guardando || !items.length ? "not-allowed" : "pointer", opacity: guardando || !items.length ? 0.55 : 1 }}>
            {guardando ? "Guardando…" : `Registrar venta${piezasEnVenta ? ` (${piezasEnVenta} pza${piezasEnVenta !== 1 ? "s" : ""})` : ""}`}
          </button>
          {okMsg && <span style={{ color: "#16a34a", fontSize: 13, fontWeight: 600 }}>{okMsg}</span>}
          {error && <span style={{ color: "#b91c1c", fontSize: 13 }}>{error}</span>}
        </div>
      </div>

      {/* ---- Por surtir (pedir a proveedor) ---- */}
      {porSurtir.length > 0 && (
        <div style={{ border: "1px solid #fecaca", background: "#fef2f2", borderRadius: 12, padding: 14, marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
            <div style={{ fontWeight: 800, color: "#b91c1c", fontSize: 14 }}>Por surtir (pedir al proveedor)</div>
            <div style={{ fontSize: 12, color: "#b91c1c", fontWeight: 700 }}>{porSurtir.length} SKU · {totalPorSurtir} pzas faltantes</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ color: "#7f1d1d", fontSize: 11, textTransform: "uppercase" }}>
                  <th style={{ padding: "4px 8px", textAlign: "left" }}>Mi SKU</th>
                  <th style={{ padding: "4px 8px", textAlign: "left" }}>SKU Sino-K</th>
                  <th style={{ padding: "4px 8px", textAlign: "left" }}>Producto</th>
                  <th style={{ padding: "4px 8px", textAlign: "right" }}>Faltan</th>
                </tr>
              </thead>
              <tbody>
                {porSurtir.map((r) => (
                  <tr key={r.mi_sku} style={{ borderTop: "1px solid #fecaca" }}>
                    <td style={{ padding: "4px 8px", fontWeight: 700, color: NAVY, whiteSpace: "nowrap" }}>{r.mi_sku}</td>
                    <td style={{ padding: "4px 8px", fontFamily: "monospace", fontSize: 12, color: "#475569" }}>{r.sku_sinok || "—"}</td>
                    <td style={{ padding: "4px 8px", color: "#334155" }}>{String(r.nombre || "").slice(0, 60)}</td>
                    <td style={{ padding: "4px 8px", textAlign: "right", fontWeight: 800, color: "#dc2626" }}>{-Number(r.stock)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---- Ventas recientes ---- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontWeight: 800, color: NAVY, fontSize: 15 }}>Ventas recientes</div>
        <button onClick={cargar} style={{ padding: "7px 12px", border: `1px solid ${NAVY}`, borderRadius: 8, background: "#fff", color: NAVY, fontWeight: 700, cursor: "pointer" }}>↻</button>
      </div>
      {cargando ? (
        <div style={{ color: "#64748b", fontSize: 13 }}>Cargando…</div>
      ) : (
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f1f5f9", color: "#64748b", fontSize: 11, textTransform: "uppercase" }}>
                  <th style={{ padding: "8px", textAlign: "left" }}>Fecha</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>Cliente</th>
                  <th style={{ padding: "8px", textAlign: "right" }}>Líneas</th>
                  <th style={{ padding: "8px", textAlign: "right" }}>Piezas</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v) => (
                  <tr key={v.id} onClick={() => abrirDetalle(v)}
                    style={{ borderBottom: "1px solid #eef1f5", cursor: "pointer" }}>
                    <td style={{ padding: "8px", whiteSpace: "nowrap", color: "#334155" }}>{fmtFechaHora(v.fecha)}</td>
                    <td style={{ padding: "8px", color: NAVY, fontWeight: 600 }}>{v.cliente || <span style={{ color: "#94a3b8", fontWeight: 400 }}>—</span>}</td>
                    <td style={{ padding: "8px", textAlign: "right", color: "#475569" }}>{v.lineas}</td>
                    <td style={{ padding: "8px", textAlign: "right", fontWeight: 800, color: NAVY }}>{v.piezas}</td>
                  </tr>
                ))}
                {!ventas.length && <tr><td colSpan={4} style={{ padding: 16, color: "#94a3b8" }}>Aún no hay ventas registradas.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detalle && <ModalDetalle detalle={detalle} onClose={() => setDetalle(null)} onBorrar={borrarVenta} />}
    </div>
  );
}

// ---- Autocompletado de SKU (usa v_inventario_stock para mostrar stock) ----
function BuscadorSKU({ onSelect }) {
  const [q, setQ] = useState("");
  const [sug, setSug] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    clearTimeout(ref.current);
    const term = q.trim();
    if (term.length < 2) { setSug([]); return; }
    ref.current = setTimeout(async () => {
      try {
        const { data } = await supabase
          .from("v_inventario_stock")
          .select("sku_sinok, mi_sku, nombre, imagen_url, stock")
          .or(`mi_sku.ilike.%${term}%,sku_sinok.ilike.%${term}%,nombre.ilike.%${term}%`)
          .order("stock", { ascending: false })
          .limit(10);
        const vistos = new Set(); const out = [];
        (data || []).forEach((p) => { if (p.sku_sinok && !vistos.has(p.sku_sinok)) { vistos.add(p.sku_sinok); out.push(p); } });
        setSug(out); setOpen(true);
      } catch (_) { setSug([]); }
    }, 250);
    return () => clearTimeout(ref.current);
  }, [q]);

  return (
    <div style={{ position: "relative" }}>
      <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => sug.length && setOpen(true)}
        placeholder="Buscar por SKU o nombre…" style={inp} />
      {open && sug.length > 0 && (
        <div style={{ position: "absolute", zIndex: 20, background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", maxHeight: 260, overflowY: "auto", boxShadow: "0 10px 30px rgba(0,0,0,.14)" }}>
          {sug.map((p) => (
            <div key={p.sku_sinok} onClick={() => { onSelect(p); setQ(""); setSug([]); setOpen(false); }}
              style={{ padding: "8px 10px", borderBottom: "1px solid #eef1f5", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <Thumb url={p.imagen_url} alt={p.nombre} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: NAVY, fontSize: 13 }}>{p.mi_sku} <span style={{ fontFamily: "monospace", fontWeight: 400, color: "#64748b" }}>· {p.sku_sinok}</span></div>
                <div style={{ color: "#475569", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nombre}</div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 12, color: Number(p.stock) > 0 ? "#16a34a" : "#dc2626", whiteSpace: "nowrap" }}>
                {Number(p.stock)} en stock
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Modal de detalle de una venta ----
function ModalDetalle({ detalle, onClose, onBorrar }) {
  const { venta, items, cargando } = detalle;
  return (
    <div onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 14, padding: 18, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.3)" }}>
        <h3 style={{ margin: "0 0 4px", color: NAVY, fontWeight: 800 }}>Venta — {venta.cliente || "sin cliente"}</h3>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>{fmtFechaHora(venta.fecha)} · {venta.piezas} pzas</div>
        {cargando ? <div style={{ color: "#64748b", fontSize: 13 }}>Cargando…</div> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f1f5f9", color: "#64748b", fontSize: 11, textTransform: "uppercase" }}>
                  <th style={{ padding: "6px 8px", textAlign: "left" }}>Mi SKU</th>
                  <th style={{ padding: "6px 8px", textAlign: "left" }}>SKU Sino-K</th>
                  <th style={{ padding: "6px 8px", textAlign: "left" }}>Producto</th>
                  <th style={{ padding: "6px 8px", textAlign: "right" }}>Cant.</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} style={{ borderBottom: "1px solid #eef1f5" }}>
                    <td style={{ padding: "6px 8px", fontWeight: 700, color: NAVY, whiteSpace: "nowrap" }}>{it.mi_sku || "—"}</td>
                    <td style={{ padding: "6px 8px", fontFamily: "monospace", fontSize: 12, color: "#475569" }}>{it.sku_sinok}</td>
                    <td style={{ padding: "6px 8px", color: "#334155" }}>{String(it.nombre || "").slice(0, 46)}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 800, color: NAVY }}>{it.cantidad}</td>
                  </tr>
                ))}
                {!items.length && <tr><td colSpan={4} style={{ padding: 12, color: "#94a3b8" }}>Sin líneas.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
          <button onClick={() => onBorrar(venta)}
            style={{ padding: "8px 14px", border: "1px solid #fecaca", borderRadius: 8, background: "#fff", color: "#dc2626", fontWeight: 700, cursor: "pointer" }}>
            Borrar venta (restaura stock)
          </button>
          <button onClick={onClose}
            style={{ padding: "8px 14px", border: `1px solid ${NAVY}`, borderRadius: 8, background: "#fff", color: NAVY, fontWeight: 700, cursor: "pointer" }}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

const Lbl = ({ children }) => <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 3, textTransform: "uppercase" }}>{children}</div>;
const inp = { width: "100%", padding: "9px 11px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 14, boxSizing: "border-box" };
