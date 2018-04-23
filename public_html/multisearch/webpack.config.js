module.exports = {
  entry: './src/main.js',
  output: {
    path: __dirname,
    filename: 'dist.js'
  },
  devtool : 'source-map',
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve : {
    alias : {
      'vue' : 'vue/dist/vue.common.js'
    }
  }
}