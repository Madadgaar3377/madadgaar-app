import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const InstallmentCardIcon: React.FC<IconProps> = ({ size = 48, color = '#D32F2F' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="24" cy="24" r="22" fill={color} opacity="0.1" />
      <Path
        d="M32 16H16C14.8954 16 14 16.8954 14 18V30C14 31.1046 14.8954 32 16 32H32C33.1046 32 34 31.1046 34 30V18C34 16.8954 33.1046 16 32 16Z"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M18 20H30M18 24H30M18 28H26"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="24" cy="20" r="1.5" fill={color} />
    </Svg>
  );
};

export const PropertyCardIcon: React.FC<IconProps> = ({ size = 48, color = '#D32F2F' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="24" cy="24" r="22" fill={color} opacity="0.1" />
      <Path
        d="M6 38V18L24 4L42 18V38H28V26H20V38H6Z"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M20 26H28V38H20V26Z"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx="24" cy="20" r="2" fill={color} />
    </Svg>
  );
};

export const LoanCardIcon: React.FC<IconProps> = ({ size = 48, color = '#D32F2F' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="24" cy="24" r="22" fill={color} opacity="0.1" />
      <Path
        d="M32 14H16C14.8954 14 14 14.8954 14 16V32C14 33.1046 14.8954 34 16 34H32C33.1046 34 34 33.1046 34 32V16C34 14.8954 33.1046 14 32 14Z"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M18 18H30M18 22H30M18 26H26"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="30" cy="30" r="3" fill={color} />
      <Path
        d="M28 30L32 30M30 28L30 32"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export const InsuranceCardIcon: React.FC<IconProps> = ({ size = 48, color = '#D32F2F' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="24" cy="24" r="22" fill={color} opacity="0.1" />
      <Path
        d="M24 8L30 12V18C30 24.6274 24.6274 30 18 30H12V24C12 17.3726 17.3726 12 24 12V8Z"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M18 24L22 28L30 20"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="24" cy="24" r="18" stroke={color} strokeWidth="2.5" fill="none" />
    </Svg>
  );
};

