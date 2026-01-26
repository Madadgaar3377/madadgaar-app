import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface ProfileIconProps {
  size?: number;
  color?: string;
  filled?: boolean;
}

export const ProfileIcon: React.FC<ProfileIconProps> = ({ 
  size = 24, 
  color = '#666666',
  filled = false 
}) => {
  if (filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="8" r="4" fill={color} />
        <Path
          d="M6 21C6 17.6863 8.68629 15 12 15C15.3137 15 18 17.6863 18 21"
          fill={color}
        />
      </Svg>
    );
  }
  
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="8"
        r="4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M6 21C6 17.6863 8.68629 15 12 15C15.3137 15 18 17.6863 18 21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
};

