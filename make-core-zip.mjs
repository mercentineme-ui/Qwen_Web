#!/usr/bin/env node
/* ============================================================
   make-core-zip.mjs
   Packages the staged Core_Disciplines/ archive into
   Core_Disciplines-CORE-RADIAL-V1-APPROVED.zip — byte-for-byte,
   zero dependencies (Node built-ins only).

   Run once from the workspace root:
       node make-core-zip.mjs

   It walks Core_Disciplines/, writes a valid ZIP (deflate),
   then re-reads the ZIP's central directory and verifies all
   16 expected entries are present. Exits non-zero on mismatch.

   This script only READS Core_Disciplines/ — it never modifies it.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const ROOT = "Core_Disciplines";
const OUT = "Core_Disciplines-CORE-RADIAL-V1-APPROVED.zip";

/* ---------- collect files (deterministic order) ---------- */
function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir).sort()) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (st.isFile()) out.push(p);
  }
  return out;
}
const files = walk(ROOT).sort();

/* ---------- CRC32 (standard table) ---------- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

/* ---------- DOS date/time for ZIP headers ---------- */
const now = new Date();
const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
const dosDate = (((now.getFullYear() - 1980) & 0x7f) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

/* ---------- build ZIP ---------- */
const chunks = [];
const central = [];
let offset = 0;

for (const rel of files) {
  const name = rel.split(path.sep).join("/"); // forward slashes in ZIP
  const data = fs.readFileSync(rel);
  const crc = crc32(data);
  const comp = zlib.deflateRawSync(data, { level: 9 });
  const nameBuf = Buffer.from(name, "utf8");

  // local file header
  const lh = Buffer.alloc(30);
  lh.writeUInt32LE(0x04034b50, 0);
  lh.writeUInt16LE(20, 4);            // version needed
  lh.writeUInt16LE(0, 6);             // flags
  lh.writeUInt16LE(8, 8);             // method: deflate
  lh.writeUInt16LE(dosTime, 10);
  lh.writeUInt16LE(dosDate, 12);
  lh.writeUInt32LE(crc, 14);
  lh.writeUInt32LE(comp.length, 18);
  lh.writeUInt32LE(data.length, 22);
  lh.writeUInt16LE(nameBuf.length, 26);
  lh.writeUInt16LE(0, 28);            // extra len

  chunks.push(lh, nameBuf, comp);

  // central directory entry
  const ch = Buffer.alloc(46);
  ch.writeUInt32LE(0x02014b50, 0);
  ch.writeUInt16LE(20, 4);            // version made by
  ch.writeUInt16LE(20, 6);
  ch.writeUInt16LE(0, 8);
  ch.writeUInt16LE(8, 10);
  ch.writeUInt16LE(dosTime, 12);
  ch.writeUInt16LE(dosDate, 14);
  ch.writeUInt32LE(crc, 16);
  ch.writeUInt32LE(comp.length, 20);
  ch.writeUInt32LE(data.length, 24);
  ch.writeUInt16LE(nameBuf.length, 28);
  ch.writeUInt16LE(0, 30);
  ch.writeUInt16LE(0, 32);            // comment len
  ch.writeUInt16LE(0, 34);            // disk start
  ch.writeUInt16LE(0, 36);            // internal attrs
  ch.writeUInt32LE(0, 38);            // external attrs
  ch.writeUInt32LE(offset, 42);       // local header offset
  central.push(Buffer.concat([ch, nameBuf]));

  offset += lh.length + nameBuf.length + comp.length;
}

const cdBuf = Buffer.concat(central);
const eocd = Buffer.alloc(22);
eocd.writeUInt32LE(0x06054b50, 0);
eocd.writeUInt16LE(0, 4);
eocd.writeUInt16LE(0, 6);
eocd.writeUInt16LE(files.length, 8);
eocd.writeUInt16LE(files.length, 10);
eocd.writeUInt32LE(cdBuf.length, 12);
eocd.writeUInt32LE(offset, 16);
eocd.writeUInt16LE(0, 20);

fs.writeFileSync(OUT, Buffer.concat([...chunks, cdBuf, eocd]));

/* ---------- verify: re-read the ZIP central directory ---------- */
const zip = fs.readFileSync(OUT);
// locate EOCD (scan from the end; no comment, so it's at the tail)
let eocdAt = -1;
for (let i = zip.length - 22; i >= 0; i--) {
  if (zip.readUInt32LE(i) === 0x06054b50) { eocdAt = i; break; }
}
if (eocdAt < 0) { console.error("VERIFY FAILED: EOCD not found"); process.exit(1); }
const count = zip.readUInt16LE(eocdAt + 10);
const cdOff = zip.readUInt32LE(eocdAt + 16);

const entries = [];
let p = cdOff;
for (let i = 0; i < count; i++) {
  if (zip.readUInt32LE(p) !== 0x02014b50) { console.error("VERIFY FAILED: bad central header"); process.exit(1); }
  const nLen = zip.readUInt16LE(p + 28);
  const xLen = zip.readUInt16LE(p + 30);
  const cLen = zip.readUInt16LE(p + 32);
  entries.push(zip.toString("utf8", p + 46, p + 46 + nLen));
  p += 46 + nLen + xLen + cLen;
}

console.log(`ZIP written: ${OUT} (${(zip.length / 1024).toFixed(1)} KB)`);
console.log(`Entries (${entries.length}):`);
entries.forEach((e) => console.log("  " + e));

const expected = files.map((f) => f.split(path.sep).join("/"));
const missing = expected.filter((e) => !entries.includes(e));
const extra = entries.filter((e) => !expected.includes(e));
if (missing.length || extra.length || entries.length !== 16) {
  console.error("VERIFY FAILED");
  if (missing.length) console.error("  missing: " + missing.join(", "));
  if (extra.length) console.error("  unexpected: " + extra.join(", "));
  process.exit(1);
}
console.log(`\nVERIFY PASS — all ${entries.length} files present, byte-for-byte from Core_Disciplines/`);
