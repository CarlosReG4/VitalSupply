// analizar.js (v2) — descarga TODAS las colecciones SinOK UNA vez,
// deduplica por handle, y guarda el PRODUCTO COMPLETO en plan_migracion.json
// (incluye body_html, variants, images). NO toca la base.

import fs from "fs";

const MAPA = [
  { col: "reusable-spo2-sensors",        categoria: "SpO2", sub: "spo2_direct_connect_sensors" },
  { col: "disposable-spo2-sensors",      categoria: "SpO2", sub: "spo2_disposable_sensors" },
  { col: "spo2-adapter-cables",          categoria: "SpO2", sub: "spo2_adapter_cables" },
  { col: "spo2-cables-and-sensors-sale", categoria: "SpO2", sub: "spo2_direct_connect_sensors" },
  { col: "ekg-cables",                   categoria: "EKG", sub: "ekg_direct_connect_cables" },
  { col: "reusable-nibp-cuffs",          categoria: "NIBP", sub: "nibp_cuffs" },
  { col: "disposable-nibp-cuffs",        categoria: "NIBP", sub: "nibp_disposable_cuffs" },
  { col: "nibp-connectors-hoses",        categoria: "NIBP", sub: "nibp_hoses" },
  { col: "nibp-cuffs",                   categoria: "NIBP", sub: "nibp_cuffs" },
  { col: "etco2-sensors",                categoria: "Oxygen Sensors", sub: "o2_etco2_sensors" },
  { col: "ibp-cables",                   categoria: "IBP", sub: "ibp_adapter_cables" },
  { col: "temperature-probes",           categoria: "Temperature", sub: "temperature_reusable_probes" },
  { col: "fetal-probes",                 categoria: "Fetal", sub: "fetal_ultrasound_transducers" },
  { col: "veterinary-spo2-sensors-and-clips", categoria: "Veterinary", sub: "veterinary_accessories" },
  { col: "medical-accessories",          categoria: "Medical Accessories", sub: "medical_accessories" },
  { col: "esu-accessories-1",            categoria: "ESU", sub: "esu_accessories" },
  { col: "oxygen-sensor",                categoria: "Oxygen Sensors", sub: "o2_sensors" },
];

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function bajar(col) {
  const out = [];
  let pagina = 1;
  while (true) {
    const res = await fetch(`https://www.sinokmed.com/collections/${col}/products.json?limit=250&page=${pagina}`, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) break;
    const { products } = await res.json();
    if (!products?.length) break;
    out.push(...products);
    pagina++;
    await dormir(400);
  }
  return out;
}

(async () => {
  const asignado = new Map(); // handle → { categoria, sub, producto COMPLETO }

  for (const { col, categoria, sub } of MAPA) {
    const prods = await bajar(col);
    let nuevos = 0;
    for (const p of prods) {
      if (!asignado.has(p.handle)) {
        // Guardamos solo lo que el bot necesita (para no inflar el archivo)
        asignado.set(p.handle, {
          handle: p.handle, categoria, sub,
          title: p.title,
          body_html: p.body_html,
          tags: p.tags,
          variants: (p.variants ?? []).map((v) => ({ title: v.title, sku: v.sku, price: v.price })),
          images: (p.images ?? []).map((i) => i.src),
        });
        nuevos++;
      }
    }
    console.log(`${col.padEnd(38)} total:${String(prods.length).padStart(4)}  nuevos:${String(nuevos).padStart(4)}  → ${categoria}`);
  }

  console.log(`\n═══ UNIVERSO ÚNICO: ${asignado.size} productos ═══`);
  const plan = [...asignado.values()];
  fs.writeFileSync("plan_migracion.json", JSON.stringify(plan, null, 2));
  console.log(`📝 plan_migracion.json guardado (con producto completo, listo para el bot maestro)`);
})();