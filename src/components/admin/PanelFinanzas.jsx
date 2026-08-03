// PanelFinanzas.jsx
// Panel de finanzas para el admin de VitalSupply.
// Lee de las vistas seguras v_pnl_resumen y v_gastos_semanal (solo sesión autenticada).
//
// INTEGRACIÓN:
// 1. Ajusta la ruta del import de supabase si tu cliente está en otro lugar.
// 2. Monta <PanelFinanzas /> como una pestaña/ruta DENTRO del panel admin (detrás de login).
//    NO lo pongas en ninguna página pública: estos datos son utilidad, margen y split.

import { useEffect, useState } from "react";
import { supabase } from "../../api/supabase";

const NAVY = "#12305C";
const AZUL = "#4FB0E0";

const mxn = (n) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(Number(n || 0));

function KpiCard({ label, value, sub, highlight }) {
  return (
    <div
      className="rounded-2xl p-4 shadow-sm border"
      style={{
        borderColor: highlight ? AZUL : "#e5e7eb",
        background: highlight ? NAVY : "#ffffff",
      }}
    >
      <p
        className="text-xs font-medium uppercase tracking-wide"
        style={{ color: highlight ? AZUL : "#6b7280" }}
      >
        {label}
      </p>
      <p
        className="mt-1 text-2xl font-bold leading-tight"
        style={{ color: highlight ? "#ffffff" : NAVY }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="mt-0.5 text-xs"
          style={{ color: highlight ? "#c7d2e0" : "#6b7280" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export default function PanelFinanzas() {
  const [pnl, setPnl] = useState(null);
  const [semanal, setSemanal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Formulario para registrar el corte del domingo
  const [form, setForm] = useState({
    fecha_corte: "",
    concepto: "SPO2",
    monto_mxn: "",
    conversaciones: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState(null);

  async function cargar() {
    setLoading(true);
    setError(null);
    const [{ data: p, error: e1 }, { data: s, error: e2 }] = await Promise.all([
      supabase.from("v_pnl_resumen").select("*").single(),
      supabase.from("v_gastos_semanal").select("*").order("fecha_corte", { ascending: false }),
    ]);
    if (e1 || e2) {
      setError("No se pudieron cargar las finanzas. Verifica que hay sesión de admin activa.");
    } else {
      setPnl(p);
      setSemanal(s || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function guardarCorte() {
    if (!form.fecha_corte || form.monto_mxn === "") {
      setMsg("Falta la fecha del domingo o el gasto acumulado.");
      return;
    }
    setGuardando(true);
    setMsg(null);
    const { error: e } = await supabase.from("gastos_operativos").insert({
      fecha_corte: form.fecha_corte,
      categoria: "facebook_ads",
      concepto: form.concepto,
      monto_mxn: Number(form.monto_mxn),
      conversaciones: form.conversaciones === "" ? null : Number(form.conversaciones),
      es_acumulado: true,
    });
    setGuardando(false);
    if (e) {
      setMsg("No se guardó. " + e.message);
    } else {
      setMsg("Corte guardado. Actualizando…");
      setForm({ ...form, monto_mxn: "", conversaciones: "" });
      cargar();
    }
  }

  if (loading) {
    return <div className="p-6 text-center" style={{ color: NAVY }}>Cargando finanzas…</div>;
  }
  if (error) {
    return (
      <div className="p-6">
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
        <button onClick={cargar} className="mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: NAVY }}>
          Reintentar
        </button>
      </div>
    );
  }

  const utilidad = Number(pnl?.utilidad_neta_mxn || 0);
  const margen = Number(pnl?.margen_neto_pct || 0);

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: NAVY }}>Finanzas</h1>
        <button onClick={cargar} className="text-sm font-medium" style={{ color: AZUL }}>
          Actualizar
        </button>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Utilidad neta" value={mxn(utilidad)} sub={`Margen ${margen}%`} highlight />
        <KpiCard label="Por socio" value={mxn(pnl?.utilidad_por_socio_mxn)} sub="Carlos / Ricardo" />
        <KpiCard label="Ingreso" value={mxn(pnl?.ingreso_mxn)} sub={`${pnl?.num_ventas} ventas`} />
        <KpiCard label="Ads" value={mxn(pnl?.gastos_operativos_mxn)} sub="Facebook" />
      </div>

      {/* Desglose de costos */}
      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold" style={{ color: NAVY }}>Desglose</h2>
        <dl className="space-y-1 text-sm">
          <Row k="Ingreso" v={mxn(pnl?.ingreso_mxn)} />
          <Row k="− Costo producto" v={mxn(pnl?.costo_producto_mxn)} />
          <Row k="− Guías" v={mxn(pnl?.guias_mxn)} />
          <Row k="− Ads" v={mxn(pnl?.gastos_operativos_mxn)} />
          <div className="my-1 border-t border-gray-200" />
          <Row k="Utilidad neta" v={mxn(utilidad)} bold />
        </dl>
      </div>

      {/* Rendimiento de anuncios por semana */}
      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold" style={{ color: NAVY }}>Anuncios por semana</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-1 pr-2">Corte</th>
                <th className="py-1 pr-2">Anuncio</th>
                <th className="py-1 pr-2 text-right">Gasto sem.</th>
                <th className="py-1 pr-2 text-right">Conv.</th>
                <th className="py-1 text-right">$/Conv.</th>
              </tr>
            </thead>
            <tbody>
              {semanal.map((r, i) => {
                const g = Number(r.gasto_semana_mxn || 0);
                const c = Number(r.conv_semana || 0);
                const cac = c > 0 ? g / c : null;
                return (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="py-1.5 pr-2">{r.fecha_corte}</td>
                    <td className="py-1.5 pr-2 font-medium" style={{ color: NAVY }}>{r.concepto}</td>
                    <td className="py-1.5 pr-2 text-right">{mxn(g)}</td>
                    <td className="py-1.5 pr-2 text-right">{c}</td>
                    <td className="py-1.5 text-right">{cac ? mxn(cac) : "—"}</td>
                  </tr>
                );
              })}
              {semanal.length === 0 && (
                <tr><td colSpan={5} className="py-3 text-center text-gray-400">Aún no hay cortes cargados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registrar corte del domingo */}
      <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: AZUL, background: "#f4faff" }}>
        <h2 className="mb-1 text-sm font-semibold" style={{ color: NAVY }}>Corte del domingo</h2>
        <p className="mb-3 text-xs text-gray-500">
          Pega el gasto <b>acumulado</b> y las conversaciones tal cual las ves en Facebook. El sistema calcula la resta.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-gray-600">
            Fecha (domingo)
            <input type="date" value={form.fecha_corte}
              onChange={(e) => setForm({ ...form, fecha_corte: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm" />
          </label>
          <label className="text-xs text-gray-600">
            Anuncio
            <input type="text" value={form.concepto}
              onChange={(e) => setForm({ ...form, concepto: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm" />
          </label>
          <label className="text-xs text-gray-600">
            Gasto acumulado (MXN)
            <input type="number" inputMode="decimal" value={form.monto_mxn}
              onChange={(e) => setForm({ ...form, monto_mxn: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm" />
          </label>
          <label className="text-xs text-gray-600">
            Conversaciones acum.
            <input type="number" inputMode="numeric" value={form.conversaciones}
              onChange={(e) => setForm({ ...form, conversaciones: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm" />
          </label>
        </div>
        <button onClick={guardarCorte} disabled={guardando}
          className="mt-3 w-full rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: NAVY }}>
          {guardando ? "Guardando…" : "Guardar corte"}
        </button>
        {msg && <p className="mt-2 text-xs" style={{ color: NAVY }}>{msg}</p>}
      </div>

      <p className="mt-4 text-center text-[11px] text-gray-400">
        Tipo de cambio fijo en 18 MXN/USD. Si cambia, avísale a tu equipo para sincronizar la vista.
      </p>
    </div>
  );
}

function Row({ k, v, bold }) {
  return (
    <div className="flex items-center justify-between">
      <dt className={bold ? "font-semibold" : "text-gray-600"} style={bold ? { color: NAVY } : {}}>{k}</dt>
      <dd className={bold ? "font-bold" : ""} style={bold ? { color: NAVY } : {}}>{v}</dd>
    </div>
  );
}
