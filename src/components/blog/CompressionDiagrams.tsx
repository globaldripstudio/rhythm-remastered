const SeuilDiagram = () => (
  <svg viewBox="0 0 600 220" className="w-full max-w-2xl mx-auto my-8" aria-label="Schéma illustrant le seuil de compression">
    {/* Waveform - clean path */}
    <path
      d="M30 140 Q50 140 55 105 Q60 70 70 85 Q80 40 90 55 Q100 30 105 65 Q110 95 120 110 Q130 70 135 50 Q140 25 145 60 Q155 100 165 130 Q170 120 180 90 Q185 55 190 40 Q195 25 200 55 Q210 90 220 125 Q225 140 235 130 Q240 115 250 95 Q255 70 260 55 Q265 40 270 65 Q280 95 290 120 Q295 140 305 135 Q310 125 320 105 Q325 85 330 70 Q335 55 340 75 Q350 95 360 115 Q365 130 375 140 Q380 130 390 120 Q395 105 400 85 Q405 65 410 50 Q415 35 420 60 Q430 85 440 105 Q445 125 455 140 Q460 135 470 125 Q475 110 480 90 Q485 70 490 55 Q495 45 500 65 Q510 90 520 115 Q525 130 535 140 Q545 140 555 140 L570 140"
      fill="none"
      stroke="hsl(var(--foreground) / 0.45)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Parts above threshold highlighted */}
    <clipPath id="aboveThreshold">
      <rect x="0" y="0" width="600" height="80" />
    </clipPath>
    <path
      d="M30 140 Q50 140 55 105 Q60 70 70 85 Q80 40 90 55 Q100 30 105 65 Q110 95 120 110 Q130 70 135 50 Q140 25 145 60 Q155 100 165 130 Q170 120 180 90 Q185 55 190 40 Q195 25 200 55 Q210 90 220 125 Q225 140 235 130 Q240 115 250 95 Q255 70 260 55 Q265 40 270 65 Q280 95 290 120 Q295 140 305 135 Q310 125 320 105 Q325 85 330 70 Q335 55 340 75 Q350 95 360 115 Q365 130 375 140 Q380 130 390 120 Q395 105 400 85 Q405 65 410 50 Q415 35 420 60 Q430 85 440 105 Q445 125 455 140 Q460 135 470 125 Q475 110 480 90 Q485 70 490 55 Q495 45 500 65 Q510 90 520 115 Q525 130 535 140"
      fill="none"
      stroke="hsl(var(--primary))"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      clipPath="url(#aboveThreshold)"
    />
    {/* Threshold line */}
    <line x1="20" y1="80" x2="580" y2="80" stroke="hsl(var(--primary))" strokeWidth="1.2" strokeDasharray="10 6" opacity="0.7" />
    {/* Label */}
    <text x="548" y="72" fill="hsl(var(--primary))" fontSize="13" fontFamily="'Courier New', monospace" textAnchor="end" opacity="0.85" style={{ fontStyle: "italic" }}>SEUIL</text>
    {/* Annotations */}
    <text x="300" y="28" fill="hsl(var(--primary) / 0.55)" fontSize="11" fontFamily="'Courier New', monospace" textAnchor="middle" style={{ fontStyle: "italic" }}>↑ zone compressée</text>
    <text x="300" y="200" fill="hsl(var(--foreground) / 0.25)" fontSize="11" fontFamily="'Courier New', monospace" textAnchor="middle" style={{ fontStyle: "italic" }}>signal non affecté</text>
  </svg>
);

