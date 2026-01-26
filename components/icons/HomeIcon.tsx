import React from 'react';
import Svg, { Path, G, Circle } from 'react-native-svg';

interface HomeIconProps {
  size?: number;
  color?: string;
  filled?: boolean;
}

export const HomeIcon: React.FC<HomeIconProps> = ({ 
  size = 24, 
  color = '#666666',
  filled = false 
}) => {
  if (filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Grid/App icon design */}
        <Path
          d="M4 4H10V10H4V4Z"
          fill={color}
        />
        <Path
          d="M14 4H20V10H14V4Z"
          fill={color}
        />
        <Path
          d="M4 14H10V20H4V14Z"
          fill={color}
        />
        <Path
          d="M14 14H20V20H14V14Z"
          fill={color}
        />
        <Circle
          cx="12"
          cy="12"
          r="1.5"
          fill={color}
          opacity="0.3"
        />
      </Svg>
    );
  }
  
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Grid/App icon design */}
      <Path
        d="M4 4H10V10H4V4Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M14 4H20V10H14V4Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M4 14H10V20H4V14Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M14 14H20V20H14V14Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle
        cx="12"
        cy="12"
        r="1.5"
        fill={color}
      />
    </Svg>
  );
};

