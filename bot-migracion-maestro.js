// bot-migracion-maestro.js
// ─────────────────────────────────────────────────────────────────
// MIGRACIÓN MAESTRA: TODAS las categorías de SinOK → tu catálogo.
// Lee plan_migracion.json (generado por analizar.js), aplica
// sub-clasificación fina por título, separa veterinarios, y migra todo.
//
// USO:
//   node bot-migracion-maestro.js            ← dry-run → maestro_preview.json
//   node bot-migracion-maestro.js --aplicar  ← ejecuta TODA la migración
//   node bot-migracion-maestro.js --solo SpO2   ← migra solo esa categoría
//
// Requiere: Node 18+, @supabase/supabase-js, "type":"module", plan_migracion.json
//   export SUPABASE_SERVICE_ROLE_KEY="..."
// ─────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// ════════ CONFIG ════════
const FACTOR_PRECIO = 2.0;
const SKU_INICIO = 8500;        // arranca alto para no chocar con ECG (8100-8370)
const BUCKET = "imagenes_productos";
const MAX_IMGS = 6;
// ════════════════════════

const SUPABASE_URL = process.env.SUPABASE_URL ?? "https://bhwaxzvawzijxjsmtbvy.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APLICAR = process.argv.includes("--aplicar");
const soloIdx = process.argv.indexOf("--solo");
const SOLO_CAT = soloIdx !== -1 ? process.argv[soloIdx + 1] : null;

if (!SERVICE_KEY) { console.error('❌ export SUPABASE_SERVICE_ROLE_KEY="..."'); process.exit(1); }
if (!fs.existsSync("plan_migracion.json")) { console.error("❌ Falta plan_migracion.json (corre analizar.js primero)"); process.exit(1); }
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

const MARCAS = ["Philips","Mindray","Datascope","GE","Marquette","Datex Ohmeda","Nihon Kohden","Draeger","Drager","Siemens","Spacelabs","Kontron","Mennen","Schiller","Edan","Fukuda Denshi","Burdick","Mortara","Kenz","Bionet","Colin","Hellige","Biolight","Medtronic","Physio Control","Welch Allyn","Zoll","Comen","Contec","Huntleigh","Mediana","Beneware","Nellcor","Masimo","Nonin","Criticare","BCI","Novametrix","Invivo","CSI","Dolphin","Artema","Palco","Fisher & Paykel","YSI","Oxford Sonicaid","Armstrong"];