const RatioDiagram = () => (
  <svg viewBox="0 0 600 240" className="w-full max-w-2xl mx-auto my-8" aria-label="Schéma illustrant le ratio de compression">
    {/* Axes */}
    <line x1="80" y1="200" x2="560" y2="200" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="1.3" />
    <line x1="80" y1="200" x2="80" y2="20" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="1.3" />
    {/* Axis labels */}
    <text x="320" y="230" fill="hsl(var(--foreground) / 0.35)" fontSize="11" fontFamily="'Courier New', monospace" textAnchor="middle" style={{ fontStyle: "italic" }}>ENTRÉE (dB)</text>
    <text x="30" y="110" fill="hsl(var(--foreground) / 0.35)" fontSize="11" fontFamily="'Courier New', monospace" textAnchor="middle" transform="rotate(-90, 30, 110)" style={{ fontStyle: "italic" }}>SORTIE (dB)</text>
    {/* 1:1 line (no compression) */}
    <path d="M80 200 Q280 110 480 20" fill="none" stroke="hsl(var(--foreground) / 0.12)" strokeWidth="1.3" strokeDasharray="5 5" />
    <text x="445" y="42" fill="hsl(var(--foreground) / 0.2)" fontSize="10" fontFamily="'Courier New', monospace" style={{ fontStyle: "italic" }}>1:1</text>
    {/* Threshold point */}
    <circle cx="260" cy="120" r="4" fill="hsl(var(--primary))" opacity="0.75" />
    <line x1="260" y1="200" x2="260" y2="120" stroke="hsl(var(--primary) / 0.25)" strokeWidth="1" strokeDasharray="4 4" />
    <text x="260" y="215" fill="hsl(var(--primary) / 0.55)" fontSize="10" fontFamily="'Courier New', monospace" textAnchor="middle" style={{ fontStyle: "italic" }}>seuil</text>
    {/* Ratio 2:1 */}
    <path d="M80 200 Q170 160 260 120 Q370 95 480 72" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.8" strokeLinecap="round" />
    <text x="492" y="70" fill="hsl(var(--primary))" fontSize="11" fontFamily="'Courier New', monospace" style={{ fontStyle: "italic" }}>2:1</text>
    {/* Ratio 4:1 */}
    <path d="M80 200 Q170 160 260 120 Q370 108 480 96" fill="none" stroke="hsl(var(--secondary))" strokeWidth="1.8" strokeLinecap="round" />
    <text x="492" y="95" fill="hsl(var(--secondary))" fontSize="11" fontFamily="'Courier New', monospace" style={{ fontStyle: "italic" }}>4:1</text>
    {/* Ratio 10:1 */}
    <path d="M80 200 Q170 160 260 120 Q370 115 480 112" fill="none" stroke="hsl(var(--foreground) / 0.45)" strokeWidth="1.8" strokeLinecap="round" />
    <text x="492" y="110" fill="hsl(var(--foreground) / 0.45)" fontSize="11" fontFamily="'Courier New', monospace" style={{ fontStyle: "italic" }}>10:1</text>
    {/* Annotation */}
    <text x="385" y="148" fill="hsl(var(--foreground) / 0.25)" fontSize="10" fontFamily="'Courier New', monospace" textAnchor="middle" style={{ fontStyle: "italic" }}>plus le ratio ↑</text>
    <text x="385" y="163" fill="hsl(var(--foreground) / 0.25)" fontSize="10" fontFamily="'Courier New', monospace" textAnchor="middle" style={{ fontStyle: "italic" }}>plus la réduction ↑</text>
  </svg>
);

