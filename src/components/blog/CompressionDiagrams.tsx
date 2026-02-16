const SeuilDiagram = () => (
  <svg viewBox="0 0 600 220" className="w-full max-w-2xl mx-auto my-6" aria-label="Schéma illustrant le seuil de compression">
    {/* Waveform */}
    <path
      d="M30 140 Q45 140 50 100 Q55 60 60 90 Q65 120 70 80 Q75 40 80 70 Q85 100 90 50 Q95 30 100 60 Q105 90 110 110 Q115 130 120 100 Q125 70 130 45 Q135 20 140 55 Q145 90 150 120 Q155 140 160 130 Q165 120 170 85 Q175 50 180 35 Q185 20 190 50 Q195 80 200 110 Q205 135 210 140 Q215 145 220 130 Q225 115 230 90 Q235 65 240 50 Q245 35 250 60 Q255 85 260 110 Q265 130 270 140 Q275 150 280 135 Q285 120 290 100 Q295 80 300 65 Q305 50 310 70 Q315 90 320 110 Q325 125 330 140 Q335 150 340 140 Q345 130 350 115 Q355 100 360 80 Q365 60 370 45 Q375 30 380 55 Q385 80 390 100 Q395 120 400 135 Q405 145 410 140 Q415 135 420 120 Q425 105 430 85 Q435 65 440 50 Q445 40 450 60 Q455 80 460 100 Q465 120 470 135 Q475 145 480 140 Q485 135 490 125 Q495 115 500 130 Q505 140 510 140 Q515 140 520 140 Q525 140 530 140 Q535 140 540 140 Q545 140 550 140 Q555 140 560 140 Q565 140 570 140"
      fill="none"
      stroke="hsl(var(--foreground) / 0.5)"
      strokeWidth="2"
      strokeLinecap="round"
      style={{ filter: "url(#sketch)" }}
    />
    {/* Parts above threshold highlighted */}
    <clipPath id="aboveThreshold">
      <rect x="0" y="0" width="600" height="80" />
    </clipPath>
    <path
      d="M30 140 Q45 140 50 100 Q55 60 60 90 Q65 120 70 80 Q75 40 80 70 Q85 100 90 50 Q95 30 100 60 Q105 90 110 110 Q115 130 120 100 Q125 70 130 45 Q135 20 140 55 Q145 90 150 120 Q155 140 160 130 Q165 120 170 85 Q175 50 180 35 Q185 20 190 50 Q195 80 200 110 Q205 135 210 140 Q215 145 220 130 Q225 115 230 90 Q235 65 240 50 Q245 35 250 60 Q255 85 260 110 Q265 130 270 140 Q275 150 280 135 Q285 120 290 100 Q295 80 300 65 Q305 50 310 70 Q315 90 320 110 Q325 125 330 140 Q335 150 340 140 Q345 130 350 115 Q355 100 360 80 Q365 60 370 45 Q375 30 380 55 Q385 80 390 100 Q395 120 400 135 Q405 145 410 140 Q415 135 420 120 Q425 105 430 85 Q435 65 440 50 Q445 40 450 60 Q455 80 460 100 Q465 120 470 135 Q475 145 480 140"
      fill="none"
      stroke="hsl(var(--primary))"
      strokeWidth="2.5"
      strokeLinecap="round"
      clipPath="url(#aboveThreshold)"
      style={{ filter: "url(#sketch)" }}
    />
    {/* Threshold line */}
    <line x1="20" y1="80" x2="580" y2="80" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.8" />
    {/* Label */}
    <text x="540" y="72" fill="hsl(var(--primary))" fontSize="13" fontFamily="monospace" textAnchor="end" opacity="0.9">SEUIL</text>
    {/* Arrows showing "compressed zone" */}
    <text x="300" y="30" fill="hsl(var(--primary) / 0.6)" fontSize="11" fontFamily="monospace" textAnchor="middle">↑ zone compressée</text>
    <text x="300" y="200" fill="hsl(var(--foreground) / 0.3)" fontSize="11" fontFamily="monospace" textAnchor="middle">signal non affecté</text>
    {/* Sketch filter */}
    <defs>
      <filter id="sketch">
        <feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" />
      </filter>
    </defs>
  </svg>
);

