// ─── Metadata (EXIF/GPS) reader + lossless stripper ────────────────────────────
//
// Zero-dep, in the same spirit as decode.ts's hand-rolled format parsers.
// Supports the two formats that actually carry EXIF/GPS in practice: JPEG
// (APP1 "Exif" segment) and PNG (eXIf chunk, plus tEXt/iTXt/tIME). WebP/HEIC
// are out of scope for the same reason they're out of scope in decode.ts —
// not worth a bespoke container parser for this MVP.

export interface MetadataTag {
  label: string;
  value: string;
}

export interface MetadataGroup {
  label: string;
  tags: MetadataTag[];
}

export interface GpsCoords {
  lat: number;
  lon: number;
}

export interface MetadataResult {
  format: "jpeg" | "png" | "unsupported";
  groups: MetadataGroup[];
  gps: GpsCoords | null;
}

// ─── Format sniffing ────────────────────────────────────────────────────────

function isJpeg(bytes: Uint8Array): boolean {
  return bytes.length > 2 && bytes[0] === 0xff && bytes[1] === 0xd8;
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
function isPng(bytes: Uint8Array): boolean {
  return bytes.length > 8 && PNG_SIGNATURE.every((b, i) => bytes[i] === b);
}

// ─── TIFF/IFD parsing (shared by JPEG's APP1 payload and PNG's eXIf chunk) ──

type TagValue = number | number[] | string;

const TYPE_SIZES: Record<number, number> = {
  1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8,
};

function readTagValue(
  view: DataView,
  little: boolean,
  type: number,
  count: number,
  entryValuePos: number,
  tiffStart: number
): TagValue {
  const size = (TYPE_SIZES[type] ?? 1) * count;
  const pos = size <= 4 ? entryValuePos : tiffStart + view.getUint32(entryValuePos, little);

  if (type === 2) {
    // ASCII, NUL-terminated
    let s = "";
    for (let i = 0; i < count - 1; i++) {
      const c = view.getUint8(pos + i);
      if (c === 0) break;
      s += String.fromCharCode(c);
    }
    return s;
  }

  if (type === 5 || type === 10) {
    // RATIONAL / SRATIONAL — numerator/denominator pair per value
    const vals: number[] = [];
    for (let i = 0; i < count; i++) {
      const num = type === 5 ? view.getUint32(pos + i * 8, little) : view.getInt32(pos + i * 8, little);
      const den = type === 5 ? view.getUint32(pos + i * 8 + 4, little) : view.getInt32(pos + i * 8 + 4, little);
      vals.push(den === 0 ? 0 : num / den);
    }
    return count === 1 ? vals[0] : vals;
  }

  const vals: number[] = [];
  for (let i = 0; i < count; i++) {
    switch (type) {
      case 1: case 6: vals.push(view.getUint8(pos + i)); break;
      case 3: vals.push(view.getUint16(pos + i * 2, little)); break;
      case 8: vals.push(view.getInt16(pos + i * 2, little)); break;
      case 4: vals.push(view.getUint32(pos + i * 4, little)); break;
      case 9: vals.push(view.getInt32(pos + i * 4, little)); break;
      default: vals.push(0);
    }
  }
  return count === 1 ? vals[0] : vals;
}

function readIFD(view: DataView, ifdOffset: number, tiffStart: number, little: boolean): Map<number, TagValue> {
  const tags = new Map<number, TagValue>();
  const count = view.getUint16(ifdOffset, little);
  for (let i = 0; i < count; i++) {
    const entry = ifdOffset + 2 + i * 12;
    const tag = view.getUint16(entry, little);
    const type = view.getUint16(entry + 2, little);
    const num = view.getUint32(entry + 4, little);
    try {
      tags.set(tag, readTagValue(view, little, type, num, entry + 8, tiffStart));
    } catch {
      // Malformed entry — skip it, keep the rest.
    }
  }
  return tags;
}

interface TiffIFDs {
  ifd0: Map<number, TagValue>;
  exif: Map<number, TagValue> | null;
  gps: Map<number, TagValue> | null;
}

/** Parses a raw TIFF blob (starts at the "II"/"MM" byte-order mark). */
function parseTiff(bytes: Uint8Array): TiffIFDs | null {
  if (bytes.length < 8) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const mark = view.getUint16(0, false);
  if (mark !== 0x4949 && mark !== 0x4d4d) return null;
  const little = mark === 0x4949;
  if (view.getUint16(2, little) !== 0x002a) return null;

  const ifd0Offset = view.getUint32(4, little);
  const ifd0 = readIFD(view, ifd0Offset, 0, little);

  let exif: Map<number, TagValue> | null = null;
  const exifPtr = ifd0.get(0x8769);
  if (typeof exifPtr === "number") {
    try { exif = readIFD(view, exifPtr, 0, little); } catch { /* ignore */ }
  }

  let gps: Map<number, TagValue> | null = null;
  const gpsPtr = ifd0.get(0x8825);
  if (typeof gpsPtr === "number") {
    try { gps = readIFD(view, gpsPtr, 0, little); } catch { /* ignore */ }
  }

  return { ifd0, exif, gps };
}

/** A minimal, spec-valid TIFF blob carrying nothing but IFD0's Orientation tag. */
function buildOrientationTiff(orientation: number): Uint8Array {
  const tiff = new Uint8Array(26);
  const view = new DataView(tiff.buffer);
  tiff[0] = 0x49; tiff[1] = 0x49; // "II"
  view.setUint16(2, 0x002a, true);
  view.setUint32(4, 8, true); // IFD0 at offset 8
  view.setUint16(8, 1, true); // 1 entry
  view.setUint16(10, 0x0112, true); // Orientation
  view.setUint16(12, 3, true); // SHORT
  view.setUint32(14, 1, true); // count 1
  view.setUint16(18, orientation, true); // inline value
  view.setUint32(22, 0, true); // next IFD = 0
  return tiff;
}

function readOrientation(exifPayloadAfterSig: Uint8Array): number | null {
  const tiff = parseTiff(exifPayloadAfterSig);
  const o = tiff?.ifd0.get(0x0112);
  return typeof o === "number" ? o : null;
}

/** Rebuilds a minimal Exif APP1 segment containing only Orientation. */
function buildExifOrientationSegment(orientation: number): Uint8Array {
  const payload = concatBytes([new Uint8Array(EXIF_SIG), buildOrientationTiff(orientation)]);
  const length = payload.length + 2;
  const header = new Uint8Array([0xff, 0xe1, (length >> 8) & 0xff, length & 0xff]);
  return concatBytes([header, payload]);
}

function gpsToDecimal(dms: TagValue | undefined, ref: TagValue | undefined): number | null {
  if (!Array.isArray(dms) || dms.length < 3) return null;
  const [d, m, s] = dms;
  let dec = d + m / 60 + s / 3600;
  if (ref === "S" || ref === "W") dec = -dec;
  return dec;
}

// ─── Human-readable labels ──────────────────────────────────────────────────

const IFD0_DEVICE: Record<number, string> = {
  0x010f: "Make",
  0x0110: "Model",
  0x0131: "Software",
  0x0112: "Orientation",
};
const IFD0_TIME: Record<number, string> = { 0x0132: "Modified" };
const EXIF_TIME: Record<number, string> = { 0x9003: "Taken" };
const EXIF_CAMERA: Record<number, string> = {
  0x829a: "Exposure",
  0x829d: "Aperture",
  0x8827: "ISO",
  0x920a: "Focal length",
  0xa434: "Lens",
};

const ORIENTATIONS: Record<number, string> = {
  1: "Normal", 2: "Flipped horizontally", 3: "Rotated 180°",
  4: "Flipped vertically", 5: "Rotated 90° CW, flipped", 6: "Rotated 90° CW",
  7: "Rotated 90° CCW, flipped", 8: "Rotated 90° CCW",
};

function formatDate(raw: string): string {
  // EXIF dates are "YYYY:MM:DD HH:MM:SS" — swap the date separators for readability.
  const m = raw.match(/^(\d{4}):(\d{2}):(\d{2})(.*)$/);
  return m ? `${m[1]}-${m[2]}-${m[3]}${m[4]}` : raw;
}

function formatTag(tag: number, value: TagValue): string {
  if (tag === 0x0112 && typeof value === "number") return ORIENTATIONS[value] ?? String(value);
  if ((tag === 0x0132 || tag === 0x9003) && typeof value === "string") return formatDate(value);
  if (tag === 0x829a && typeof value === "number") return value < 1 ? `1/${Math.round(1 / value)}s` : `${value}s`;
  if (tag === 0x829d && typeof value === "number") return `f/${value.toFixed(1)}`;
  if (tag === 0x920a && typeof value === "number") return `${value}mm`;
  if (tag === 0x8827) return String(Array.isArray(value) ? value[0] : value);
  return String(value);
}

function tagsToGroup(label: string, tags: Map<number, TagValue>, dict: Record<number, string>): MetadataGroup {
  const out: MetadataTag[] = [];
  for (const [tag, name] of Object.entries(dict)) {
    const value = tags.get(Number(tag));
    if (value !== undefined && value !== "") out.push({ label: name, value: formatTag(Number(tag), value) });
  }
  return { label, tags: out };
}

function collectFromTiff(tiff: TiffIFDs, groups: MetadataGroup[]): GpsCoords | null {
  const device = tagsToGroup("Device", tiff.ifd0, IFD0_DEVICE);
  if (device.tags.length) groups.push(device);

  const timeTags: MetadataTag[] = [
    ...tagsToGroup("", tiff.ifd0, IFD0_TIME).tags,
    ...(tiff.exif ? tagsToGroup("", tiff.exif, EXIF_TIME).tags : []),
  ];
  if (timeTags.length) groups.push({ label: "Timestamps", tags: timeTags });

  if (tiff.exif) {
    const camera = tagsToGroup("Camera settings", tiff.exif, EXIF_CAMERA);
    if (camera.tags.length) groups.push(camera);
  }

  let gps: GpsCoords | null = null;
  if (tiff.gps) {
    const lat = gpsToDecimal(tiff.gps.get(2), tiff.gps.get(1));
    const lon = gpsToDecimal(tiff.gps.get(4), tiff.gps.get(3));
    if (lat !== null && lon !== null) gps = { lat, lon };
  }
  return gps;
}

// ─── JPEG ───────────────────────────────────────────────────────────────────

const EXIF_SIG = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00]; // "Exif\0\0"

