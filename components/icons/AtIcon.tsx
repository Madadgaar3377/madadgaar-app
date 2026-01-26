import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface AtIconProps {
  size?: number;
  color?: string;
}

export function AtIcon({ size = 20, color = '#666666' }: AtIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 12V13C16 14.6569 14.6569 16 13 16C11.3431 16 10 14.6569 10 13V12C10 10.3431 11.3431 9 13 9C14.6569 9 16 10.3431 16 12Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 12H20"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

