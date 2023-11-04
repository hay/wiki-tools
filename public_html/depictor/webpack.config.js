const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const plugins = [];

console.log('NODE_ENV', process.env.NODE_ENV);

if (process.env.NODE_ENV === 'production') {
    plugins.push('babel-plugin-transform-remove-console');
}

module.exports = {
    entry: [
        './js/app.js'
    ],
    module : {
        rules : [
            {
                test : /\.js$/,
                exclude : /node_modules/,
                use : {
                    loader : 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins : plugins
                    }
                }
            },
            {
                test : /\.vue$/,
                loader : 'vue-loader'
            },
            {
                test: /\.css$/,
                use: [
                  'vue-style-loader',
                  'css-loader'
                ]
            }
        ]
    },
    plugins : [
        new VueLoaderPlugin()
    ],
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    output: {
        filename: '../bundle.js',
        path: path.resolve(__dirname, 'js')
    }
};