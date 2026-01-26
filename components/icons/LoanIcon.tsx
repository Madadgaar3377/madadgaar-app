import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface LoanIconProps {
  size?: number;
  color?: string;
  filled?: boolean;
}

export function LoanIcon({ size = 24, color = '#000', filled = false }: LoanIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {filled ? (
        <>
          <Path
            d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z"
            fill={color}
          />
          <Path
            d="M7 15H9V17H7V15ZM11 15H17V17H11V15Z"
            fill={color}
          />
        </>
      ) : (
        <>
          <Path
            d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z"
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M7 15H9V17H7V15ZM11 15H17V17H11V15Z"
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </Svg>
  );
}

