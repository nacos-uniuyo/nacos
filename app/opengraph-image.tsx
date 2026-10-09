import { Brand, C, gridBg, logo, OG_SIZE, OG_TYPE, render } from "@/lib/og";

export const alt = "NACOS UNIUYO. Building Capacity, Fostering Innovation.";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image() {
  const mark = await logo(64);
  return render(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "Sans", ...gridBg }}>
      {/* the orbit motif from the homepage hero */}
      <svg width="760" height="760" viewBox="0 0 860 860" style={{ position: "absolute", right: -230, top: -65 }}>
        <circle cx="430" cy="430" r="420" fill="none" stroke="rgba(216,180,92,.32)" />
        <circle cx="430" cy="10" r="6" fill={C.gold} />
        <circle cx="430" cy="430" r="330" fill="none" stroke="rgba(255,255,255,.12)" strokeDasharray="3 9" />
        <circle cx="430" cy="430" r="240" fill="none" stroke="rgba(255,255,255,.16)" />
        <circle cx="190" cy="430" r="6" fill={C.green} />
        <ellipse cx="430" cy="430" rx="240" ry="90" fill="none" stroke="rgba(255,255,255,.1)" />
        <ellipse cx="430" cy="430" rx="90" ry="240" fill="none" stroke="rgba(255,255,255,.1)" />
        <circle cx="430" cy="430" r="150" fill="none" stroke="rgba(216,180,92,.4)" />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, width: "100%" }}>
        <Brand src={mark} size={64} />
        <div style={{ display: "flex", flexDirection: "column", fontFamily: "Serif", fontSize: 108, lineHeight: 0.94, color: "#fff" }}>
          <span>Building Capacity</span>
          <span style={{ fontStyle: "italic", color: C.gold }}>Fostering Innovation</span>
        </div>
        <span style={{ fontSize: 22, color: C.mint2 }}>
          Nigeria Association of Computing Students · Faculty of Computing, University of Uyo
        </span>
      </div>
    </div>,
  );
}
