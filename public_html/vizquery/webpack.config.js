const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
    entry: [
        './src/polyfills.js',
        './src/main.js'
    ],
    module : {
        rules : [
            {
                test: /\.css$/,
                use : ['vue-style-loader', 'css-loader']
            },
            {
                test : /\.js$/,
                exclude : /node_modules/,
                use : {
                    loader : 'babel-loader'
                }
            },
            {
                test : /\.vue$/,
                loader : 'vue-loader'
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
        filename: './bundle.js',
        path: path.resolve(__dirname, '.')
    }
};