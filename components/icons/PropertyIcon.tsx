import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface PropertyIconProps {
  size?: number;
  color?: string;
  filled?: boolean;
}

export function PropertyIcon({ size = 24, color = '#000', filled = false }: PropertyIconProps) {
  if (filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3 21V9L12 2L21 9V21H14V14H10V21H3Z"
          fill={color}
        />
        <Path
          d="M10 14H14V21H10V14Z"
          fill={color}
          opacity={0.3}
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 21V9L12 2L21 9V21H14V14H10V21H3Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M10 14H14V21H10V14Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