const RatioDiagram = () => (
  <svg viewBox="0 0 600 240" className="w-full max-w-2xl mx-auto my-6" aria-label="Schéma illustrant le ratio de compression">
    {/* Axes */}
    <line x1="80" y1="200" x2="560" y2="200" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="1.5" />
    <line x1="80" y1="200" x2="80" y2="20" stroke="hsl(var(--foreground) / 0.3)" strokeWidth="1.5" />
    {/* Axis labels */}
    <text x="320" y="232" fill="hsl(var(--foreground) / 0.4)" fontSize="11" fontFamily="monospace" textAnchor="middle">ENTRÉE (dB)</text>
    <text x="30" y="110" fill="hsl(var(--foreground) / 0.4)" fontSize="11" fontFamily="monospace" textAnchor="middle" transform="rotate(-90, 30, 110)">SORTIE (dB)</text>
    {/* 1:1 line (no compression) */}
    <line x1="80" y1="200" x2="480" y2="20" stroke="hsl(var(--foreground) / 0.15)" strokeWidth="1.5" strokeDasharray="4 4" />
    <text x="440" y="45" fill="hsl(var(--foreground) / 0.25)" fontSize="10" fontFamily="monospace">1:1</text>
    {/* Threshold point */}
    <circle cx="260" cy="120" r="4" fill="hsl(var(--primary))" opacity="0.8" />
    <line x1="260" y1="200" x2="260" y2="120" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1" strokeDasharray="4 4" />
    <text x="260" y="215" fill="hsl(var(--primary) / 0.6)" fontSize="10" fontFamily="monospace" textAnchor="middle">seuil</text>
    {/* Ratio 2:1 */}
    <path d="M80 200 L260 120 L480 70" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" style={{ filter: "url(#sketch2)" }} />
    <text x="490" y="68" fill="hsl(var(--primary))" fontSize="11" fontFamily="monospace">2:1</text>
    {/* Ratio 4:1 */}
    <path d="M80 200 L260 120 L480 95" fill="none" stroke="hsl(var(--secondary))" strokeWidth="2" strokeLinecap="round" style={{ filter: "url(#sketch2)" }} />
    <text x="490" y="93" fill="hsl(var(--secondary))" fontSize="11" fontFamily="monospace">4:1</text>
    {/* Ratio 10:1 */}
    <path d="M80 200 L260 120 L480 110" fill="none" stroke="hsl(var(--foreground) / 0.5)" strokeWidth="2" strokeLinecap="round" style={{ filter: "url(#sketch2)" }} />
    <text x="490" y="108" fill="hsl(var(--foreground) / 0.5)" fontSize="11" fontFamily="monospace">10:1</text>
    {/* Annotation */}
    <text x="380" y="145" fill="hsl(var(--foreground) / 0.3)" fontSize="10" fontFamily="monospace" textAnchor="middle">plus le ratio ↑</text>
    <text x="380" y="160" fill="hsl(var(--foreground) / 0.3)" fontSize="10" fontFamily="monospace" textAnchor="middle">plus la réduction ↑</text>
    <defs>
      <filter id="sketch2">
        <feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
      </filter>
    </defs>
  </svg>
);

const AttackReleaseKneeDiagram = () => (
  <svg viewBox="0 0 600 260" className="w-full max-w-2xl mx-auto my-6" aria-label="Schéma illustrant l'attack, le release et le knee">
    {/* Waveform envelope */}
    <path
      d="M40 180 L40 180 Q60 180 70 170 Q80 160 85 140 Q90 100 95 60 Q100 40 105 60 Q110 80 115 100 Q120 130 130 150 Q140 160 155 165 Q170 170 185 175 Q200 178 220 180"
      fill="none"
      stroke="hsl(var(--foreground) / 0.4)"
      strokeWidth="2"
      strokeLinecap="round"
      style={{ filter: "url(#sketch3)" }}
    />
    {/* Compressed version - fast attack */}
    <path
      d="M40 180 L40 180 Q60 180 70 172 Q80 165 85 155 Q90 130 95 100 Q100 85 105 100 Q110 115 115 130 Q120 150 130 160 Q140 167 155 172 Q170 176 185 178 Q200 179 220 180"
      fill="none"
      stroke="hsl(var(--primary))"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ filter: "url(#sketch3)" }}
    />
    {/* Attack bracket */}
    <line x1="85" y1="45" x2="85" y2="55" stroke="hsl(var(--primary) / 0.7)" strokeWidth="1.5" />
    <line x1="85" y1="50" x2="100" y2="50" stroke="hsl(var(--primary) / 0.7)" strokeWidth="1.5" />
    <line x1="100" y1="45" x2="100" y2="55" stroke="hsl(var(--primary) / 0.7)" strokeWidth="1.5" />
    <text x="92" y="42" fill="hsl(var(--primary))" fontSize="11" fontFamily="monospace" textAnchor="middle">attack</text>
    {/* Release bracket */}
    <line x1="110" y1="95" x2="110" y2="105" stroke="hsl(var(--secondary) / 0.7)" strokeWidth="1.5" />
    <line x1="110" y1="100" x2="195" y2="100" stroke="hsl(var(--secondary) / 0.7)" strokeWidth="1.5" />
    <line x1="195" y1="95" x2="195" y2="105" stroke="hsl(var(--secondary) / 0.7)" strokeWidth="1.5" />
    <text x="152" y="93" fill="hsl(var(--secondary))" fontSize="11" fontFamily="monospace" textAnchor="middle">release</text>
    {/* Legend */}
    <line x1="50" y1="210" x2="70" y2="210" stroke="hsl(var(--foreground) / 0.4)" strokeWidth="2" />
    <text x="75" y="214" fill="hsl(var(--foreground) / 0.4)" fontSize="10" fontFamily="monospace">original</text>
    <line x1="160" y1="210" x2="180" y2="210" stroke="hsl(var(--primary))" strokeWidth="2.5" />
    <text x="185" y="214" fill="hsl(var(--primary))" fontSize="10" fontFamily="monospace">compressé</text>

    {/* KNEE section - right side */}
    {/* Soft knee curve */}
    <text x="420" y="30" fill="hsl(var(--foreground) / 0.4)" fontSize="12" fontFamily="monospace" textAnchor="middle">KNEE</text>
    {/* Hard knee */}
    <path d="M320 180 L400 100 L480 70" fill="none" stroke="hsl(var(--foreground) / 0.5)" strokeWidth="2" strokeLinecap="round" style={{ filter: "url(#sketch3)" }} />
    <text x="490" y="68" fill="hsl(var(--foreground) / 0.5)" fontSize="10" fontFamily="monospace">hard</text>
    {/* Soft knee */}
    <path d="M320 180 Q380 120 400 105 Q420 90 480 80" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" style={{ filter: "url(#sketch3)" }} />
    <text x="490" y="82" fill="hsl(var(--primary))" fontSize="10" fontFamily="monospace">soft</text>
    {/* Threshold marker */}
    <circle cx="400" cy="100" r="3" fill="hsl(var(--primary) / 0.5)" />
    <text x="400" y="195" fill="hsl(var(--primary) / 0.5)" fontSize="10" fontFamily="monospace" textAnchor="middle">seuil</text>
    <line x1="400" y1="180" x2="400" y2="105" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1" strokeDasharray="3 3" />

    <defs>
      <filter id="sketch3">
        <feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
      </filter>
    </defs>
  </svg>
);

export { SeuilDiagram, RatioDiagram, AttackReleaseKneeDiagram };
