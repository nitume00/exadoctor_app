module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@reduxx': './src/reduxx',
          '@containers': './src/containers',
          '@constants/': './src/constants/index',
          '@theme': './src/theme/index',
          '@components': './src/components',
          '@lib': './src/lib',
          '@ui': './src/components/ui',
          '@images': './src/images',
          '@navigation': './src/navigation',
        },
      },
    ],
  ],
};
