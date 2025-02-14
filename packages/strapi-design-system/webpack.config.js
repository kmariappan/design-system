const fs = require('fs');
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// Allows to create distinct bundles in the dist folder
// for people wanting to import only specific components such as
// import Button from '@strapi/design-system/Button
const excludedFolders = ['helpers', '.DS_Store'];
const fileNames = fs.readdirSync(path.resolve(__dirname, 'src'));
const entry = fileNames
  .filter((name) => !excludedFolders.includes(name))
  .reduce((acc, curr) => {
    if (curr.includes('.js')) {
      acc[curr.replace('.js', '')] = path.resolve(__dirname, 'src');
    } else {
      // Folder resolution
      acc[curr] = path.resolve(__dirname, 'src', curr);
    }

    return acc;
  }, {});

// Plugin section
const analyzePlugins = [];

if (process.env.BUNDLE_ANALYZE) {
  analyzePlugins.push(new BundleAnalyzerPlugin());
}

module.exports = {
  entry,
  mode: process.env.NODE_ENV,
  devtool: process.env.NODE_ENV === 'development' ? 'eval-source-map' : false,
  output: {
    filename: `[name].${process.env.NODE_ENV}.js`,
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    globalObject: 'this',
    library: 'strapiDs',
    umdNamedDefine: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/(node_modules)/],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.(png|jpg|svg)$/i,
        use: [
          {
            loader: 'url-loader',
          },
        ],
      },
    ],
  },
  plugins: [].concat(analyzePlugins),
  externals: [
    {
      react: 'react',
      'react-dom': 'react-dom',
      'styled-components': 'styled-components',
    },
    /^@strapi\/icons/,
  ],
  resolve: {
    alias: {
      '@strapi/icons': path.dirname(require.resolve('../strapi-icons/dist')),
    },
  },
};
