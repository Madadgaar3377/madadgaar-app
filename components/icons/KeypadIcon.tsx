import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface KeypadIconProps {
  size?: number;
  color?: string;
}

export function KeypadIcon({ size = 20, color = '#666666' }: KeypadIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="2" width="6" height="6" rx="1" stroke={color} strokeWidth="2" />
      <Rect x="9" y="2" width="6" height="6" rx="1" stroke={color} strokeWidth="2" />
      <Rect x="16" y="2" width="6" height="6" rx="1" stroke={color} strokeWidth="2" />
      <Rect x="2" y="9" width="6" height="6" rx="1" stroke={color} strokeWidth="2" />
      <Rect x="9" y="9" width="6" height="6" rx="1" stroke={color} strokeWidth="2" />
      <Rect x="16" y="9" width="6" height="6" rx="1" stroke={color} strokeWidth="2" />
      <Rect x="2" y="16" width="6" height="6" rx="1" stroke={color} strokeWidth="2" />
      <Rect x="9" y="16" width="6" height="6" rx="1" stroke={color} strokeWidth="2" />
      <Rect x="16" y="16" width="6" height="6" rx="1" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