const limpiarHtml = (html) =>
  String(html ?? "").replace(/<br\s*\/?>(?=.)/gi, "\n").replace(/<\/(p|div|li|tr|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<")
    .replace(/[ \t]+/g, " ").split("\n").map((l) => l.trim()).filter(Boolean);

const detectarMarca = (t) => MARCAS.find((m) => t.toLowerCase().includes(m.toLowerCase())) ?? null;
const esVeterinario = (t) => /veterinary|animal|\bvet\b|lingual|ear tongue/i.test(t);

// ── Sub-clasificación fina por título dentro de cada categoría ──
function subFina(categoria, subBase, titulo) {
  const t = titulo.toLowerCase();
  // Veterinario primero (cualquier categoría → Veterinary)
  if (esVeterinario(titulo)) return { categoria: "Veterinary", sub: "veterinary_accessories" };

  switch (categoria) {
    case "SpO2":
      if (/adapter|extension/.test(t)) return { categoria, sub: "spo2_adapter_cables" };
      if (/disposable/.test(t)) return { categoria, sub: "spo2_disposable_sensors" };
      return { categoria, sub: "spo2_direct_connect_sensors" };
    case "NIBP":
      if (/hose|tubing/.test(t)) return { categoria, sub: "nibp_hoses" };
      if (/connector|adapter/.test(t) && !/cuff/.test(t)) return { categoria, sub: "nibp_connectors" };
      if (/disposable/.test(t)) return { categoria, sub: "nibp_disposable_cuffs" };
      return { categoria, sub: "nibp_cuffs" };
    case "EKG":
      if (/trunk/.test(t)) return { categoria, sub: "ekg_trunk_cables" };
      if (/leadwire|lead wire/.test(t)) return { categoria, sub: "ekg_leadwires" };
      return { categoria, sub: "ekg_direct_connect_cables" };
    case "IBP":
      if (/transducer|kit/.test(t) && !/adapter/.test(t)) return { categoria, sub: "ibp_disposable_transducers" };
      return { categoria, sub: "ibp_adapter_cables" };
    case "Temperature":
      if (/adapter/.test(t)) return { categoria, sub: "temperature_adapters" };
      if (/disposable/.test(t)) return { categoria, sub: "temperature_disposable_probes" };
      return { categoria, sub: "temperature_reusable_probes" };
    case "Fetal":
      if (/toco/.test(t)) return { categoria, sub: "fetal_toco_transducers" };
      if (/ultrasound|us transducer|us probe|us fetal|\bus\b/.test(t)) return { categoria, sub: "fetal_ultrasound_transducers" };
      if (/repair|marker|event|belt|strap/.test(t)) return { categoria, sub: "fetal_transducers_repair_cables" };
      return { categoria, sub: "fetal_ultrasound_transducers" };
    case "Oxygen Sensors":
      if (/etco2|et co2|capno|sidestream|mainstream|sample line|water trap/.test(t)) return { categoria, sub: "o2_etco2_sensors" };
      return { categoria, sub: "o2_sensors" };
    default:
      return { categoria, sub: subBase };
  }
}

function especificacionesDe(titulo, lineas, tags, categoria) {
  const specs = new Map([["Category", categoria]]);
  const leads = titulo.match(/(\d+)\s*lead/i);
  if (leads) specs.set("Lead Number", leads[1]);
  const con = titulo.match(/pinch\/?grabber|snap|needle|banana|clip/i);
  if (con) { const c = con[0].toLowerCase(); specs.set("Connector Proximal", c.includes("pinch") ? "Pinch/Grabber" : c[0].toUpperCase() + c.slice(1)); }
  if (/\bAHA\b/i.test(titulo)) specs.set("Standard", "AHA");
  if (/\bIEC\b/i.test(titulo)) specs.set("Standard", "IEC");
  const marca = detectarMarca(titulo); if (marca) specs.set("Brand", marca);
  for (const tag of tags) {
    const tg = tag.trim();
    if (/^(adult|pediatric|neonate|infant|veterinary|adult\/pediatric)$/i.test(tg)) specs.set("Patient Size", tg);
    if (/^(snap|pinch\/grabber|needle|banana)$/i.test(tg) && !specs.has("Connector Proximal")) specs.set("Connector Proximal", tg);
  }
  for (const linea of lineas) {
    const m = linea.match(/^([A-Z][A-Za-z0-9 \/#().+-]{2,40}?)\s*[:：]\s*(.{1,200})$/);
    if (!m) continue;
    const key = m[1].trim(), value = m[2].trim();
    if (/compatib|oem part|specification|description|feature/i.test(key)) continue;
    if (!specs.has(key) && value) specs.set(key, value);
  }
  return [...specs.entries()].map(([key, value]) => ({ key, value }));
}

const unescapeHtml = (s) => String(s ?? "")
  .replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<")
  .replace(/&nbsp;/g, " ").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const limpiarCelda = (s) => unescapeHtml(String(s ?? "").replace(/<[^>]+>/g, "")).replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

// Parser que maneja los 3 formatos de SinOK: tabla compatibility, tabla OEM, texto plano.
function parseCompatOem(html) {
  const compat = [], oem = [];
  for (const tm of html.matchAll(/<table[^>]*>(.*?)<\/table>/gis)) {
    const filas = [...tm[1].matchAll(/<tr[^>]*>(.*?)<\/tr>/gis)].map((m) => m[1]);
    const esOem = filas[0] && /oem part/i.test(limpiarCelda(filas[0]));
    for (const tr of filas) {
      const th = tr.match(/<th[^>]*>(.*?)<\/th>/is);
      const td = tr.match(/<td[^>]*>(.*?)<\/td>/is);
      if (th && td) {
        const fab = limpiarCelda(th[1]), val = limpiarCelda(td[1]);
        if (!fab || !val || /oem part/i.test(fab)) continue;
        if (esOem) oem.push({ "OEM Part #": val, Manufacturer: fab });
        else compat.push({ Manufacturer: fab, Model: val });
      }
    }
  }
  if (compat.length === 0) {
    const txt = limpiarCelda(html);
    const m = txt.match(/Compatibility:\s*(.+?)(?:Accuracy:|Certifications:|Specifications:|OEM Part|Spo2 Range|$)/i);
    if (m) { const mod = m[1].trim().replace(/\.$/, "").trim(); if (mod.length > 3) compat.push({ Manufacturer: "", Model: mod.slice(0, 300) }); }
  }
  if (oem.length === 0) {
    const txt = limpiarCelda(html);
    const m = txt.match(/OEM Part[:\s#]*(.+?)(?:Category|Compatibility:|Certifications:|Accuracy:|$)/i);
    if (m) for (const pt of m[1].split(/[,;/]/).map((x) => x.trim()).filter((x) => x.length > 1).slice(0, 8)) oem.push({ "OEM Part #": pt, Manufacturer: "" });
  }
  return { compat, oem };
}

async function subirImagenes(handle, urls, carpeta) {
  const publicas = [];
  for (let i = 0; i < urls.length; i++) {
    try {
      const res = await fetch(urls[i]); if (!res.ok) continue;
      const buffer = Buffer.from(await res.arrayBuffer());
      const ext = (urls[i].split("?")[0].match(/\.(jpe?g|png|webp)$/i)?.[1] ?? "jpg").toLowerCase();
      const ruta = `${carpeta}/${handle}_img${i + 1}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(ruta, buffer, { contentType: `image/${ext === "jpg" ? "jpeg" : ext}`, upsert: true });
      if (error) continue;
      publicas.push(supabase.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl);
      await dormir(100);
    } catch { /* siguiente */ }
  }
  return publicas;
}

(async () => {
  let plan = JSON.parse(fs.readFileSync("plan_migracion.json", "utf8"));
  if (SOLO_CAT) plan = plan.filter((p) => p.categoria === SOLO_CAT);
  console.log(`📋 Plan: ${plan.length} productos${SOLO_CAT ? ` (solo ${SOLO_CAT})` : ""}`);

  console.log("⚙️  Procesando productos del plan (sin descargas extra)...");
  const filas = [];
  let consecutivo = SKU_INICIO, idx = 0;
  for (const item of plan) {
    idx++;
    if (idx % 200 === 0) console.log(`   ${idx}/${plan.length}...`);
    const p = item; // el plan ya trae body_html, variants, images, tags

    const lineas = limpiarHtml(p.body_html);
    const tags = typeof p.tags === "string" ? p.tags.split(",") : (p.tags ?? []);
    const marca = detectarMarca(p.title);
    const clas = subFina(item.categoria, item.sub, p.title);
    const carpeta = "sinok-" + clas.categoria.toLowerCase().replace(/[^a-z0-9]/g, "");
    const { compat, oem } = parseCompatOem(p.body_html ?? "");
    const base = {
      nombre: p.title,
      categoria: clas.categoria,
      subcategoria: clas.sub,
      descripcion: lineas.filter((l) => !/[:：]/.test(l)).join(" ").slice(0, 400) || p.title,
      url: `https://www.sinokmed.com/products/${item.handle}`,
      especificaciones: especificacionesDe(p.title, lineas, tags, clas.categoria),
      compatibility: compat.length ? compat : (marca ? [{ Manufacturer: marca, Model: "" }] : []),
      oemcross: oem,
      tiene_proveedor: true, disponible: true, es_nuevo: true,
      _handle: item.handle, _carpeta: carpeta,
      _imagenes: (p.images ?? []).slice(0, MAX_IMGS),
    };
    for (const v of p.variants ?? []) {
      const costo = parseFloat(v.price) || 0;
      if (costo <= 0) continue;
      const venta = Math.round(costo * FACTOR_PRECIO) - 0.03;
      filas.push({ ...base, mi_sku: `MED-${consecutivo++}`, tipo: v.title === "Default Title" ? null : v.title, sku_sinok: v.sku || null, precio_sinok: costo, precio: venta, precio_venta_sugerido: venta });
    }
  }

  // Resumen
  const dist = {};
  filas.forEach((f) => { dist[f.categoria] = dist[f.categoria] || {}; dist[f.categoria][f.subcategoria] = (dist[f.categoria][f.subcategoria] || 0) + 1; });
  console.log(`\n📊 ${filas.length} filas, SKUs MED-${SKU_INICIO}–MED-${SKU_INICIO + filas.length - 1}`);
  for (const [cat, subs] of Object.entries(dist)) {
    console.log(`━━ ${cat} (${Object.values(subs).reduce((a,b)=>a+b,0)})`);
    for (const [s, n] of Object.entries(subs)) console.log(`     ${s}: ${n}`);
  }
  const pv = filas.map((f) => f.precio);
  console.log(`── Precios: $${Math.min(...pv)}–$${Math.max(...pv)} · Sin img: ${filas.filter((f)=>!f._imagenes.length).length}`);

  fs.writeFileSync("maestro_preview.json", JSON.stringify(filas, null, 2));
  console.log("📝 Preview en maestro_preview.json");

  if (!APLICAR) { console.log("\n🔍 DRY-RUN. Aplica con: node bot-migracion-maestro.js --aplicar"); return; }

  // Apagar viejos de las categorías que tocamos (excepto ECG ya migrado)
  const categorias = [...new Set(filas.map((f) => f.categoria))];
  console.log(`\n🌒 Apagando productos viejos de: ${categorias.join(", ")}...`);
  for (const cat of categorias) {
    const { error } = await supabase.from("productos_medicos_v2")
      .update({ disponible: false, tiene_proveedor: false })
      .eq("categoria", cat).lt("mi_sku", `MED-${SKU_INICIO}`);
    if (error) console.warn(`   ⚠ ${cat}: ${error.message}`);
  }

  console.log("🖼  Subiendo imágenes e insertando...\n");
  const grupos = new Map();
  filas.forEach((f) => { if (!grupos.has(f._handle)) grupos.set(f._handle, []); grupos.get(f._handle).push(f); });
  let hechos = 0, fallas = 0;
  for (const [handle, grupo] of grupos) {
    try {
      process.stdout.write(`[${++hechos}/${grupos.size}] ${handle.slice(0, 45)}... `);
      const urls = await subirImagenes(handle, grupo[0]._imagenes, grupo[0]._carpeta);
      const img = { imagen_url: urls[0] ?? null, imagen_url_2: urls[1] ?? null, imagen_url_3: urls[2] ?? null, imagen_url_4: urls[3] ?? null, imagen_url_5: urls[4] ?? null, imagen_url_6: urls[5] ?? null };
      const lote = grupo.map(({ _handle, _imagenes, _carpeta, ...f }) => ({ ...f, ...img }));
      const { error } = await supabase.from("productos_medicos_v2").upsert(lote, { onConflict: "mi_sku" });
      if (error) throw error;
      console.log(`✅ ${lote.length}f ${urls.length}img`);
    } catch (e) { console.log(`❌ ${e.message}`); fallas++; }
  }
  console.log(`\n🏁 Migración maestra: ${grupos.size - fallas}/${grupos.size} OK, ${fallas} fallas.`);
})();