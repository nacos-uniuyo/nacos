import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "NACOS UNIUYO. Building Capacity, Fostering Innovation.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function serif(italic: boolean) {
  try {
    const family = italic ? "Instrument+Serif:ital@1" : "Instrument+Serif";
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}`)).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    return src ? await (await fetch(src)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function Image() {
  const [logo, regular, italic] = await Promise.all([
    readFile(join(process.cwd(), "public/images/nacos-logo.png")),
    serif(false),
    serif(true),
  ]);
  const fonts = [
    ...(regular ? [{ name: "Serif", data: regular, style: "normal" as const, weight: 400 as const }] : []),
    ...(italic ? [{ name: "Serif", data: italic, style: "italic" as const, weight: 400 as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#062A14",
          backgroundImage:
            "linear-gradient(rgba(0,148,36,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(0,148,36,.16) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          color: "#fff",
          fontFamily: "Serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <img
            src={`data:image/png;base64,${logo.toString("base64")}`}
            width={84}
            height={84}
            style={{ borderRadius: 84, border: "3px solid #fff" }}
            alt=""
          />
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "sans-serif" }}>
            <span style={{ fontSize: 26, letterSpacing: 6, fontWeight: 700 }}>NACOS</span>
            <span style={{ fontSize: 20, color: "#A9C4B1" }}>University of Uyo</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 104, lineHeight: 0.95 }}>
          <span>Building Capacity</span>
          <span style={{ fontStyle: "italic", color: "#D8B45C" }}>Fostering Innovation</span>
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#C8DBCD", fontFamily: "sans-serif" }}>
          Nigeria Association of Computing Students · Faculty of Computing, UNIUYO
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