function readJpegMetadata(bytes: Uint8Array): MetadataResult {
  const groups: MetadataGroup[] = [];
  let gps: GpsCoords | null = null;
  let hasXmp = false;
  let hasIptc = false;

  let offset = 2;
  while (offset + 4 <= bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1];
    if (marker === 0xda || marker === 0xd9) break; // SOS / EOI — metadata always precedes these
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { offset += 2; continue; }

    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    const dataStart = offset + 4;

    if (marker === 0xe1 && EXIF_SIG.every((b, i) => bytes[dataStart + i] === b)) {
      try {
        const tiff = parseTiff(bytes.subarray(dataStart + 6, offset + 2 + length));
        if (tiff) gps = collectFromTiff(tiff, groups) ?? gps;
      } catch { /* malformed EXIF block — skip it, not fatal */ }
    } else if (marker === 0xe1) {
      hasXmp = true;
    } else if (marker === 0xed) {
      hasIptc = true;
    }

    offset = offset + 2 + length;
  }

  if (hasXmp || hasIptc) {
    groups.push({
      label: "Other",
      tags: [
        ...(hasXmp ? [{ label: "XMP metadata", value: "Present (not parsed)" }] : []),
        ...(hasIptc ? [{ label: "IPTC/Photoshop metadata", value: "Present (not parsed)" }] : []),
      ],
    });
  }

  return { format: "jpeg", groups: mergeGroups(groups), gps };
}