const AttackReleaseKneeDiagram = () => (
  <svg viewBox="0 0 620 260" className="w-full max-w-2xl mx-auto my-8" aria-label="Schéma illustrant l'attack, le release et le knee">
    {/* Original waveform envelope */}
    <path
      d="M40 180 Q55 180 65 172 Q75 160 82 140 Q88 105 93 65 Q98 42 103 65 Q108 85 113 105 Q120 135 132 155 Q145 165 160 170 Q175 175 195 178 Q210 180 225 180"
      fill="none"
      stroke="hsl(var(--foreground) / 0.35)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Compressed version - fast attack */}
    <path
      d="M40 180 Q55 180 65 174 Q75 167 82 155 Q88 132 93 102 Q98 88 103 102 Q108 118 113 132 Q120 152 132 162 Q145 170 160 174 Q175 177 195 179 Q210 180 225 180"
      fill="none"
      stroke="hsl(var(--primary))"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Attack bracket */}
    <line x1="85" y1="42" x2="85" y2="52" stroke="hsl(var(--primary) / 0.65)" strokeWidth="1.3" />
    <line x1="85" y1="47" x2="102" y2="47" stroke="hsl(var(--primary) / 0.65)" strokeWidth="1.3" />
    <line x1="102" y1="42" x2="102" y2="52" stroke="hsl(var(--primary) / 0.65)" strokeWidth="1.3" />
    <text x="93" y="38" fill="hsl(var(--primary))" fontSize="11" fontFamily="'Courier New', monospace" textAnchor="middle" style={{ fontStyle: "italic" }}>attack</text>
    {/* Release bracket */}
    <line x1="112" y1="92" x2="112" y2="102" stroke="hsl(var(--secondary) / 0.65)" strokeWidth="1.3" />
    <line x1="112" y1="97" x2="198" y2="97" stroke="hsl(var(--secondary) / 0.65)" strokeWidth="1.3" />
    <line x1="198" y1="92" x2="198" y2="102" stroke="hsl(var(--secondary) / 0.65)" strokeWidth="1.3" />
    <text x="155" y="89" fill="hsl(var(--secondary))" fontSize="11" fontFamily="'Courier New', monospace" textAnchor="middle" style={{ fontStyle: "italic" }}>release</text>
    {/* Legend */}
    <line x1="50" y1="212" x2="72" y2="212" stroke="hsl(var(--foreground) / 0.35)" strokeWidth="1.8" />
    <text x="77" y="216" fill="hsl(var(--foreground) / 0.35)" fontSize="10" fontFamily="'Courier New', monospace" style={{ fontStyle: "italic" }}>original</text>
    <line x1="165" y1="212" x2="187" y2="212" stroke="hsl(var(--primary))" strokeWidth="2.2" />
    <text x="192" y="216" fill="hsl(var(--primary))" fontSize="10" fontFamily="'Courier New', monospace" style={{ fontStyle: "italic" }}>compressé</text>

    {/* KNEE section - right side */}
    <text x="430" y="28" fill="hsl(var(--foreground) / 0.35)" fontSize="12" fontFamily="'Courier New', monospace" textAnchor="middle" style={{ fontStyle: "italic" }}>KNEE</text>
    {/* Hard knee */}
    <path d="M330 180 Q365 180 405 102 Q425 68 490 68" fill="none" stroke="hsl(var(--foreground) / 0.4)" strokeWidth="1.8" strokeLinecap="round" />
    <text x="500" y="66" fill="hsl(var(--foreground) / 0.4)" fontSize="10" fontFamily="'Courier New', monospace" style={{ fontStyle: "italic" }}>hard</text>
    {/* Soft knee */}
    <path d="M330 180 Q380 145 410 110 Q435 85 490 78" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.8" strokeLinecap="round" />
    <text x="500" y="80" fill="hsl(var(--primary))" fontSize="10" fontFamily="'Courier New', monospace" style={{ fontStyle: "italic" }}>soft</text>
    {/* Threshold marker */}
    <circle cx="405" cy="102" r="3.5" fill="hsl(var(--primary) / 0.5)" />
    <text x="405" y="198" fill="hsl(var(--primary) / 0.45)" fontSize="10" fontFamily="'Courier New', monospace" textAnchor="middle" style={{ fontStyle: "italic" }}>seuil</text>
    <line x1="405" y1="185" x2="405" y2="105" stroke="hsl(var(--primary) / 0.18)" strokeWidth="1" strokeDasharray="3 4" />
  </svg>
);

export { SeuilDiagram, RatioDiagram, AttackReleaseKneeDiagram };
