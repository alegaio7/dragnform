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
        filename: 'dragnform.js',
        library: {
            name: 'dragnform',
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
                { from: 'src/dnf-functions.js', to: "dnf-functions.js" },
                { from: 'src/dnf-strings.en.js', to: "dnf-strings.en.js" },
                { from: 'src/dnf-strings.es.js', to: "dnf-strings.es.js" },
                { from: 'src/dnf-icons.js', to: "dnf-icons.js" }
            ]
        })
    ],
    experiments: {
        outputModule: true,
    },
};

module.exports = () => {
    config.mode = 'production';
    config.devtool = 'source-map';
    return config;
};
