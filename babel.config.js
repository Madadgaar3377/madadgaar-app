module.exports = function(api) {
  api.cache(true);
  const isProduction = api.env('production');
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
          },
        },
      ],
      // Remove console logs in production builds
      ...(isProduction ? [['transform-remove-console', { exclude: ['error', 'warn'] }]] : []),
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};

