// src/components/admin/Inventario.jsx
// Módulo de INVENTARIO del panel admin.
// - Stock por sku_sinok (vista v_inventario_stock, sobre TODO el catálogo).
//   Si varios productos comparten sku_sinok, cada producto se lista pero muestra el
//   mismo stock (el del sku_sinok). Las "piezas" se cuentan por sku_sinok distinto.
// - Agrupado por categoría en acordeones; toggle "Solo con stock" (default ON);
//   buscador global; alta de movimientos; historial por SKU.
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../api/supabase";

const NAVY = "#12305C";
const BLUE = "#4FB0E0";
const PAGE = 100; // paginación por categoría en modo "catálogo completo"

const fmtFecha = (s) => (s ? String(s).slice(0, 10) : "");
const Placeholder = () => (
  <div style={{ width: 38, height: 38, borderRadius: 6, background: "#eef2f7" }} />
);

function Thumb({ url, alt }) {
  if (!url) return <Placeholder />;
  return (
    <img
      src={url}
      alt={alt || ""}
      loading="lazy"
      onError={(e) => { e.currentTarget.style.display = "none"; }}
      style={{ width: 38, height: 38, objectFit: "contain", borderRadius: 6, background: "#f8fafc" }}
    />
  );
}

// Fila de producto (tabla dentro de cada categoría)
function FilaProducto({ r, onHistorial }) {
  const bajo = r.tiene_movimientos && r.stock <= 2; // resaltar bajo stock solo si tiene movimientos
  const clickable = r.tiene_movimientos;
  return (
    <tr
      onClick={clickable ? () => onHistorial(r) : undefined}
      style={{ borderBottom: "1px solid #eef1f5", cursor: clickable ? "pointer" : "default" }}
    >
      <td style={{ padding: "6px 8px" }}><Thumb url={r.imagen_url} alt={r.nombre} /></td>
      <td style={{ padding: "6px 8px", fontWeight: 700, color: NAVY, whiteSpace: "nowrap" }}>{r.mi_sku}</td>
      <td style={{ padding: "6px 8px", fontFamily: "monospace", fontSize: 12, color: "#475569", whiteSpace: "nowrap" }}>{r.sku_sinok || "—"}</td>
      <td style={{ padding: "6px 8px", fontSize: 13, color: "#334155", minWidth: 160 }}>{r.nombre}</td>
      <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 800, whiteSpace: "nowrap",
                   color: bajo ? "#dc2626" : (r.stock > 0 ? NAVY : "#94a3b8") }}>
        {r.stock}{bajo ? " ⚠" : ""}
      </td>
    </tr>
  );
}

function TablaProductos({ rows, onHistorial, vacio }) {
  if (!rows.length) return <div style={{ padding: 14, color: "#94a3b8", fontSize: 13 }}>{vacio}</div>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#f1f5f9", color: "#64748b", fontSize: 11, textTransform: "uppercase" }}>
            <th style={{ padding: "6px 8px", textAlign: "left" }}>Img</th>
            <th style={{ padding: "6px 8px", textAlign: "left" }}>Mi SKU</th>
            <th style={{ padding: "6px 8px", textAlign: "left" }}>SKU Sino-K</th>
            <th style={{ padding: "6px 8px", textAlign: "left" }}>Producto</th>
            <th style={{ padding: "6px 8px", textAlign: "right" }}>Stock</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => <FilaProducto key={r.mi_sku} r={r} onHistorial={onHistorial} />)}
        </tbody>
      </table>
    </div>
  );
}