function stripJpeg(bytes: Uint8Array): Uint8Array {
  const keep: Uint8Array[] = [bytes.subarray(0, 2)]; // SOI
  let offset = 2;

  while (offset + 4 <= bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1];

    if (marker === 0xd9) { keep.push(bytes.subarray(offset, offset + 2)); offset += 2; break; }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      keep.push(bytes.subarray(offset, offset + 2));
      offset += 2;
      continue;
    }

    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    const segEnd = offset + 2 + length;

    if (marker === 0xda) {
      // Start of scan — copy this header, then the rest of the file verbatim
      // (entropy-coded data + trailer). No metadata lives past this point.
      keep.push(bytes.subarray(offset, segEnd));
      keep.push(bytes.subarray(segEnd));
      offset = bytes.length;
      break;
    }

    if (marker === 0xe1 && EXIF_SIG.every((b, i) => bytes[offset + 4 + i] === b)) {
      // Exif APP1 — drop it, but keep Orientation if set: it's a display-correctness
      // flag (which way is "up"), not privacy data, and losing it can leave the
      // downloaded photo rendered sideways in viewers that don't guess orientation.
      let orientation: number | null = null;
      try { orientation = readOrientation(bytes.subarray(offset + 10, segEnd)); } catch { /* malformed — drop entirely */ }
      if (orientation !== null && orientation !== 1) keep.push(buildExifOrientationSegment(orientation));
    } else if (marker === 0xe1 || marker === 0xed) {
      // XMP (APP1 without the Exif signature) or Photoshop/IPTC (APP13) — drop entirely.
    } else {
      keep.push(bytes.subarray(offset, segEnd));
    }
    offset = segEnd;
  }

  if (offset < bytes.length) keep.push(bytes.subarray(offset)); // safety net for truncated/malformed input
  return concatBytes(keep);
}

