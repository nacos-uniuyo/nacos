/**
 * The hero backdrop: one continuous stroke that crosses the screen and morphs
 * between the signatures of the fields computing works inside, with a set piece
 * fading in for each. All nine waveforms share a 72-segment skeleton, which is
 * what lets the browser interpolate between them rather than snapping.
 *
 * The band is 460 units tall so the trace takes real vertical space in the
 * hero rather than reading as a thin ribbon.
 *
 * The cycle runs 63s, nine 7s phases:
 *   0 embedded    a dense board trace running into a chip and its vias
 *   1 health      cardiac trace
 *   2 computing   square wave under a field of ones and zeros
 *   3 AI          neural curve under a node-and-edge graph
 *   4 biology     one helix strand, joined by its partner and base pairs
 *   5 chemistry   a bonded chain, resolving into an atom
 *   6 finance     a volatile rising line among figures
 *   7 robotics    right-angled articulation beside a jointed skeleton
 *   8 programming indent and dedent, among syntax tokens
 *
 * The viewBox is fitted with "meet" rather than "slice" on purpose: slice scales
 * to cover, which on a tall hero crops away everything outside the middle third
 * and would hide the set pieces at both edges entirely.
 */
export function IndustryTrace() {
  return (
    <svg
      className="industry-trace"
      viewBox="0 0 1440 460"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      aria-hidden="true"
    >
      {/* embedded systems: a chip, its pins and board vias */}
      <g className="trace-pcb" transform="translate(0 70)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.8" strokeLinecap="round">
        <rect x="1086" y="92" width="152" height="136" rx="10" stroke="rgba(216,180,92,0.5)" />
        <rect x="1118" y="124" width="88" height="72" rx="5" stroke="rgba(255,255,255,0.22)" />
        <circle cx="1104" cy="110" r="4" fill="rgba(216,180,92,0.6)" stroke="none" />
        <path d="M1098 92v-16M1098 228v16" />
        <path d="M1116 92v-16M1116 228v16" />
        <path d="M1134 92v-16M1134 228v16" />
        <path d="M1152 92v-16M1152 228v16" />
        <path d="M1170 92v-16M1170 228v16" />
        <path d="M1188 92v-16M1188 228v16" />
        <path d="M1206 92v-16M1206 228v16" />
        <path d="M1224 92v-16M1224 228v16" />
        <path d="M1086 160H1012v-62h-54M1238 160h66v70h-58" stroke="rgba(216,180,92,0.26)" />
        <circle cx="980" cy="62" r="3.6" fill="rgba(216,180,92,0.55)" stroke="none" />
        <circle cx="1066" cy="160" r="3.6" fill="rgba(216,180,92,0.55)" stroke="none" />
        <circle cx="1152" cy="258" r="3.6" fill="rgba(216,180,92,0.55)" stroke="none" />
        <circle cx="1238" cy="62" r="3.6" fill="rgba(216,180,92,0.55)" stroke="none" />
        <circle cx="1324" cy="160" r="3.6" fill="rgba(216,180,92,0.55)" stroke="none" />
        <circle cx="1410" cy="258" r="3.6" fill="rgba(216,180,92,0.55)" stroke="none" />
      </g>

      {/* computing: ones and zeros, scattered */}
      <g className="trace-binary" fontFamily="var(--font-outfit), monospace">
        <text x="653" y="254" fontSize="12.6" fill="rgba(216,180,92,0.34)" className="trace-twinkle" style={{ animationDelay: "2.91s" }}>0</text>
        <text x="1145" y="220" fontSize="9.8" fill="rgba(216,180,92,0.3)" className="trace-twinkle" style={{ animationDelay: "1.03s" }}>1</text>
        <text x="1154" y="309" fontSize="13.8" fill="rgba(216,180,92,0.48)" className="trace-twinkle" style={{ animationDelay: "1.35s" }}>1</text>
        <text x="1054" y="291" fontSize="15.7" fill="rgba(216,180,92,0.27)" className="trace-twinkle" style={{ animationDelay: "0.21s" }}>1</text>
        <text x="1251" y="271" fontSize="11.6" fill="rgba(216,180,92,0.35)" className="trace-twinkle" style={{ animationDelay: "2.01s" }}>0</text>
        <text x="347" y="146" fontSize="14.3" fill="rgba(216,180,92,0.39)" className="trace-twinkle" style={{ animationDelay: "1.55s" }}>1</text>
        <text x="1417" y="432" fontSize="14.7" fill="rgba(216,180,92,0.36)" className="trace-twinkle" style={{ animationDelay: "1.07s" }}>1</text>
        <text x="425" y="55" fontSize="12.2" fill="rgba(216,180,92,0.44)" className="trace-twinkle" style={{ animationDelay: "2.88s" }}>1</text>
        <text x="1361" y="372" fontSize="10.7" fill="rgba(216,180,92,0.28)" className="trace-twinkle" style={{ animationDelay: "3.15s" }}>1</text>
        <text x="546" y="315" fontSize="9.6" fill="rgba(216,180,92,0.64)" className="trace-twinkle" style={{ animationDelay: "2.14s" }}>0</text>
        <text x="398" y="62" fontSize="9.1" fill="rgba(216,180,92,0.71)" className="trace-twinkle" style={{ animationDelay: "1.39s" }}>0</text>
        <text x="208" y="314" fontSize="9.5" fill="rgba(216,180,92,0.34)" className="trace-twinkle" style={{ animationDelay: "2.71s" }}>1</text>
        <text x="803" y="209" fontSize="16.9" fill="rgba(216,180,92,0.46)" className="trace-twinkle" style={{ animationDelay: "2.62s" }}>1</text>
        <text x="557" y="187" fontSize="9.0" fill="rgba(216,180,92,0.74)" className="trace-twinkle" style={{ animationDelay: "2.94s" }}>1</text>
        <text x="850" y="433" fontSize="10.7" fill="rgba(216,180,92,0.68)" className="trace-twinkle" style={{ animationDelay: "1.34s" }}>1</text>
        <text x="919" y="67" fontSize="10.7" fill="rgba(216,180,92,0.64)" className="trace-twinkle" style={{ animationDelay: "0.88s" }}>1</text>
        <text x="481" y="147" fontSize="9.6" fill="rgba(216,180,92,0.57)" className="trace-twinkle" style={{ animationDelay: "0.71s" }}>1</text>
        <text x="42" y="176" fontSize="10.0" fill="rgba(216,180,92,0.67)" className="trace-twinkle" style={{ animationDelay: "2.0s" }}>0</text>
        <text x="210" y="184" fontSize="11.5" fill="rgba(216,180,92,0.56)" className="trace-twinkle" style={{ animationDelay: "0.78s" }}>1</text>
        <text x="1036" y="91" fontSize="14.5" fill="rgba(216,180,92,0.49)" className="trace-twinkle" style={{ animationDelay: "1.32s" }}>1</text>
        <text x="130" y="45" fontSize="9.3" fill="rgba(216,180,92,0.37)" className="trace-twinkle" style={{ animationDelay: "3.27s" }}>1</text>
        <text x="1006" y="131" fontSize="11.3" fill="rgba(216,180,92,0.61)" className="trace-twinkle" style={{ animationDelay: "0.6s" }}>0</text>
        <text x="116" y="119" fontSize="11.2" fill="rgba(216,180,92,0.35)" className="trace-twinkle" style={{ animationDelay: "3.12s" }}>1</text>
        <text x="43" y="136" fontSize="11.0" fill="rgba(216,180,92,0.39)" className="trace-twinkle" style={{ animationDelay: "0.16s" }}>0</text>
        <text x="763" y="423" fontSize="11.9" fill="rgba(216,180,92,0.74)" className="trace-twinkle" style={{ animationDelay: "3.03s" }}>1</text>
        <text x="940" y="308" fontSize="13.7" fill="rgba(216,180,92,0.49)" className="trace-twinkle" style={{ animationDelay: "3.14s" }}>1</text>
        <text x="520" y="153" fontSize="9.2" fill="rgba(216,180,92,0.49)" className="trace-twinkle" style={{ animationDelay: "2.16s" }}>1</text>
        <text x="1043" y="156" fontSize="9.6" fill="rgba(216,180,92,0.62)" className="trace-twinkle" style={{ animationDelay: "1.86s" }}>1</text>
        <text x="1280" y="327" fontSize="15.3" fill="rgba(216,180,92,0.43)" className="trace-twinkle" style={{ animationDelay: "3.11s" }}>1</text>
        <text x="979" y="394" fontSize="16.6" fill="rgba(216,180,92,0.5)" className="trace-twinkle" style={{ animationDelay: "0.1s" }}>0</text>
        <text x="40" y="296" fontSize="13.7" fill="rgba(216,180,92,0.29)" className="trace-twinkle" style={{ animationDelay: "2.07s" }}>0</text>
        <text x="915" y="431" fontSize="14.8" fill="rgba(216,180,92,0.62)" className="trace-twinkle" style={{ animationDelay: "1.32s" }}>0</text>
        <text x="833" y="206" fontSize="13.1" fill="rgba(216,180,92,0.41)" className="trace-twinkle" style={{ animationDelay: "1.75s" }}>1</text>
        <text x="143" y="35" fontSize="13.0" fill="rgba(216,180,92,0.71)" className="trace-twinkle" style={{ animationDelay: "2.09s" }}>1</text>
        <text x="378" y="31" fontSize="10.1" fill="rgba(216,180,92,0.51)" className="trace-twinkle" style={{ animationDelay: "2.08s" }}>0</text>
        <text x="1075" y="166" fontSize="13.0" fill="rgba(216,180,92,0.45)" className="trace-twinkle" style={{ animationDelay: "0.82s" }}>0</text>
        <text x="371" y="285" fontSize="16.0" fill="rgba(216,180,92,0.54)" className="trace-twinkle" style={{ animationDelay: "1.31s" }}>1</text>
        <text x="463" y="82" fontSize="11.8" fill="rgba(216,180,92,0.27)" className="trace-twinkle" style={{ animationDelay: "3.05s" }}>0</text>
        <text x="110" y="426" fontSize="9.9" fill="rgba(216,180,92,0.71)" className="trace-twinkle" style={{ animationDelay: "1.6s" }}>1</text>
        <text x="1183" y="182" fontSize="14.4" fill="rgba(216,180,92,0.67)" className="trace-twinkle" style={{ animationDelay: "2.44s" }}>0</text>
        <text x="895" y="157" fontSize="11.2" fill="rgba(216,180,92,0.59)" className="trace-twinkle" style={{ animationDelay: "2.07s" }}>1</text>
        <text x="413" y="171" fontSize="14.1" fill="rgba(216,180,92,0.34)" className="trace-twinkle" style={{ animationDelay: "1.38s" }}>1</text>
        <text x="1097" y="135" fontSize="15.4" fill="rgba(216,180,92,0.31)" className="trace-twinkle" style={{ animationDelay: "3.35s" }}>1</text>
        <text x="173" y="244" fontSize="16.7" fill="rgba(216,180,92,0.35)" className="trace-twinkle" style={{ animationDelay: "2.33s" }}>0</text>
        <text x="685" y="99" fontSize="15.0" fill="rgba(216,180,92,0.27)" className="trace-twinkle" style={{ animationDelay: "1.82s" }}>1</text>
        <text x="337" y="344" fontSize="12.1" fill="rgba(216,180,92,0.7)" className="trace-twinkle" style={{ animationDelay: "2.69s" }}>1</text>
        <text x="142" y="407" fontSize="10.0" fill="rgba(216,180,92,0.56)" className="trace-twinkle" style={{ animationDelay: "1.54s" }}>0</text>
        <text x="1294" y="180" fontSize="12.7" fill="rgba(216,180,92,0.35)" className="trace-twinkle" style={{ animationDelay: "2.21s" }}>0</text>
        <text x="1031" y="360" fontSize="10.7" fill="rgba(216,180,92,0.74)" className="trace-twinkle" style={{ animationDelay: "3.06s" }}>1</text>
        <text x="1388" y="245" fontSize="11.1" fill="rgba(216,180,92,0.26)" className="trace-twinkle" style={{ animationDelay: "2.44s" }}>0</text>
        <text x="727" y="41" fontSize="13.4" fill="rgba(216,180,92,0.49)" className="trace-twinkle" style={{ animationDelay: "2.61s" }}>0</text>
        <text x="60" y="356" fontSize="12.4" fill="rgba(216,180,92,0.52)" className="trace-twinkle" style={{ animationDelay: "0.12s" }}>1</text>
        <text x="981" y="400" fontSize="10.2" fill="rgba(216,180,92,0.61)" className="trace-twinkle" style={{ animationDelay: "1.76s" }}>0</text>
        <text x="1196" y="307" fontSize="13.6" fill="rgba(216,180,92,0.63)" className="trace-twinkle" style={{ animationDelay: "2.34s" }}>0</text>
      </g>

      {/* AI: node-and-edge graph */}
      <g className="trace-neural">
        <line x1="840" y1="172" x2="1083" y2="186" stroke="rgba(255,255,255,0.18)" />
        <line x1="840" y1="172" x2="1019" y2="122" stroke="rgba(255,255,255,0.18)" />
        <line x1="840" y1="172" x2="884" y2="123" stroke="rgba(255,255,255,0.18)" />
        <line x1="840" y1="172" x2="821" y2="362" stroke="rgba(255,255,255,0.18)" />
        <line x1="840" y1="172" x2="790" y2="153" stroke="rgba(255,255,255,0.18)" />
        <line x1="840" y1="172" x2="890" y2="198" stroke="rgba(255,255,255,0.18)" />
        <line x1="1083" y1="186" x2="1019" y2="122" stroke="rgba(255,255,255,0.18)" />
        <line x1="1083" y1="186" x2="884" y2="123" stroke="rgba(255,255,255,0.18)" />
        <line x1="1083" y1="186" x2="1238" y2="163" stroke="rgba(255,255,255,0.18)" />
        <line x1="1083" y1="186" x2="790" y2="153" stroke="rgba(255,255,255,0.18)" />
        <line x1="1083" y1="186" x2="1337" y2="162" stroke="rgba(255,255,255,0.18)" />
        <line x1="1083" y1="186" x2="890" y2="198" stroke="rgba(255,255,255,0.18)" />
        <line x1="1019" y1="122" x2="884" y2="123" stroke="rgba(255,255,255,0.18)" />
        <line x1="1019" y1="122" x2="1238" y2="163" stroke="rgba(255,255,255,0.18)" />
        <line x1="1019" y1="122" x2="790" y2="153" stroke="rgba(255,255,255,0.18)" />
        <line x1="1019" y1="122" x2="890" y2="198" stroke="rgba(255,255,255,0.18)" />
        <line x1="884" y1="123" x2="821" y2="362" stroke="rgba(255,255,255,0.18)" />
        <line x1="884" y1="123" x2="790" y2="153" stroke="rgba(255,255,255,0.18)" />
        <line x1="884" y1="123" x2="890" y2="198" stroke="rgba(255,255,255,0.18)" />
        <line x1="1238" y1="163" x2="1354" y2="367" stroke="rgba(255,255,255,0.18)" />
        <line x1="1238" y1="163" x2="1337" y2="162" stroke="rgba(255,255,255,0.18)" />
        <line x1="821" y1="362" x2="790" y2="153" stroke="rgba(255,255,255,0.18)" />
        <line x1="821" y1="362" x2="890" y2="198" stroke="rgba(255,255,255,0.18)" />
        <line x1="1354" y1="367" x2="1337" y2="162" stroke="rgba(255,255,255,0.18)" />
        <line x1="790" y1="153" x2="890" y2="198" stroke="rgba(255,255,255,0.18)" />
        <circle cx="840" cy="172" r="3.4" fill="rgba(216,180,92,0.6)" />
        <circle cx="1083" cy="186" r="3.4" fill="rgba(216,180,92,0.6)" />
        <circle cx="1019" cy="122" r="3.4" fill="rgba(216,180,92,0.6)" />
        <circle cx="884" cy="123" r="3.4" fill="rgba(216,180,92,0.6)" />
        <circle cx="1238" cy="163" r="3.4" fill="rgba(216,180,92,0.6)" />
        <circle cx="821" cy="362" r="3.4" fill="rgba(216,180,92,0.6)" />
        <circle cx="1354" cy="367" r="3.4" fill="rgba(216,180,92,0.6)" />
        <circle cx="790" cy="153" r="3.4" fill="rgba(216,180,92,0.6)" />
        <circle cx="1337" cy="162" r="3.4" fill="rgba(216,180,92,0.6)" />
        <circle cx="890" cy="198" r="3.4" fill="rgba(216,180,92,0.6)" />
      </g>

      {/* biology: the partner strand and its base pairs, drawn to match the line */}
      <g className="trace-helix">
        <path d="M0 230.0L20 256.6L41 281.1L61 301.6L81 316.4L101 324.4L122 325.0L142 318.1L162 304.2L183 284.5L203 260.5L223 234.1L243 207.4L264 182.4L284 161.2L304 145.4L325 136.3L345 134.6L365 140.4L385 153.2L406 172.1L426 195.6L446 221.8L466 248.6L487 274.0L507 295.9L527 312.6L548 322.8L568 325.6L588 321.0L608 309.2L629 291.1L649 268.2L669 242.3L690 215.4L710 189.7L730 167.2L750 149.6L771 138.3L791 134.3L811 137.8L832 148.6L852 165.8L872 188.1L892 213.6L913 240.5L933 266.5L953 289.7L974 308.1L994 320.4L1014 325.6L1034 323.2L1055 313.5L1075 297.2L1095 275.6L1115 250.4L1136 223.6L1156 197.3L1176 173.6L1197 154.3L1217 141.0L1237 134.7L1257 136.0L1278 144.6L1298 159.9L1318 180.8L1339 205.6L1359 232.3L1379 258.8L1399 283.0L1420 303.1L1440 317.4" stroke="rgba(216,180,92,0.28)" strokeWidth="1.6" />
        <line x1="40" y1="179.5" x2="40" y2="280.5" stroke="rgba(216,180,92,0.3)" />
        <line x1="104" y1="135.1" x2="104" y2="324.9" stroke="rgba(216,180,92,0.3)" />
        <line x1="168" y1="160.8" x2="168" y2="299.2" stroke="rgba(216,180,92,0.3)" />
        <line x1="232" y1="237.7" x2="232" y2="222.3" stroke="rgba(216,180,92,0.3)" />
        <line x1="296" y1="308.9" x2="296" y2="151.1" stroke="rgba(216,180,92,0.3)" />
        <line x1="360" y1="321.8" x2="360" y2="138.2" stroke="rgba(216,180,92,0.3)" />
        <line x1="424" y1="266.8" x2="424" y2="193.2" stroke="rgba(216,180,92,0.3)" />
        <line x1="488" y1="184.6" x2="488" y2="275.4" stroke="rgba(216,180,92,0.3)" />
        <line x1="552" y1="136.0" x2="552" y2="324.0" stroke="rgba(216,180,92,0.3)" />
        <line x1="616" y1="156.9" x2="616" y2="303.1" stroke="rgba(216,180,92,0.3)" />
        <line x1="680" y1="231.9" x2="680" y2="228.1" stroke="rgba(216,180,92,0.3)" />
        <line x1="744" y1="305.5" x2="744" y2="154.5" stroke="rgba(216,180,92,0.3)" />
        <line x1="808" y1="323.3" x2="808" y2="136.7" stroke="rgba(216,180,92,0.3)" />
        <line x1="872" y1="272.1" x2="872" y2="187.9" stroke="rgba(216,180,92,0.3)" />
        <line x1="936" y1="189.8" x2="936" y2="270.2" stroke="rgba(216,180,92,0.3)" />
        <line x1="1000" y1="137.2" x2="1000" y2="322.8" stroke="rgba(216,180,92,0.3)" />
        <line x1="1064" y1="153.3" x2="1064" y2="306.7" stroke="rgba(216,180,92,0.3)" />
        <line x1="1128" y1="226.0" x2="1128" y2="234.0" stroke="rgba(216,180,92,0.3)" />
        <line x1="1192" y1="301.7" x2="1192" y2="158.3" stroke="rgba(216,180,92,0.3)" />
        <line x1="1256" y1="324.4" x2="1256" y2="135.6" stroke="rgba(216,180,92,0.3)" />
        <line x1="1320" y1="277.2" x2="1320" y2="182.8" stroke="rgba(216,180,92,0.3)" />
        <line x1="1384" y1="195.2" x2="1384" y2="264.8" stroke="rgba(216,180,92,0.3)" />
        <circle cx="40" cy="179.5" r="2.6" fill="rgba(0,148,36,0.75)" />
        <circle cx="40" cy="280.5" r="2.6" fill="rgba(216,180,92,0.55)" />
        <circle cx="168" cy="160.8" r="2.6" fill="rgba(0,148,36,0.75)" />
        <circle cx="168" cy="299.2" r="2.6" fill="rgba(216,180,92,0.55)" />
        <circle cx="296" cy="308.9" r="2.6" fill="rgba(0,148,36,0.75)" />
        <circle cx="296" cy="151.1" r="2.6" fill="rgba(216,180,92,0.55)" />
        <circle cx="424" cy="266.8" r="2.6" fill="rgba(0,148,36,0.75)" />
        <circle cx="424" cy="193.2" r="2.6" fill="rgba(216,180,92,0.55)" />
        <circle cx="552" cy="136.0" r="2.6" fill="rgba(0,148,36,0.75)" />
        <circle cx="552" cy="324.0" r="2.6" fill="rgba(216,180,92,0.55)" />
        <circle cx="680" cy="231.9" r="2.6" fill="rgba(0,148,36,0.75)" />
        <circle cx="680" cy="228.1" r="2.6" fill="rgba(216,180,92,0.55)" />
        <circle cx="808" cy="323.3" r="2.6" fill="rgba(0,148,36,0.75)" />
        <circle cx="808" cy="136.7" r="2.6" fill="rgba(216,180,92,0.55)" />
        <circle cx="936" cy="189.8" r="2.6" fill="rgba(0,148,36,0.75)" />
        <circle cx="936" cy="270.2" r="2.6" fill="rgba(216,180,92,0.55)" />
        <circle cx="1064" cy="153.3" r="2.6" fill="rgba(0,148,36,0.75)" />
        <circle cx="1064" cy="306.7" r="2.6" fill="rgba(216,180,92,0.55)" />
        <circle cx="1192" cy="301.7" r="2.6" fill="rgba(0,148,36,0.75)" />
        <circle cx="1192" cy="158.3" r="2.6" fill="rgba(216,180,92,0.55)" />
        <circle cx="1320" cy="277.2" r="2.6" fill="rgba(0,148,36,0.75)" />
        <circle cx="1320" cy="182.8" r="2.6" fill="rgba(216,180,92,0.55)" />
      </g>

      {/* chemistry: the atom, its own phase rather than a per-sweep flourish.
          The translate sits on an outer group because the spin animates CSS
          transform, which would override a transform attribute on the same node. */}
      <g className="trace-chain">
        <g transform="translate(1210 230)">
          <g className="trace-atom-spin">
            <ellipse rx="112" ry="42" stroke="rgba(216,180,92,0.45)" />
            <ellipse rx="112" ry="42" stroke="rgba(255,255,255,0.22)" transform="rotate(60)" />
            <ellipse rx="112" ry="42" stroke="rgba(216,180,92,0.3)" transform="rotate(120)" />
          </g>
          <g className="trace-atom-spin-rev">
            <circle r="68" stroke="rgba(255,255,255,0.16)" strokeDasharray="3 8" />
            <circle cx="68" cy="0" r="4.5" fill="rgba(0,148,36,0.9)" stroke="none" />
            <circle cx="-34" cy="59" r="4.5" fill="rgba(216,180,92,0.8)" stroke="none" />
            <circle cx="-34" cy="-59" r="4.5" fill="rgba(255,255,255,0.6)" stroke="none" />
          </g>
          <circle r="13" fill="rgba(216,180,92,0.65)" stroke="none" />
        </g>
      </g>

      {/* finance: figures */}
      <g className="trace-market" fontFamily="var(--font-outfit), monospace">
        <text x="1008" y="252" fontSize="12.6" fill="rgba(216,180,92,0.5)" className="trace-twinkle" style={{ animationDelay: "2.19s" }}>14.7</text>
        <text x="1092" y="158" fontSize="14.8" fill="rgba(216,180,92,0.5)" className="trace-twinkle" style={{ animationDelay: "2.26s" }}>0.66</text>
        <text x="1127" y="156" fontSize="14.8" fill="rgba(216,180,92,0.5)" className="trace-twinkle" style={{ animationDelay: "1.36s" }}>14.7</text>
        <text x="1101" y="116" fontSize="12.5" fill="rgba(216,180,92,0.5)" className="trace-twinkle" style={{ animationDelay: "1.57s" }}>0.91</text>
        <text x="719" y="408" fontSize="12.7" fill="rgba(216,180,92,0.5)" className="trace-twinkle" style={{ animationDelay: "2.57s" }}>0.66</text>
        <text x="785" y="75" fontSize="10.3" fill="rgba(216,180,92,0.5)" className="trace-twinkle" style={{ animationDelay: "1.4s" }}>14.7</text>
        <text x="990" y="404" fontSize="11.3" fill="rgba(216,180,92,0.5)" className="trace-twinkle" style={{ animationDelay: "1.23s" }}>0.66</text>
        <text x="789" y="205" fontSize="12.6" fill="rgba(216,180,92,0.5)" className="trace-twinkle" style={{ animationDelay: "0.28s" }}>92.5</text>
        <text x="994" y="51" fontSize="10.6" fill="rgba(216,180,92,0.5)" className="trace-twinkle" style={{ animationDelay: "2.03s" }}>3.04</text>
        <text x="716" y="114" fontSize="10.1" fill="rgba(216,180,92,0.5)" className="trace-twinkle" style={{ animationDelay: "0.74s" }}>-1.2%</text>
        <text x="1207" y="133" fontSize="10.5" fill="rgba(216,180,92,0.5)" className="trace-twinkle" style={{ animationDelay: "1.9s" }}>92.5</text>
        <text x="786" y="234" fontSize="13.6" fill="rgba(216,180,92,0.5)" className="trace-twinkle" style={{ animationDelay: "1.82s" }}>3.04</text>
        <text x="1315" y="49" fontSize="14.1" fill="rgba(216,180,92,0.5)" className="trace-twinkle" style={{ animationDelay: "1.6s" }}>0.66</text>
        <text x="1077" y="368" fontSize="12.6" fill="rgba(216,180,92,0.5)" className="trace-twinkle" style={{ animationDelay: "2.21s" }}>-1.2%</text>
      </g>

      {/* robotics: a jointed skeleton, clear of the headline */}
      <g className="trace-robotics" transform="translate(880 106)" stroke="rgba(255,255,255,0.34)" strokeWidth="2" strokeLinecap="round">
        <circle cx="250" cy="74" r="20" />
        <circle cx="243" cy="70" r="2.6" fill="rgba(216,180,92,0.8)" stroke="none" />
        <circle cx="257" cy="70" r="2.6" fill="rgba(216,180,92,0.8)" stroke="none" />
        <path d="M250 94v62" />
        <path d="M206 112h88" />
        <path d="M206 112l-22 36 14 34M294 112l22 36-14 34" />
        <path d="M222 156h56" />
        <path d="M222 156l-10 48 6 44M278 156l10 48-6 44" />
        <circle cx="206" cy="112" r="4.5" fill="rgba(216,180,92,0.7)" stroke="none" />
        <circle cx="294" cy="112" r="4.5" fill="rgba(216,180,92,0.7)" stroke="none" />
        <circle cx="184" cy="148" r="3.6" fill="rgba(216,180,92,0.55)" stroke="none" />
        <circle cx="316" cy="148" r="3.6" fill="rgba(216,180,92,0.55)" stroke="none" />
        <circle cx="212" cy="204" r="3.6" fill="rgba(216,180,92,0.55)" stroke="none" />
        <circle cx="288" cy="204" r="3.6" fill="rgba(216,180,92,0.55)" stroke="none" />
      </g>

      {/* programming: syntax tokens */}
      <g className="trace-indent" fontFamily="var(--font-outfit), monospace">
        <text x="1130" y="366" fontSize="16.5" fill="rgba(255,255,255,0.45)" className="trace-twinkle" style={{ animationDelay: "1.88s" }}>{"async"}</text>
        <text x="953" y="109" fontSize="12.9" fill="rgba(255,255,255,0.45)" className="trace-twinkle" style={{ animationDelay: "2.77s" }}>{"if"}</text>
        <text x="866" y="419" fontSize="11.8" fill="rgba(255,255,255,0.45)" className="trace-twinkle" style={{ animationDelay: "0.72s" }}>{"=>"}</text>
        <text x="1207" y="139" fontSize="13.6" fill="rgba(255,255,255,0.45)" className="trace-twinkle" style={{ animationDelay: "2.82s" }}>{"=>"}</text>
        <text x="1084" y="308" fontSize="13.4" fill="rgba(255,255,255,0.45)" className="trace-twinkle" style={{ animationDelay: "2.06s" }}>{"async"}</text>
        <text x="732" y="116" fontSize="13.1" fill="rgba(255,255,255,0.45)" className="trace-twinkle" style={{ animationDelay: "2.46s" }}>{"await"}</text>
        <text x="962" y="308" fontSize="15.5" fill="rgba(255,255,255,0.45)" className="trace-twinkle" style={{ animationDelay: "1.51s" }}>{"await"}</text>
        <text x="1179" y="112" fontSize="13.9" fill="rgba(255,255,255,0.45)" className="trace-twinkle" style={{ animationDelay: "0.07s" }}>{"=>"}</text>
        <text x="1231" y="273" fontSize="13.9" fill="rgba(255,255,255,0.45)" className="trace-twinkle" style={{ animationDelay: "0.57s" }}>{"if"}</text>
        <text x="797" y="106" fontSize="16.9" fill="rgba(255,255,255,0.45)" className="trace-twinkle" style={{ animationDelay: "2.78s" }}>{"{ }"}</text>
        <text x="784" y="64" fontSize="13.8" fill="rgba(255,255,255,0.45)" className="trace-twinkle" style={{ animationDelay: "2.29s" }}>{"await"}</text>
        <text x="939" y="217" fontSize="13.1" fill="rgba(255,255,255,0.45)" className="trace-twinkle" style={{ animationDelay: "0.63s" }}>{"null"}</text>
        <text x="970" y="281" fontSize="16.1" fill="rgba(255,255,255,0.45)" className="trace-twinkle" style={{ animationDelay: "0.54s" }}>{"const"}</text>
        <text x="1024" y="321" fontSize="16.5" fill="rgba(255,255,255,0.45)" className="trace-twinkle" style={{ animationDelay: "1.81s" }}>{"fn"}</text>
        <text x="784" y="341" fontSize="16.4" fill="rgba(255,255,255,0.45)" className="trace-twinkle" style={{ animationDelay: "2.41s" }}>{"()"}</text>
        <text x="1192" y="367" fontSize="16.6" fill="rgba(255,255,255,0.45)" className="trace-twinkle" style={{ animationDelay: "1.71s" }}>{"await"}</text>
        <text x="848" y="262" fontSize="15.8" fill="rgba(255,255,255,0.45)" className="trace-twinkle" style={{ animationDelay: "0.77s" }}>{"()"}</text>
        <text x="1331" y="323" fontSize="12.0" fill="rgba(255,255,255,0.45)" className="trace-twinkle" style={{ animationDelay: "2.8s" }}>{"def"}</text>
      </g>

      {/* The line itself, and the highlight travelling along it */}
      <path
        className="trace-line"
        stroke="rgba(216,180,92,0.20)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="trace-comet"
        stroke="rgba(216,180,92,0.85)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 6px rgba(216,180,92,0.5))" }}
      />
    </svg>
  );
}
