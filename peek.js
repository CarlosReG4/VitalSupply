// peek.js — cuenta el total real de una colección (paginando)
const COL = process.argv[2] || "ecg-leadwires";
let pagina = 1, total = 0;
const handles = new Set();
while (true) {
  const res = await fetch(
    `https://www.sinokmed.com/collections/${COL}/products.json?limit=250&page=${pagina}`,
    { headers: { "User-Agent": "Mozilla/5.0" } }
  );
  const { products } = await res.json();
  if (!products?.length) break;
  products.forEach((p) => handles.add(p.handle));
  total += products.length;
  pagina++;
  await new Promise((r) => setTimeout(r, 400));
}
console.log(`${COL}: ${total} productos`);
// imprime los handles para análisis de traslape
import fs from "fs";
fs.writeFileSync(`handles_${COL}.txt`, [...handles].join("\n"));
console.log(`  → handles guardados en handles_${COL}.txt`);