// ─── PNG ────────────────────────────────────────────────────────────────────

function readUint32BE(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
}

function chunkTypeAt(bytes: Uint8Array, offset: number): string {
  return String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
}

function latin1(bytes: Uint8Array, start: number, end: number): string {
  let s = "";
  for (let i = start; i < end; i++) s += String.fromCharCode(bytes[i]);
  return s;
}

function readPngMetadata(bytes: Uint8Array): MetadataResult {
  const groups: MetadataGroup[] = [];
  const textTags: MetadataTag[] = [];
  let gps: GpsCoords | null = null;
  let hasCompressedText = false;

  let offset = 8;
  while (offset + 8 <= bytes.length) {
    const length = readUint32BE(bytes, offset);
    const type = chunkTypeAt(bytes, offset + 4);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd + 4 > bytes.length) break; // truncated — stop reading, nothing more to trust

    if (type === "tEXt") {
      const nul = bytes.indexOf(0, dataStart);
      if (nul !== -1 && nul < dataEnd) {
        textTags.push({ label: latin1(bytes, dataStart, nul), value: latin1(bytes, nul + 1, dataEnd) });
      }
    } else if (type === "iTXt") {
      const nul1 = bytes.indexOf(0, dataStart);
      if (nul1 !== -1) {
        const keyword = latin1(bytes, dataStart, nul1);
        const compressed = bytes[nul1 + 1] === 1;
        const nul2 = bytes.indexOf(0, nul1 + 3); // skip compression flag + method
        const nul3 = nul2 !== -1 ? bytes.indexOf(0, nul2 + 1) : -1;
        if (compressed) {
          hasCompressedText = true;
        } else if (nul3 !== -1 && nul3 < dataEnd) {
          textTags.push({ label: keyword, value: new TextDecoder().decode(bytes.subarray(nul3 + 1, dataEnd)) });
        }
      }
    } else if (type === "zTXt") {
      hasCompressedText = true;
    } else if (type === "tIME" && length === 7) {
      const year = (bytes[dataStart] << 8) | bytes[dataStart + 1];
      const [month, day, hour, min, sec] = [
        bytes[dataStart + 2], bytes[dataStart + 3], bytes[dataStart + 4], bytes[dataStart + 5], bytes[dataStart + 6],
      ];
      const pad = (n: number) => String(n).padStart(2, "0");
      groups.push({ label: "Timestamps", tags: [{ label: "Modified", value: `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(min)}:${pad(sec)}` }] });
    } else if (type === "eXIf") {
      try {
        const tiff = parseTiff(bytes.subarray(dataStart, dataEnd));
        if (tiff) gps = collectFromTiff(tiff, groups) ?? gps;
      } catch { /* malformed — skip */ }
    } else if (type === "IEND") {
      break;
    }

    offset = dataEnd + 4;
  }

  if (textTags.length) groups.push({ label: "Text metadata", tags: textTags });
  if (hasCompressedText) {
    groups.push({ label: "Other", tags: [{ label: "Compressed text chunk", value: "Present (not decompressed)" }] });
  }

  return { format: "png", groups: mergeGroups(groups), gps };
}

