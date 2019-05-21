const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/client/index.jsx',
  output: {
    path: `${__dirname}`,
    filename: './public/js/bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: [/node_modules/],
        query: {
          presets: [
            '@babel/preset-env',
            '@babel/preset-react',
          ],
          plugins: [
            ['@babel/plugin-proposal-class-properties', { loose: false }],
            ['@babel/plugin-proposal-object-rest-spread', { useBuiltIns: true }],
            ['@babel/plugin-transform-classes', { loose: true }],
            ['@babel/plugin-transform-proto-to-assign'],
            ['@babel/plugin-transform-runtime'],
          ],
        },
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
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
