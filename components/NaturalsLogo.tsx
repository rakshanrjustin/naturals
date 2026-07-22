export default function NaturalsLogo({
  className = '',
  color = '#5B2A6F',
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 315 95"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Naturals — World's fastest growing salon chain"
    >
      <g transform="translate(6, 0)">
        <text
          x="8"
          y="68"
          fontFamily="'Arial Black', 'Arial Bold', Arial, sans-serif"
          fontWeight="900"
          fontSize="58"
          fill={color}
          letterSpacing="-2"
        >
          naturals
        </text>

        {/* Leaf / swoosh above the 'l' */}
        <path
          d="M 230 53 C 226 33 235 14 250 6 C 258 20 253 41 230 53Z"
          fill={color}
        />

        {/* ® mark */}
        <text
          x="280"
          y="28"
          fontFamily="Arial, sans-serif"
          fontSize="15"
          fill={color}
        >
          ®
        </text>
      </g>

      {/* Tagline */}
      <text
        x="157.5"
        y="87"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="10.5"
        fill={color}
        letterSpacing="0.4"
      >
        World&apos;s fastest growing salon chain
      </text>
    </svg>
  );
}
