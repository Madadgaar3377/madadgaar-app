import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface DashboardIconProps {
    size?: number;
    color?: string;
    filled?: boolean;
}

export const DashboardIcon: React.FC<DashboardIconProps> = ({
    size = 24,
    color = '#666666',
    filled = false,
}) => {
    if (filled) {
        return (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path d="M10 3H3V10H10V3Z" fill={color} />
                <Path d="M21 3H14V10H21V3Z" fill={color} />
                <Path d="M21 14H14V21H21V14Z" fill={color} />
                <Path d="M10 14H3V21H10V14Z" fill={color} />
            </Svg>
        );
    }
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M10 3H3V10H10V3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M21 3H14V10H21V3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M21 14H14V21H21V14Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M10 14H3V21H10V14Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
};
