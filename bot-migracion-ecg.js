// bot-migracion-ecg.js  (VERSIÓN FINAL)
// ─────────────────────────────────────────────────────────────────
// MIGRACIÓN COMPLETA DE LA CATEGORÍA ECG (monitoreo) DESDE SINOK
//
// Decisiones aplicadas:
//   • Jala 4 colecciones de SinOK y DEDUPLICA por handle (~269 únicos).
//   • Subcategoría = colección de ORIGEN (dato duro), no adivinada por título.
//   • NO agrupa: cada producto SinOK = su propia página. Si SinOK trae
//     variantes reales (variants[]), esas sí se vuelven variantes de esa página.
//   • Precio venta = costo SinOK × FACTOR_PRECIO (2.0).
//   • SKUs nuevos desde MED-8100. ECG viejos se APAGAN (no se borran).
//
// USO:
//   node bot-migracion-ecg.js            ← dry-run → ecg_preview.json + resumen
//   node bot-migracion-ecg.js --aplicar  ← ejecuta la migración
//
// Requiere: Node 18+, @supabase/supabase-js, "type":"module"
//   export SUPABASE_SERVICE_ROLE_KEY="..."
// ─────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// ════════ CONFIG ════════
const FACTOR_PRECIO = 2.0;
const SKU_INICIO = 8100;
const CATEGORIA = "ECG";
const BUCKET = "imagenes_productos";
const CARPETA = "sinok-ecg";
const MAX_IMGS = 6;
const COLECCIONES = ["ecg-cables", "ecg-leadwires", "ecg-holter-leadwires", "ecg-accessories"];
// ════════════════════════

const SUPABASE_URL = process.env.SUPABASE_URL ?? "https://bhwaxzvawzijxjsmtbvy.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APLICAR = process.argv.includes("--aplicar");
if (!SERVICE_KEY) { console.error('❌ export SUPABASE_SERVICE_ROLE_KEY="..."'); process.exit(1); }
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

const HOLTER = new Set(["compatible-2104817-001-ge-seer-1000-holter-ecg-cable-aha-standard","compatible-beneware-holter-recorder-ecg-cable-7-leads-aha-iec-snap-connector","compatible-edan-bi9800-bi9000-holter-ecg-10-leadwires-snap-connector","compatible-edan-se-2003-se-2012-ecg-holter-10-leadwire-cable","compatible-edan-se-2003-se-2012-holter-ecg-cable-compatible-7leads-snap-connector","compatible-ge-seer-light-16p-2008594-004-holter-ecg-cable-7leads","compatible-medilog-ar-ecg-cable-holter-recorder-16-pin-5-lead-aha-snap","compatible-mortara-quinton-h12-holter-cable-telemetry-leadwire-10-leads-snap-connector","compatible-philips-ecg-5-leadwires-iec-european-standard-m4725a-zymed-digitrak-plus-snap-connector","compatible-philips-ecg-5-leadwires-m4725a-zymed-digitrak-plus-aha-snap-connector"]);
const ACCESS = new Set(["compatible-aami-ecg-5-lead-wire-iec-european-standard-ll-style-pinch-grabber-connector","compatible-aami-ecg-5-lead-wire-iec-european-standard-snap-connector","compatible-draeger-siemens-ecg-5-lead-wires-iec-european-standard-pinch-grabber-connector","compatible-draeger-siemens-ecg-5-leadwires-5956490-aha-snap","compatible-ecg-ekg-disposable-adhesive-button-electrode-infant-size-1-3-inch-set-of-50","compatible-ecg-ekg-disposable-adhesive-button-electrode-pediatric-size-1-7-inch-50-pack","compatible-ecg-ekg-electrodes-limb-clamp-both-4-0-and-3-0mm-nickel-adult-size-set-of-4","compatible-ecg-ekg-electrodes-limb-clamp-both-4-0-and-3-0mm-nickel-adult-size-set-of-5","compatible-fukuda-denshi-ecg-5-leadwires-aha-pinch","compatible-ge-datex-ohmeda-ecg-trunk-cable-545303-545308-5-lead-to-10-pin-connector-aha","compatible-huntleigh-healthcare-ecg-cable-3-leadwires-8pins-connector-aha-pinch-grabber","compatible-mennen-ecg-cable-5-leadwires-aha-10-pins-snap-connector","compatible-mennen-ecg-cable-5-leadwires-aha-pinch-connector","compatible-philips-ecg-trunk-cable-m1510a-3-lead-to-12pin-connector-iec","compatible-prewired-neonatal-pediatric-ecg-electrode","compatible-spacelabs-ecg-cable-5-leadwires-iec-17-pin-pinch-grabber-connector","competible-mediana-ecg-cable-3-leadswires-8-pins-aha-connector","competible-mediana-ecg-cable-3-leadswires-aha-pinch-grabber-connector","competible-mediana-ecg-cable-3-leadswires-iec-european-standrad-snap-8-pins-connector","competible-mediana-ecg-cable-3-leadswires-iec-european-standrad-snap-connector-8-pins","eeg-cable-10-leadwires-golden-plated-cup-electrodes","ekg-banana-to-snap-adapters-4-0mm-colorful-package-of-10","mindray-ecg-trunk-cable-0010-30-12378-0010-30-12242-aha-3-lead-to-6-pin-connector","tens-unit-electrode-pads-adult-size-2-2-x-2-2-inch-50-pack-fda-ce-approved","universal-compatible-ecg-ekg-veterinary-electrode-clip-reusable-alligator-clip-adapters-for-snap-pinch-needle-banana-package-of-5","universal-ecg-ekg-electrode-clip-reusable-all-vet-sizes-ecg-alligator-clip-adapters-for-snap-pinch-package-of-5","universal-ecg-ekg-suction-electrode-ball-pediatric-nickel-3mm-4mm-set-of-6","veterinary-ecg-cable-3-lead-with-clip-for-contec-patient-monitor-cms6000-vet-use","veterinary-ecg-cable-5-lead-with-clip-for-contec-patient-monitor-cms6000-vet-use-aha"]);
const LEADWIRES = new Set();

