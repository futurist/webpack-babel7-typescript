const path = require('path')
const autoprefixer = require('autoprefixer')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const project = require('./project.config.js')

const isProduction = project.env === 'production'

const config = {
  context: project.src,
  entry: {
    main: './index.tsx'
  },
  output: {
    path: project.dist,
    filename: isProduction ? 'js/[name].[chunkhash].js' : 'js/[name].js',
    chunkFilename: isProduction ? 'js/[name].[contenthash].js' : 'js/[name].js',
    publicPath: project.public
  },
  mode: project.env,
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
    modules: [project.src, 'node_modules']
  },
  module: {
    rules: [{
      oneOf: [
        // css && less
        {
          test: /(\.less|\.css)$/,
          use: [
            isProduction ?
            MiniCssExtractPlugin.loader : {
              loader: 'style-loader'
            },
            {
              loader: 'css-loader',
              options: isProduction ? {
                importLoaders: 1,
                minimize: {
                  autoprefixer: {
                    add: true,
                    remove: true,
                    browsers: ['last 2 versions']
                  },
                  discardComments: {
                    removeAll: true
                  },
                  discardUnused: false,
                  mergeIdents: false,
                  reduceIdents: false,
                  safe: true
                }
              } : {}
            },
            {
              loader: require.resolve('postcss-loader'),
              options: {
                ident: 'postcss',
                plugins: () => [
                  require('postcss-flexbugs-fixes'),
                  autoprefixer({
                    browsers: [
                      '>1%',
                      'last 4 versions',
                      'Firefox ESR',
                      'not ie < 9', // React doesn't support IE8 anyway
                    ],
                    flexbox: 'no-2009',
                  }),
                ],
              },
            },
            {
              loader: 'less-loader',
              options: {
                javascriptEnabled: true
              }
            }
          ].filter(Boolean)
        },
        // js && ts
        {
          test: /(jsx?|tsx?|mjs)$/i,
          include: project.src,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader?cacheDirectory'
          }
        },
        // resources
        {
          test: /\.(png|jpg|gif|woff|woff2|eot|ttf|otf|svg)$/,
          use: {
            loader: 'url-loader',
            options: {
              name: 'media/[name].[hash:8].[ext]',
              limit: 10000,
            }
          }
        },
        {
          loader: require.resolve('file-loader'),
          exclude: [/\.(js|jsx|mjs|ts|tsx)$/, /\.html$/, /\.json$/],
          options: {
            name: 'media/[name].[hash:8].[ext]',
          },
        },
      ]
    }]
  },
  plugins: [
    isProduction && new MiniCssExtractPlugin({
      filename: 'css/main.[chunkhash].css',
      chunkFilename: 'css/main.[contenthash:5].css'
    }),
    isProduction && new CopyWebpackPlugin([{
      from: path.join(project.src, 'static'),
      to: path.join(project.dist)
    }]),
    new HtmlWebpackPlugin({
      template: path.join(project.src, 'static/index.html'),
      inject: true,
      // favicon: path.join(project.src, 'static/favicon.ico'),
      minify: {
        collapseWhitespace: true
      }
    })
  ].filter(Boolean),
  optimization: {
    sideEffects: true,
    splitChunks: {
      chunks: 'all',
      minSize: 30000,
      minChunks: 1,
    }
  }
}

module.exports = config
