var path = require('path');

var minimist = require('minimist');
var webpack = require('webpack');
var TARGET = minimist(process.argv.slice(2)).TARGET || 'PROD';


var config = {

    context: __dirname + '/app',
    entry: [
        './scripts/app.js'
    ],

    resolve: {
        root: [path.join(__dirname, "/"), path.join(__dirname, "/node_modules")]
    },

    module: {
        loaders: [
            {test: /.*\.js$/, exclude: /node_modules/, loader: "babel-loader",
                query: {
                    presets: ['es2015']
                }
            },
            {test: /\.css$/, loader: "style!css"},
            {test: /\.json$/, loader: "json"},
            {test: /\.html$/, exclude: /node_modules/, loader: "raw"},
            {test: /\.woff(2)?.*/, loader: "url?limit=10000&minetype=application/font-woff"},
            {test: /\.(ttf|eot|svg).*/, loader: "file"},
            {test: /\.(png|jpg|gif)$/, loader: 'url?limit=8192'}
        ]
    },

    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: false,
            mangle: false
        })
    ],

    devServer: {
        contentBase: "./app",
        quiet: false,
        noInfo: false,
        stats: {colors: true},
        hot: true,
        port: 3000
    },

    devtool: "eval-source-map"

};

module.exports = config;