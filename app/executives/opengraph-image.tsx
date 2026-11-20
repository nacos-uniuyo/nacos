import { executives } from "@/lib/executives";
import { Brand, C, gridBg, logo, OG_SIZE, OG_TYPE, picture, render } from "@/lib/og";

export const alt = "The 4th Executive Council of NACOS UNIUYO: portraits of all twelve officers.";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

const W = 112;
const H = 140;

export default async function Image() {
  const [mark, ...faces] = await Promise.all([
    logo(56),
    ...executives.map((x) => picture(x.photo!, W * 2, H * 2)),
  ]);

  return render(
    <div style={{ width: "100%", height: "100%", display: "flex", padding: 56, fontFamily: "Sans", ...gridBg }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 600 }}>
        <Brand src={mark} />
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <span style={{ fontSize: 17, letterSpacing: 4, fontWeight: 600, color: C.gold }}>
            LEADERSHIP · THE REVOLUTION
          </span>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Serif", fontSize: 84, lineHeight: 0.98, color: "#fff" }}>
            <span>The 4th Executive</span>
            <span style={{ fontStyle: "italic", color: C.gold }}>Council</span>
          </div>
        </div>
        <span style={{ fontSize: 22, color: C.mint2, lineHeight: 1.45, maxWidth: 500 }}>
          Twelve officers serving computing students at the University of Uyo, led by President{" "}
          {executives[0].name}.
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, width: W * 4 + 30, marginLeft: "auto", alignContent: "center" }}>
        {faces.map((src, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              width: W,
              height: H,
              borderRadius: 12,
              overflow: "hidden",
              border: i === 0 ? `3px solid ${C.gold}` : "1px solid rgba(255,255,255,.18)",
            }}
          >
            <img src={src} width={W} height={H} style={{ objectFit: "cover" }} alt="" />
          </div>
        ))}
      </div>
    </div>,
  );
}
