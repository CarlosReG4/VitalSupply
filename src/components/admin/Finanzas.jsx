// src/components/admin/Finanzas.jsx
// Contenedor único de la pestaña "Finanzas" del panel admin.
// Reúne en un solo lugar (con sub-selector) el resumen financiero global
// (P&L + ads) y el análisis de margen por pedido.
import { useState } from "react";
import PanelFinanzas from "./PanelFinanzas";
import AnalisisCostos from "./AnalisisCostos";

const NAVY = "#12305C";
const BLUE = "#4FB0E0";

export default function Finanzas() {
  const [sub, setSub] = useState("resumen"); // 'resumen' | 'pedidos'

  const Tab = ({ id, children }) => {
    const activo = sub === id;
    return (
      <button
        type="button"
        onClick={() => setSub(id)}
        aria-pressed={activo}
        style={{
          flex: "none",
          border: `1px solid ${activo ? NAVY : "#e2e8f0"}`,
          background: activo ? NAVY : "#fff",
          color: activo ? "#fff" : "#475569",
          borderRadius: 999,
          padding: "8px 16px",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </button>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, padding: "14px 16px", borderBottom: `1px solid #e2e8f0`, background: "#fff", flexWrap: "wrap" }}>
        <Tab id="resumen">📊 Resumen financiero</Tab>
        <Tab id="pedidos">🧾 Análisis por pedido</Tab>
      </div>
      {sub === "resumen" ? <PanelFinanzas /> : <AnalisisCostos />}
    </div>
  );
}
