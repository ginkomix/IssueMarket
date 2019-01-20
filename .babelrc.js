const presets = [
  [
    '@babel/preset-env',
    {
      targets: '> 2%, not dead',
      useBuiltIns: 'usage',
      modules: false,
    },
  ],
  '@babel/preset-react',
];

const plugins = [
  '@babel/plugin-proposal-class-properties',
];

module.exports = { presets, plugins };