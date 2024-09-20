// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const { library, experiments } = require('webpack');
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

// const stylesHandler = 'style-loader';

const config = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'justformit.js',
        library: {
            name: 'justformit',
            //type: 'var'
            type: 'window'
        }
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
        ],
    },
    plugins: [
        new TerserPlugin(),
        new CopyPlugin({
            patterns: [
                { from: 'demo.html', to: "demo.html" },
                { from: 'editors', to: "editors" },
                { from: 'widgets', to: "widgets" },
                { from: 'src/jfi-functions.js', to: "jfi-functions.js" },
                { from: 'src/jfi-strings.en.js', to: "jfi-strings.en.js" },
                { from: 'src/jfi-strings.es.js', to: "jfi-strings.es.js" }
            ]
        })
    ],
    /*module: {
        rules: [
            {
                test: /\.css$/i,
                use: [stylesHandler,'css-loader'],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [stylesHandler, 'css-loader', 'sass-loader'],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            },

            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
        ],
    },*/
    experiments: {
        outputModule: true,
    },
};

module.exports = () => {
    config.mode = 'production';
    config.devtool = 'source-map';
    return config;
};
