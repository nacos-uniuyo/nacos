import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { formatEventDate, formatEventTime, type NacosEvent } from "./events";

export const OG_SIZE = { width: 1200, height: 630 };

/** Social cards ship as JPEG: a photo-heavy PNG is ~1 MB, the JPEG is a fraction of that. */
export const OG_TYPE = "image/jpeg";

export const C = {
  forest: "#062A14",
  forest2: "#0B3A1E",
  deep: "#041C0D",
  green: "#009424",
  gold: "#D8B45C",
  mint: "#A9C4B1",
  mint2: "#C8DBCD",
  paper: "#F5F2EA",
};

// Fixed folder prefixes keep the bundler from tracing the whole project.
const fontFile = (name: string) => readFile(join(process.cwd(), "assets/fonts", name));
const imageFile = (publicPath: string) =>
  readFile(join(process.cwd(), "public/images", publicPath.replace(/^\/?images\//, "")));

export async function fonts() {
  const [serif, serifItalic, sans, sansSemi] = await Promise.all([
    fontFile("serif-regular.ttf"),
    fontFile("serif-italic.ttf"),
    fontFile("sans-regular.ttf"),
    fontFile("sans-semibold.ttf"),
  ]);
  return [
    { name: "Serif", data: serif, weight: 400 as const, style: "normal" as const },
    { name: "Serif", data: serifItalic, weight: 400 as const, style: "italic" as const },
    { name: "Sans", data: sans, weight: 400 as const, style: "normal" as const },
    { name: "Sans", data: sansSemi, weight: 600 as const, style: "normal" as const },
  ];
}

/** Reads an image from /public/images, resizes it with sharp and returns a JPEG data URI for Satori. */
export async function picture(publicPath: string, width: number, height: number, opts?: { blur?: number; dim?: number }) {
  let img = sharp(await imageFile(publicPath)).resize(width, height, { fit: "cover", position: "attention" });
  if (opts?.blur) img = img.blur(opts.blur);
  if (opts?.dim) img = img.modulate({ brightness: opts.dim });
  const buf = await img.jpeg({ quality: 86, mozjpeg: true }).toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

/** Like picture() but keeps the whole image (no crop). */
export async function pictureContain(publicPath: string, width: number, height: number) {
  const buf = await sharp(await imageFile(publicPath))
    .resize(width, height, { fit: "inside" })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
  const meta = await sharp(buf).metadata();
  return { src: `data:image/jpeg;base64,${buf.toString("base64")}`, width: meta.width!, height: meta.height! };
}

export async function logo(size: number) {
  return picture("images/nacos-logo.png", size * 2, size * 2);
}

/** Renders with Satori, then recompresses to a progressive mozjpeg. */
export async function render(node: React.ReactElement) {
  const png = Buffer.from(await new ImageResponse(node, { ...OG_SIZE, fonts: await fonts() }).arrayBuffer());
  const jpg = await sharp(png).jpeg({ quality: 82, mozjpeg: true, progressive: true, chromaSubsampling: "4:4:4" }).toBuffer();
  return new Response(new Uint8Array(jpg), {
    headers: { "Content-Type": OG_TYPE, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}

export function Brand({ src, size = 56, light = true }: { src: string; size?: number; light?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <img src={src} width={size} height={size} style={{ borderRadius: size, border: "3px solid #fff" }} alt="" />
      <div style={{ display: "flex", flexDirection: "column", fontFamily: "Sans" }}>
        <span style={{ fontSize: size * 0.36, letterSpacing: 5, fontWeight: 600, color: light ? "#fff" : C.forest }}>
          NACOS
        </span>
        <span style={{ fontSize: size * 0.3, color: light ? C.mint : "#4A5A50" }}>University of Uyo</span>
      </div>
    </div>
  );
}

/** Faint grid used across the site's dark sections. */
export const gridBg = {
  backgroundColor: C.forest,
  backgroundImage:
    "linear-gradient(rgba(0,148,36,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(0,148,36,.16) 1px, transparent 1px)",
  backgroundSize: "64px 64px",
};

/**
 * The flyer card used by every event page: the full flyer (never cropped)
 * over a blurred copy of itself, with an information band along the bottom.
 */
export async function eventCard(e: NacosEvent, band: { title: string; kicker: string }) {
  const BAND = 150;
  const [backdrop, flyer, mark] = await Promise.all([
    picture(e.flyer.src, 1200, 630, { blur: 28, dim: 0.45 }),
    pictureContain(e.flyer.src, 1100, 630 - BAND - 40),
    logo(56),
  ]);
  const day = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", day: "2-digit" }).format(new Date(e.start));
  const month = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", month: "short" })
    .format(new Date(e.start))
    .toUpperCase();

  return render(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "Sans" }}>
      <img src={backdrop} width={1200} height={630} style={{ position: "absolute", inset: 0 }} alt="" />
      <div
        style={{
          position: "absolute",
          top: 22,
          left: (1200 - flyer.width) / 2,
          display: "flex",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,.55)",
          border: "1px solid rgba(255,255,255,.25)",
        }}
      >
        <img src={flyer.src} width={flyer.width} height={flyer.height} alt="" />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: BAND,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 48px",
          background: "rgba(4,28,13,.94)",
          borderTop: `3px solid ${C.gold}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <img src={mark} width={64} height={64} style={{ borderRadius: 64, border: "2px solid #fff" }} alt="" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 16, letterSpacing: 4, fontWeight: 600, color: C.gold }}>{band.kicker}</span>
            <span style={{ fontFamily: "Serif", fontSize: 38, color: "#fff", lineHeight: 1.05 }}>{band.title}</span>
            <span style={{ fontSize: 19, color: C.mint2 }}>
              {formatEventDate(e.start)} · {formatEventTime(e.start)} · {e.venue.name}, {e.venue.institution}
            </span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 104,
            height: 104,
            borderRadius: 104,
            border: `2px solid ${C.gold}`,
            color: "#fff",
          }}
        >
          <span style={{ fontFamily: "Serif", fontSize: 44, lineHeight: 1 }}>{day}</span>
          <span style={{ fontSize: 15, letterSpacing: 3, fontWeight: 600, color: C.gold }}>{month}</span>
        </div>
      </div>
    </div>,
  );
}