let crcTable: Int32Array | null = null;
function crc32(bytes: Uint8Array): number {
  if (!crcTable) {
    crcTable = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c;
    }
  }
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function buildPngChunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const len = new Uint8Array(4);
  new DataView(len.buffer).setUint32(0, data.length, false);
  const crcBytes = new Uint8Array(4);
  new DataView(crcBytes.buffer).setUint32(0, crc32(concatBytes([typeBytes, data])), false);
  return concatBytes([len, typeBytes, data, crcBytes]);
}

function stripPng(bytes: Uint8Array): Uint8Array {
  const STRIP: ReadonlySet<string> = new Set(["tEXt", "zTXt", "iTXt", "eXIf", "tIME"]);
  const keep: Uint8Array[] = [bytes.subarray(0, 8)]; // signature
  let offset = 8;

  while (offset + 8 <= bytes.length) {
    const length = readUint32BE(bytes, offset);
    const type = chunkTypeAt(bytes, offset + 4);
    const dataStart = offset + 8;
    const chunkEnd = dataStart + length + 4; // + CRC
    if (chunkEnd > bytes.length) { keep.push(bytes.subarray(offset)); offset = bytes.length; break; }

    if (type === "eXIf") {
      // Same rationale as the JPEG side: keep Orientation if set, drop the rest.
      let orientation: number | null = null;
      try { orientation = readOrientation(bytes.subarray(dataStart, dataStart + length)); } catch { /* drop entirely */ }
      if (orientation !== null && orientation !== 1) keep.push(buildPngChunk("eXIf", buildOrientationTiff(orientation)));
    } else if (!STRIP.has(type)) {
      keep.push(bytes.subarray(offset, chunkEnd));
    }
    offset = chunkEnd;
    if (type === "IEND") break;
  }

  if (offset < bytes.length) keep.push(bytes.subarray(offset));
  return concatBytes(keep);
}

/** Merges groups sharing a label (e.g. PNG can carry both a tIME chunk and an eXIf block, both contributing to "Timestamps"). */
function mergeGroups(groups: MetadataGroup[]): MetadataGroup[] {
  const byLabel = new Map<string, MetadataTag[]>();
  const order: string[] = [];
  for (const g of groups) {
    if (!byLabel.has(g.label)) { byLabel.set(g.label, []); order.push(g.label); }
    byLabel.get(g.label)!.push(...g.tags);
  }
  return order.map((label) => ({ label, tags: byLabel.get(label)! }));
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function readMetadata(bytes: Uint8Array): MetadataResult {
  if (isJpeg(bytes)) return readJpegMetadata(bytes);
  if (isPng(bytes)) return readPngMetadata(bytes);
  return { format: "unsupported", groups: [], gps: null };
}

/** Byte-level strip — no re-encode, no quality loss. Returns the input unchanged for unsupported formats. */
export function stripMetadata(bytes: Uint8Array): Uint8Array {
  if (isJpeg(bytes)) return stripJpeg(bytes);
  if (isPng(bytes)) return stripPng(bytes);
  return bytes;
}
