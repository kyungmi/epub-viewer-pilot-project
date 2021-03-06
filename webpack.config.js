const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/client/index.tsx',
  output: {
    path: `${__dirname}`,
    filename: './public/js/bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(tsx?)|(jsx?)$/,
        loader: 'babel-loader',
        exclude: [/node_modules/],
      },
    ],
  },
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api/**': 'http://localhost:8080',
      changeOrigin: true,
    },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
