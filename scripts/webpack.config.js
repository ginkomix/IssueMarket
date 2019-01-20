const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebappWebpackPlugin = require('webapp-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const WDS_HOST = 'localhost';
const WDS_PORT = 8080;

const DIR_DIST = 'dist/';
const DIR_ASSETS = 'assets/';

const resolve = (dir) => path.resolve(__dirname, '..', dir);

module.exports = function build(env, args) {
  args = args || {};

  const NODE_ENV = (process.env.NODE_ENV || '').trim() || 'development';
  const BUILD_NUMBER = (process.env.BUILD_NUMBER || '').trim() || 'unknown';

  const IS_PROD = args.p || NODE_ENV === 'production';
  const CONFIG = IS_PROD ? {
    serverUrl: '',
    version: BUILD_NUMBER,
  } : {
      serverUrl: 'http://82.209.218.191:13040',
      version: 'dev',
    };

  const PROJECTS = [
    {
      name: 'src',
      entry: './src/scripts/app.js',
      index: './src/index.html',
      favicon: './src/img/favicon.png',
      output: DIR_DIST + 'src',
    }
  ];

  return PROJECTS.map((project) => {
    const config = {
      mode: 'development',

      entry: project.entry,
      output: {
        path: resolve(project.output),
        publicPath: './',
      },

      resolve: {
        alias: {
          $app: resolve(`${project.name}/scripts`),
          $img: resolve(`${project.name}/img`),
          $styles: resolve(`${project.name}/styles`),
        },
      },

      module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: [{
              loader: 'babel-loader',
            }],
          },

          {
            test: /\.css$/,
            use: [
              'style-loader',
              'css-loader',
            ],
          },

          {
            test: /\.(scss|sass)$/,
            use: [
              'style-loader',
              'css-loader',
              'sass-loader',
            ],
          },

          {
            test: /\.(ico|png|svg|jpg|gif|woff|woff2|ttf|eot|otf)$/,
            use: [{
              loader: 'file-loader',
              options: {
                outputPath: DIR_ASSETS,
              },
            }],
          },
        ],
      },

      plugins: [
        new webpack.DefinePlugin({
          'process.env': {
            APP_NAME: JSON.stringify(project.name),
            API_ENDPOINT: JSON.stringify(CONFIG.serverUrl + '/api/' + project.name),
            VERSION: JSON.stringify(CONFIG.version),
            NODE_ENV: JSON.stringify(NODE_ENV),
          },
        }),
        new HtmlWebpackPlugin({
          template: project.index,
          filename: 'index.html',

          VERSION: CONFIG.version,
          SERVER_URL: CONFIG.serverUrl,
        }),
      ],
    };

    if (project.copy) {
      config.plugins.push(new CopyWebpackPlugin(project.copy));
    }

    if (IS_PROD) {
      config.devtool = 'source-map';

      if (project.favicon) {
        config.plugins.push(new WebappWebpackPlugin({
          logo: project.favicon,
          prefix: DIR_ASSETS,
          favicons: {
            icons: {
              android: false,
              appleIcon: false,
              appleStartup: false,
              coast: false,
              favicons: true,
              firefox: false,
              opengraph: false,
              twitter: false,
              yandex: false,
              windows: false,
            },
          },
        }));
      }
    } else {
      config.devtool = 'inline-source-map';
      config.watchOptions = {
        aggregateTimeout: 300,
        poll: 1000,
        ignored: /node_modules/,
      };
      config.devServer = {
        contentBase: resolve(DIR_DIST),
        publicPath: `http://${WDS_HOST}:${WDS_PORT}`,
        hot: true,
        disableHostCheck: true,
        historyApiFallback: true,
        host: WDS_HOST,
        port: WDS_PORT,
        overlay: true,
      };

      config.plugins.push(new webpack.HotModuleReplacementPlugin());
    }

    return config;
  });
};
