module.exports = {
  entry: './src/main.js',
  output: {
    path: __dirname,
    filename: 'dist.js'
  },
  module: {
    rules: [
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