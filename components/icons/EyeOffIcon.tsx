import React from 'react';
import Svg, { Path, Line } from 'react-native-svg';

interface EyeOffIconProps {
  size?: number;
  color?: string;
}

export function EyeOffIcon({ size = 20, color = '#666666' }: EyeOffIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.94 17.94C16.2306 19.243 14.1491 20.4641 12 20.4641C5 20.4641 1 12.4641 1 12.4641C2.24389 10.241 3.96914 8.40711 6 7.28011"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.9 4.24002C10.5883 4.0789 11.2931 3.99836 12 4.00002C19 4.00002 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M1 1L23 23"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 9C9.29513 8.55174 9.69119 8.17301 10.16 7.89001C10.6288 7.60702 11.1575 7.42829 11.707 7.36768C12.2566 7.30707 12.8134 7.36618 13.3408 7.54131C13.8682 7.71644 14.3525 8.00391 14.757 8.38268C15.1615 8.76145 15.4762 9.22229 15.68 9.73001"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