const MARCAS = ["Philips","Mindray","Datascope","GE","Marquette","Datex Ohmeda","Nihon Kohden","Draeger","Drager","Siemens","Spacelabs","Kontron","Mennen","Schiller","Edan","Fukuda Denshi","Burdick","Mortara","Kenz","Bionet","Colin","Hellige","Biolight","Medtronic","Physio Control","Welch Allyn","Zoll","Comen","Contec","Huntleigh","Mediana","Beneware","AAMI"];

const limpiarHtml = (html) =>
  String(html ?? "").replace(/<br\s*\/?>(?=.)/gi, "\n").replace(/<\/(p|div|li|tr|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<")
    .replace(/[ \t]+/g, " ").split("\n").map((l) => l.trim()).filter(Boolean);

const detectarMarca = (t) => MARCAS.find((m) => t.toLowerCase().includes(m.toLowerCase())) ?? null;

function subcategoriaDe(handle, titulo) {
  if (HOLTER.has(handle)) return "ecg_disposable_leadwires";
  if (ACCESS.has(handle)) return "ecg_accessories";
  const t = (handle + " " + titulo).toLowerCase();
  if (t.includes("telemetry")) return "ecg_telemetry_leadwires";
  if (t.includes("trunk")) return "ecg_trunk_cables";
  if (LEADWIRES.has(handle)) return "ecg_leadwires";
  return "ecg_direct_connect_cables";
}

function especificacionesDe(titulo, lineas, tags) {
  const specs = new Map([["Category", "ECG"]]);
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

function compatibilidadDe(lineas, marca) {
  const idx = lineas.findIndex((l) => /^compatib/i.test(l) || /compatibility\s*[:：]/i.test(l));
  if (idx === -1) return marca ? [{ Model: "", Manufacturer: marca }] : [];
  let texto = lineas[idx].replace(/^.*?compatib\w*\s*[:：]?\s*/i, "");
  for (let i = idx + 1; i < Math.min(idx + 4, lineas.length); i++) {
    if (/^[A-Z][a-z]+ ?\w*\s*[:：]/.test(lineas[i])) break;
    texto += (texto ? ", " : "") + lineas[i];
  }
  texto = texto.replace(/\s+/g, " ").trim();
  return texto ? [{ Model: texto, Manufacturer: marca ?? "" }] : [];
}

function oemDe(titulo, lineas, marca) {
  const partes = new Set();
  for (const m of titulo.matchAll(/\b([A-Z]{0,3}\d[\dA-Z]{3,}(?:-[\dA-Z]+)*)\b/g)) partes.add(m[1]);
  const lo = lineas.find((l) => /oem part/i.test(l));
  if (lo) lo.replace(/^.*?oem part\s*#?\s*[:：]?\s*/i, "").split(/[,;\/]/).forEach((p) => p.trim() && partes.add(p.trim()));
  return [...partes].slice(0, 8).map((p) => ({ "OEM Part #": p, Manufacturer: marca ?? "" }));
}

async function descargarColeccion(col) {
  const productos = [];
  let pagina = 1;
  while (true) {
    const res = await fetch(`https://www.sinokmed.com/collections/${col}/products.json?limit=250&page=${pagina}`, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) break;
    const { products } = await res.json();
    if (!products?.length) break;
    productos.push(...products);
    pagina++;
    await dormir(500);
  }
  return productos;
}

async function subirImagenes(handle, urls) {
  const publicas = [];
  for (let i = 0; i < urls.length; i++) {
    try {
      const res = await fetch(urls[i]); if (!res.ok) continue;
      const buffer = Buffer.from(await res.arrayBuffer());
      const ext = (urls[i].split("?")[0].match(/\.(jpe?g|png|webp)$/i)?.[1] ?? "jpg").toLowerCase();
      const ruta = `${CARPETA}/${handle}_img${i + 1}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(ruta, buffer, { contentType: `image/${ext === "jpg" ? "jpeg" : ext}`, upsert: true });
      if (error) continue;
      publicas.push(supabase.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl);
      await dormir(120);
    } catch { /* siguiente */ }
  }
  return publicas;
}

(async () => {
  console.log("📥 Descargando colecciones de SinOK...");
  const porHandle = new Map();
  for (const col of COLECCIONES) {
    const prods = await descargarColeccion(col);
    console.log(`   ${col}: ${prods.length}`);
    for (const p of prods) {
      if (col === "ecg-leadwires") LEADWIRES.add(p.handle);
      if (!porHandle.has(p.handle)) porHandle.set(p.handle, p);
    }
  }
  console.log(`\n✅ Productos únicos tras deduplicar: ${porHandle.size}`);

  const filas = [];
  let consecutivo = SKU_INICIO;
  for (const [handle, p] of porHandle) {
    const lineas = limpiarHtml(p.body_html);
    const tags = typeof p.tags === "string" ? p.tags.split(",") : (p.tags ?? []);
    const marca = detectarMarca(p.title);
    const base = {
      nombre: p.title,
      categoria: CATEGORIA,
      subcategoria: subcategoriaDe(handle, p.title),
      descripcion: lineas.filter((l) => !/[:：]/.test(l)).join(" ").slice(0, 400) || p.title,
      url: `https://www.sinokmed.com/products/${handle}`,
      especificaciones: especificacionesDe(p.title, lineas, tags),
      compatibility: compatibilidadDe(lineas, marca),
      oemcross: oemDe(p.title, lineas, marca),
      tiene_proveedor: true, disponible: true, es_nuevo: true,
      _handle: handle,
      _imagenes: (p.images ?? []).map((i) => i.src).slice(0, MAX_IMGS),
    };
    for (const v of p.variants ?? []) {
      const costo = parseFloat(v.price) || 0;
      if (costo <= 0) continue;
      const venta = Math.round(costo * FACTOR_PRECIO) - 0.03;
      filas.push({
        ...base,
        mi_sku: `MED-${consecutivo++}`,
        tipo: v.title === "Default Title" ? null : v.title,
        sku_sinok: v.sku || null,
        precio_sinok: costo, precio: venta, precio_venta_sugerido: venta,
      });
    }
  }

  const cnt = (key) => { const c = {}; filas.forEach((f) => (c[f[key]] = (c[f[key]] ?? 0) + 1)); return c; };
  console.log(`\n📊 ${filas.length} filas (productos+variantes), SKUs MED-${SKU_INICIO}–MED-${SKU_INICIO + filas.length - 1}`);
  console.log("── Por subcategoría ──");
  Object.entries(cnt("subcategoria")).sort((a, b) => b[1] - a[1]).forEach(([s, n]) => console.log(`   ${s}: ${n}`));
  const pv = filas.map((f) => f.precio);
  console.log(`── Precios venta: $${Math.min(...pv)} – $${Math.max(...pv)} (factor ×${FACTOR_PRECIO})`);
  console.log(`── Sin imágenes: ${filas.filter((f) => !f._imagenes.length).length} · Compat vacío: ${filas.filter((f) => !f.compatibility.length).length}`);

  fs.writeFileSync("ecg_preview.json", JSON.stringify(filas, null, 2));
  console.log("\n📝 Preview en ecg_preview.json");

  if (!APLICAR) { console.log("\n🔍 DRY-RUN. Nada modificado. Aplica con: node bot-migracion-ecg.js --aplicar"); return; }

  console.log("\n🌒 Apagando ECG actuales...");
  const { error: e1 } = await supabase.from("productos_medicos_v2")
    .update({ disponible: false, tiene_proveedor: false })
    .eq("categoria", CATEGORIA).lt("mi_sku", `MED-${SKU_INICIO}`);
  if (e1) throw e1;

  console.log("🖼  Subiendo imágenes e insertando...\n");
  const grupos = new Map();
  filas.forEach((f) => { if (!grupos.has(f._handle)) grupos.set(f._handle, []); grupos.get(f._handle).push(f); });
  let hechos = 0, fallas = 0;
  for (const [handle, grupo] of grupos) {
    try {
      process.stdout.write(`[${++hechos}/${grupos.size}] ${handle.slice(0, 50)}... `);
      const urls = await subirImagenes(handle, grupo[0]._imagenes);
      const img = { imagen_url: urls[0] ?? null, imagen_url_2: urls[1] ?? null, imagen_url_3: urls[2] ?? null, imagen_url_4: urls[3] ?? null, imagen_url_5: urls[4] ?? null, imagen_url_6: urls[5] ?? null };
      const lote = grupo.map(({ _handle, _imagenes, ...f }) => ({ ...f, ...img }));
      const { error } = await supabase.from("productos_medicos_v2").upsert(lote, { onConflict: "mi_sku" });
      if (error) throw error;
      console.log(`✅ ${lote.length} fila(s), ${urls.length} imgs`);
    } catch (e) { console.log(`❌ ${e.message}`); fallas++; }
  }
  console.log(`\n🏁 ECG migrado: ${grupos.size - fallas}/${grupos.size} productos OK, ${fallas} fallas.`);
})();