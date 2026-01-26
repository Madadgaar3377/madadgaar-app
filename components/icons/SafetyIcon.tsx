import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme';

interface SafetyIconProps {
  size?: number;
  color?: string;
}

export function SafetyIcon({ size = 64, color = colors.accent }: SafetyIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Shield shape with clean design */}
      <Path
        d="M32 6L14 14V28C14 39.5 21.5 49.5 32 54C42.5 49.5 50 39.5 50 28V14L32 6Z"
        fill={color}
        fillOpacity={0.12}
      />
      <Path
        d="M32 6L14 14V28C14 39.5 21.5 49.5 32 54C42.5 49.5 50 39.5 50 28V14L32 6Z"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Checkmark inside shield */}
      <Path
        d="M25 32L29 36L39 26"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

