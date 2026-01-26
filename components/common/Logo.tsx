import { View, StyleSheet, ImageStyle } from 'react-native';
import { LazyImage } from './LazyImage';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
}

const sizeMap = {
  small: 60,
  medium: 80,
  large: 80,
  xlarge: 150, // 150x150px for auth screens - optimal size (120-160px range)
};

export const Logo: React.FC<LogoProps> = ({ size = 'medium' }) => {
  const logoSize = sizeMap[size];

  return (
    <View style={styles.container}>
      <LazyImage
        source={require('@/assets/authlogo.png')}
        style={[styles.logo, { width: logoSize, height: logoSize, maxWidth: logoSize, maxHeight: logoSize }]}
        resizeMode="contain"
        transparent={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    // Completely transparent container - no borders, no shadows, no background color
    // Will blend perfectly with white screen background
  },
  logo: {
    backgroundColor: 'transparent',
    // Transparent background - logo PNG transparency will show through
    // No default image background rendering
    // Limited to specified size to prevent full-width rendering
  } as ImageStyle,
});