export default function Inventario() {
  const [resumen, setResumen] = useState([]);       // [{categoria, productos, con_stock, piezas}]
  const [stockRows, setStockRows] = useState([]);   // filas con stock > 0 (todas las categorías)
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [soloConStock, setSoloConStock] = useState(true);
  const [abiertas, setAbiertas] = useState(() => new Set());
  const [catFull, setCatFull] = useState({});       // cat -> { rows, fin, cargando }

  const [q, setQ] = useState("");
  const [resultados, setResultados] = useState(null); // null = sin búsqueda
  const buscarRef = useRef();

  const [modal, setModal] = useState(false);
  const [hist, setHist] = useState(null);           // { r, rows, cargando }

  // ---- Carga inicial: resumen + filas con stock ----
  const cargar = async () => {
    setCargando(true); setError("");
    try {
      const [{ data: res, error: e1 }, { data: st, error: e2 }] = await Promise.all([
        supabase.rpc("inventario_resumen"),
        supabase.from("v_inventario_stock").select("*").gt("stock", 0).limit(5000),
      ]);
      if (e1) throw e1; if (e2) throw e2;
      setResumen(res || []);
      setStockRows(st || []);
    } catch (e) { setError("No se pudo cargar el inventario: " + (e.message || e)); }
    finally { setCargando(false); }
  };
  useEffect(() => { cargar(); }, []);

  // ---- Totales globales (desde el resumen) ----
  const totales = useMemo(() => {
    const piezas = resumen.reduce((s, r) => s + Number(r.piezas || 0), 0);
    const conStock = resumen.reduce((s, r) => s + Number(r.con_stock || 0), 0);
    const catalogo = resumen.reduce((s, r) => s + Number(r.productos || 0), 0);
    return { piezas, conStock, catalogo };
  }, [resumen]);

  // ---- Categorías a mostrar (ordenadas por piezas desc; filtra si "solo con stock") ----
  const categorias = useMemo(() => {
    return [...resumen]
      .filter((r) => (soloConStock ? Number(r.con_stock) > 0 : true))
      .sort((a, b) => Number(b.piezas) - Number(a.piezas) || a.categoria.localeCompare(b.categoria));
  }, [resumen, soloConStock]);

  const filasConStockPorCat = useMemo(() => {
    const map = {};
    stockRows.forEach((r) => { (map[r.categoria] = map[r.categoria] || []).push(r); });
    Object.values(map).forEach((arr) => arr.sort((a, b) => b.stock - a.stock));
    return map;
  }, [stockRows]);

  // ---- Búsqueda global (cruza todas las categorías) ----
  useEffect(() => {
    clearTimeout(buscarRef.current);
    const term = q.trim();
    if (term.length < 2) { setResultados(null); return; }
    buscarRef.current = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from("v_inventario_stock")
          .select("*")
          .or(`mi_sku.ilike.%${term}%,sku_sinok.ilike.%${term}%,nombre.ilike.%${term}%`)
          .order("stock", { ascending: false })
          .limit(60);
        if (error) throw error;
        setResultados(data || []);
      } catch (e) { setResultados([]); }
    }, 300);
    return () => clearTimeout(buscarRef.current);
  }, [q]);

  // ---- Acordeón: abrir/cerrar + carga perezosa del catálogo completo ----
  const toggleCat = (cat) => {
    setAbiertas((prev) => {
      const n = new Set(prev);
      n.has(cat) ? n.delete(cat) : n.add(cat);
      return n;
    });
    if (!soloConStock && !catFull[cat]) cargarCat(cat, 0);
  };

  const cargarCat = async (cat, desde) => {
    setCatFull((p) => ({ ...p, [cat]: { ...(p[cat] || { rows: [] }), cargando: true } }));
    try {
      const { data, error } = await supabase
        .from("v_inventario_stock")
        .select("*")
        .eq("categoria", cat)
        .order("nombre")
        .range(desde, desde + PAGE - 1);
      if (error) throw error;
      setCatFull((p) => {
        const prev = p[cat]?.rows || [];
        return { ...p, [cat]: { rows: desde === 0 ? (data || []) : [...prev, ...(data || [])], fin: (data || []).length < PAGE, cargando: false } };
      });
    } catch (e) {
      setCatFull((p) => ({ ...p, [cat]: { ...(p[cat] || { rows: [] }), cargando: false, fin: true } }));
    }
  };

  // Al cambiar el toggle, cargar categorías abiertas en modo completo
  useEffect(() => {
    if (!soloConStock) abiertas.forEach((cat) => { if (!catFull[cat]) cargarCat(cat, 0); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soloConStock]);

  const filasDeCat = (cat) =>
    soloConStock ? (filasConStockPorCat[cat] || []) : (catFull[cat]?.rows || []);

  // ---- Historial de un SKU ----
  const abrirHistorial = async (r) => {
    setHist({ r, rows: [], cargando: true });
    try {
      const { data, error } = await supabase
        .from("inventario_movimientos")
        .select("*")
        .eq("sku_sinok", r.sku_sinok)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setHist({ r, rows: data || [], cargando: false });
    } catch (e) { setHist({ r, rows: [], cargando: false }); }
  };

  return (
    <div>
      {/* Resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 16 }}>
        <Card titulo="Piezas en stock" valor={totales.piezas} bg={NAVY} />
        <Card titulo="SKUs con stock" valor={totales.conStock} bg={BLUE} />
        <Card titulo="SKUs en catálogo" valor={totales.catalogo} bg="#334155" />
      </div>

      {/* Controles */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 14 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por SKU o nombre (todas las categorías)…"
          style={{ flex: "1 1 220px", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 14 }}
        />
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: NAVY, whiteSpace: "nowrap" }}>
          <input type="checkbox" checked={soloConStock} onChange={(e) => setSoloConStock(e.target.checked)} />
          Solo con stock
        </label>
        <button onClick={() => setModal(true)}
          style={{ padding: "9px 14px", border: "none", borderRadius: 8, background: NAVY, color: "#fff", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
          + Movimiento
        </button>
        <button onClick={cargar}
          style={{ padding: "9px 12px", border: `1px solid ${NAVY}`, borderRadius: 8, background: "#fff", color: NAVY, fontWeight: 700, cursor: "pointer" }}>
          ↻
        </button>
      </div>

      {error && <div style={{ color: "#b91c1c", fontSize: 13, marginBottom: 10 }}>{error}</div>}
      {cargando && <div style={{ color: "#64748b", fontSize: 13 }}>Cargando inventario…</div>}

      {/* Resultados de búsqueda (flat, cruza categorías) */}
      {resultados !== null ? (
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "8px 12px", background: "#f8fafc", fontSize: 12, fontWeight: 700, color: NAVY }}>
            Resultados de "{q}" — {resultados.length}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f1f5f9", color: "#64748b", fontSize: 11, textTransform: "uppercase" }}>
                  <th style={{ padding: "6px 8px", textAlign: "left" }}>Img</th>
                  <th style={{ padding: "6px 8px", textAlign: "left" }}>Mi SKU</th>
                  <th style={{ padding: "6px 8px", textAlign: "left" }}>SKU Sino-K</th>
                  <th style={{ padding: "6px 8px", textAlign: "left" }}>Producto</th>
                  <th style={{ padding: "6px 8px", textAlign: "left" }}>Categoría</th>
                  <th style={{ padding: "6px 8px", textAlign: "right" }}>Stock</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((r) => {
                  const bajo = r.tiene_movimientos && r.stock <= 2;
                  return (
                    <tr key={r.mi_sku} onClick={r.tiene_movimientos ? () => abrirHistorial(r) : undefined}
                        style={{ borderBottom: "1px solid #eef1f5", cursor: r.tiene_movimientos ? "pointer" : "default" }}>
                      <td style={{ padding: "6px 8px" }}><Thumb url={r.imagen_url} alt={r.nombre} /></td>
                      <td style={{ padding: "6px 8px", fontWeight: 700, color: NAVY, whiteSpace: "nowrap" }}>{r.mi_sku}</td>
                      <td style={{ padding: "6px 8px", fontFamily: "monospace", fontSize: 12, color: "#475569" }}>{r.sku_sinok || "—"}</td>
                      <td style={{ padding: "6px 8px", color: "#334155" }}>{r.nombre}</td>
                      <td style={{ padding: "6px 8px", fontSize: 12, color: "#64748b" }}>{r.categoria}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 800, color: bajo ? "#dc2626" : (r.stock > 0 ? NAVY : "#94a3b8") }}>{r.stock}{bajo ? " ⚠" : ""}</td>
                    </tr>
                  );
                })}
                {!resultados.length && <tr><td colSpan={6} style={{ padding: 14, color: "#94a3b8" }}>Sin resultados.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Acordeones por categoría
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {categorias.map((c) => {
            const open = abiertas.has(c.categoria);
            const fullState = catFull[c.categoria];
            return (
              <div key={c.categoria} style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                <button onClick={() => toggleCat(c.categoria)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                           padding: "12px 14px", background: open ? NAVY : "#f8fafc", color: open ? "#fff" : NAVY,
                           border: "none", cursor: "pointer", fontWeight: 800, fontSize: 14, textAlign: "left" }}>
                  <span>{open ? "▾" : "▸"} {c.categoria}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: open ? "#cbd5e1" : "#64748b" }}>
                    {c.con_stock} con stock / {c.productos} SKUs · <b style={{ color: open ? BLUE : NAVY }}>{c.piezas} pzas</b>
                  </span>
                </button>
                {open && (
                  <div>
                    <TablaProductos
                      rows={filasDeCat(c.categoria)}
                      onHistorial={abrirHistorial}
                      vacio={soloConStock ? "Sin productos con stock en esta categoría." : (fullState?.cargando ? "Cargando…" : "Sin productos.")}
                    />
                    {!soloConStock && fullState && !fullState.fin && (
                      <div style={{ padding: 10, textAlign: "center" }}>
                        <button disabled={fullState.cargando}
                          onClick={() => cargarCat(c.categoria, (fullState.rows || []).length)}
                          style={{ padding: "7px 14px", border: `1px solid ${NAVY}`, borderRadius: 8, background: "#fff", color: NAVY, fontWeight: 700, cursor: "pointer", opacity: fullState.cargando ? 0.6 : 1 }}>
                          {fullState.cargando ? "Cargando…" : "Cargar más"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {!cargando && !categorias.length && (
            <div style={{ color: "#94a3b8", fontSize: 13 }}>No hay categorías con stock. Apaga "Solo con stock" para ver el catálogo completo.</div>
          )}
        </div>
      )}

      {modal && <ModalMovimiento onClose={() => setModal(false)} onGuardado={() => { setModal(false); cargar(); }} />}
      {hist && <ModalHistorial hist={hist} onClose={() => setHist(null)} />}
    </div>
  );
}

function Card({ titulo, valor, bg }) {
  return (
    <div style={{ background: bg, color: "#fff", borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 11, opacity: 0.85, textTransform: "uppercase", letterSpacing: 0.5 }}>{titulo}</div>
      <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.2 }}>{Number(valor || 0).toLocaleString("es-MX")}</div>
    </div>
  );
}

// ---- Modal: alta de movimiento (entrada / venta / ajuste) ----
function ModalMovimiento({ onClose, onGuardado }) {
  const [sku, setSku] = useState("");
  const [tipo, setTipo] = useState("entrada");
  const [signo, setSigno] = useState("-");     // solo para "ajuste"
  const [cantidad, setCantidad] = useState("");
  const [referencia, setReferencia] = useState("");
  const [notas, setNotas] = useState("");
  const [sug, setSug] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [err, setErr] = useState("");
  const sugRef = useRef();

  useEffect(() => {
    clearTimeout(sugRef.current);
    const term = sku.trim();
    if (term.length < 2) { setSug([]); return; }
    sugRef.current = setTimeout(async () => {
      try {
        const { data } = await supabase
          .from("productos_medicos_v2")
          .select("sku_sinok, nombre")
          .not("sku_sinok", "is", null)
          .or(`sku_sinok.ilike.%${term}%,nombre.ilike.%${term}%`)
          .limit(20);
        const vistos = new Set(); const out = [];
        (data || []).forEach((p) => { if (p.sku_sinok && !vistos.has(p.sku_sinok)) { vistos.add(p.sku_sinok); out.push(p); } });
        setSug(out.slice(0, 8));
      } catch (_) { setSug([]); }
    }, 250);
    return () => clearTimeout(sugRef.current);
  }, [sku]);

  const guardar = async () => {
    setErr("");
    const q = parseInt(cantidad, 10);
    if (!sku.trim()) return setErr("Indica el SKU de Sino-K.");
    if (!Number.isFinite(q) || q === 0) return setErr("Cantidad inválida (entero distinto de 0).");
    const abs = Math.abs(q);
    const signed = tipo === "entrada" ? abs : tipo === "venta" ? -abs : (signo === "-" ? -abs : abs);
    setGuardando(true);
    try {
      const { error } = await supabase.from("inventario_movimientos").insert({
        sku_sinok: sku.trim(), tipo, cantidad: signed,
        referencia: referencia.trim() || null, notas: notas.trim() || null,
      });
      if (error) throw error;
      onGuardado();
    } catch (e) { setErr("No se pudo guardar: " + (e.message || e)); }
    finally { setGuardando(false); }
  };

  return (
    <Overlay onClose={onClose}>
      <h3 style={{ margin: "0 0 12px", color: NAVY, fontWeight: 800 }}>Nuevo movimiento</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ position: "relative" }}>
          <Lbl>SKU Sino-K</Lbl>
          <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Ej. SC1711" style={inp} />
          {sug.length > 0 && (
            <div style={{ position: "absolute", zIndex: 10, background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", maxHeight: 200, overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,.12)" }}>
              {sug.map((p) => (
                <div key={p.sku_sinok} onClick={() => { setSku(p.sku_sinok); setSug([]); }}
                  style={{ padding: "7px 10px", borderBottom: "1px solid #eef1f5", cursor: "pointer", fontSize: 13 }}>
                  <b>{p.sku_sinok}</b> <span style={{ color: "#64748b" }}>— {String(p.nombre || "").slice(0, 40)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <Lbl>Tipo</Lbl>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={inp}>
              <option value="entrada">Entrada (+)</option>
              <option value="venta">Venta (−)</option>
              <option value="ajuste">Ajuste</option>
            </select>
          </div>
          {tipo === "ajuste" && (
            <div style={{ width: 90 }}>
              <Lbl>Signo</Lbl>
              <select value={signo} onChange={(e) => setSigno(e.target.value)} style={inp}>
                <option value="-">Restar −</option>
                <option value="+">Sumar +</option>
              </select>
            </div>
          )}
          <div style={{ width: 110 }}>
            <Lbl>Cantidad</Lbl>
            <input type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="0" style={inp} />
          </div>
        </div>
        <div><Lbl>Referencia</Lbl><input value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder='PI 98MX… / ML #…' style={inp} /></div>
        <div><Lbl>Notas</Lbl><input value={notas} onChange={(e) => setNotas(e.target.value)} style={inp} /></div>
        {err && <div style={{ color: "#b91c1c", fontSize: 12 }}>{err}</div>}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
          <button onClick={onClose} style={{ padding: "9px 14px", border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff", color: "#475569", fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
          <button onClick={guardar} disabled={guardando}
            style={{ padding: "9px 16px", border: "none", borderRadius: 8, background: NAVY, color: "#fff", fontWeight: 700, cursor: "pointer", opacity: guardando ? 0.6 : 1 }}>
            {guardando ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

// ---- Modal: historial de un SKU ----
function ModalHistorial({ hist, onClose }) {
  const { r, rows, cargando } = hist;
  return (
    <Overlay onClose={onClose}>
      <h3 style={{ margin: "0 0 4px", color: NAVY, fontWeight: 800 }}>Historial — {r.sku_sinok}</h3>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>{r.mi_sku} · {String(r.nombre || "").slice(0, 60)} · stock actual <b style={{ color: NAVY }}>{r.stock}</b></div>
      {cargando ? <div style={{ color: "#64748b", fontSize: 13 }}>Cargando…</div> : (
        <div style={{ overflowX: "auto", maxHeight: 340 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f1f5f9", color: "#64748b", fontSize: 11, textTransform: "uppercase" }}>
                <th style={{ padding: "6px 8px", textAlign: "left" }}>Fecha</th>
                <th style={{ padding: "6px 8px", textAlign: "left" }}>Tipo</th>
                <th style={{ padding: "6px 8px", textAlign: "right" }}>Cant.</th>
                <th style={{ padding: "6px 8px", textAlign: "left" }}>Referencia</th>
                <th style={{ padding: "6px 8px", textAlign: "left" }}>Notas</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id} style={{ borderBottom: "1px solid #eef1f5" }}>
                  <td style={{ padding: "6px 8px", whiteSpace: "nowrap" }}>{fmtFecha(m.created_at)}</td>
                  <td style={{ padding: "6px 8px" }}>{m.tipo}</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 800, color: m.cantidad >= 0 ? "#16a34a" : "#dc2626" }}>{m.cantidad >= 0 ? "+" : ""}{m.cantidad}</td>
                  <td style={{ padding: "6px 8px", color: "#475569" }}>{m.referencia || "—"}</td>
                  <td style={{ padding: "6px 8px", color: "#64748b" }}>{m.notas || ""}</td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={5} style={{ padding: 14, color: "#94a3b8" }}>Sin movimientos.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ textAlign: "right", marginTop: 12 }}>
        <button onClick={onClose} style={{ padding: "8px 14px", border: `1px solid ${NAVY}`, borderRadius: 8, background: "#fff", color: NAVY, fontWeight: 700, cursor: "pointer" }}>Cerrar</button>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 14, padding: 18, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.3)" }}>
        {children}
      </div>
    </div>
  );
}

const Lbl = ({ children }) => <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 3, textTransform: "uppercase" }}>{children}</div>;
const inp = { width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 14, boxSizing: "border-box" };
