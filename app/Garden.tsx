export default function Garden({
  health,
  large = false,
}: {
  health: number;
  large?: boolean;
}) {
  const count = Math.max(1, Math.round(health / 12));
  return (
    <div
      className={"garden-scene " + (large ? "garden-large" : "")}
      role="img"
      aria-label={`Garden vitality ${health} percent. ${count} flowers in bloom. Other plants are wilted and can recover.`}
    >
      <svg viewBox="0 0 600 300">
        <defs>
          <linearGradient id="sky" x2="0" y2="1">
            <stop stopColor="#bceff1" />
            <stop offset="1" stopColor="#ecfcfc" />
          </linearGradient>
        </defs>
        <rect width="600" height="300" rx="24" fill="url(#sky)" />
        <circle cx="485" cy="65" r="31" fill="#ffd477" />
        <path
          d="M50 80h75m-45-10h65M330 45h60"
          stroke="#fff"
          strokeWidth="15"
          strokeLinecap="round"
        />
        <ellipse cx="300" cy="236" rx="255" ry="43" fill="#c7d7be" />
        <path d="M65 229Q300 162 535 229v24Q300 318 65 253Z" fill="#708d65" />
        <ellipse cx="300" cy="229" rx="235" ry="44" fill="#9fbd80" />
        {Array.from({ length: 8 }, (_, i) => {
          const x = 125 + (i % 4) * 115,
            y = 218 + Math.floor(i / 4) * 32,
            alive = i < count;
          return (
            <g key={i} transform={`translate(${x},${y})`}>
              <path
                d={alive ? "M0 0Q-4-33 0-60" : "M0 0Q8-36 20-30"}
                stroke={alive ? "#4a7553" : "#8f8974"}
                strokeWidth="5"
                fill="none"
              />
              <ellipse
                cx="-10"
                cy="-22"
                rx="14"
                ry="6"
                transform="rotate(30 -10 -22)"
                fill={alive ? "#477c58" : "#9d987c"}
              />
              <g
                transform={
                  alive ? "translate(0,-62)" : "translate(23,-27) rotate(75)"
                }
              >
                {[0, 60, 120, 180, 240, 300].map((a) => (
                  <ellipse
                    key={a}
                    cy="-10"
                    rx="7"
                    ry="12"
                    transform={`rotate(${a})`}
                    fill={
                      alive
                        ? ["#f48b7d", "#7289d9", "#fff1b7", "#c8a3de"][i % 4]
                        : "#b5ad99"
                    }
                  />
                ))}
                <circle r="6" fill={alive ? "#ffd261" : "#93846b"} />
              </g>
            </g>
          );
        })}
        <path d="M260 250q40-20 80 0l-8 24h-63Z" fill="#e4d7bc" />
        <text
          x="300"
          y="275"
          textAnchor="middle"
          fill="#5a6958"
          fontSize="10"
          letterSpacing="2"
        >
          YOUR LITTLE WORLD
        </text>
      </svg>
    </div>
  );
}
