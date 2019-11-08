const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const devMode = process.env.NODE_ENV !== 'production';
const TerserPlugin = require('terser-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

const overrides = devMode
    ? {
          devServer: {
              historyApiFallback: true
          }
      }
    : {
          devtool: '',
          optimization: {
              minimize: true,
              minimizer: [
                  new TerserPlugin({
                      parallel: true,
                      sourceMap: false,
                      cache: true,
                      terserOptions: {
                          parse: {
                              ecma: 8
                          },
                          compress: {
                              ecma: 5
                          },
                          mangle: {
                              safari10: false
                          },
                          output: {
                              ecma: 5,
                              comments: false,
                              ascii_only: true
                          }
                      }
                  })
              ],
              splitChunks: {
                  chunks: 'all',
                  name: false
              }
          }
      };

const webpackConfig = {
    entry: './src/index.js',
    output: {
        filename: devMode ? '[name].js' : '[name].[hash].js',
        path: path.resolve(__dirname, 'public')
    },
    plugins: [
        new HtmlWebpackPlugin(),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // all options are optional
            filename: devMode ? '[name].css' : '[name].[hash].css',
            chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
            ignoreOrder: false // Enable to remove warnings about conflicting order
        }),
        new OptimizeCssAssetsPlugin(),
        new CleanWebpackPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                    // Translates CSS into CommonJS
                    'css-loader',
                    // Compiles Sass to CSS
                    'sass-loader'
                ]
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.md$/,
                loader: 'frontmatter-markdown-loader'
            }
        ]
    }
};

module.exports = {...webpackConfig, ...overrides};
