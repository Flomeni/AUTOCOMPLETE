const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const { env } = require('process');

const RULES = [
    {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
    },
    {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
    },
    {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
    },
    {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
                "@babel/plugin-proposal-class-properties"
            ]
          }
        }
    }
];

const PLUGINS = [
    new HtmlWebpackPlugin({
        title: 'Infinite scrolling',
        template: './src/index.html',
        inject: 'body'
    }),
    // new CopyPlugin({
    //     patterns: [
    //         {
    //             from: './assets/*',
    //             to: 'assets'
    //         }
    //     ]
    // })
];

const exports_obj = {
    entry: ["@babel/polyfill", './src/index.js'],
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    plugins: PLUGINS,
    module: {
        rules: RULES
    }
};

if (env.production) {
    Object.assign(exports_obj, {
        optimization: {
            splitChunks: {
              chunks: 'all',
            },
        }
    });
} else {
    Object.assign(exports_obj, {
        devtool: 'inline-source-map',
        devServer: {
            contentBase: './dist',
        }
    }); 
}

module.exports = exports_obj;