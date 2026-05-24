import { CSSProperties } from 'react';

interface IconProps {
  name: string;
  fill?: 0 | 1;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export function Icon({
  name,
  fill = 0,
  size,
  className = '',
  style = {},
}: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        fontSize: size,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
