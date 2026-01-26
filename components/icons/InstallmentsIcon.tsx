import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface InstallmentsIconProps {
    size?: number;
    color?: string;
    filled?: boolean;
}

export const InstallmentsIcon: React.FC<InstallmentsIconProps> = ({
    size = 24,
    color = '#666666',
    filled = false
}) => {
    if (filled) {
        return (
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path d="M22 6C22 4.89543 21.1046 4 20 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6ZM20 6L20 8H4L4 6H20ZM4 12H20V18H4V12Z" fill={color} />
            </Svg>
        );
    }

    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M22 6C22 4.89543 21.1046 4 20 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6ZM20 6L20 8H4L4 6H20ZM4 12H20V18H4V12ZM7 14H13V16H7V14Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
};
