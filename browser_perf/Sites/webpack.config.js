module.exports = {
  entry: './src/app/index.js',
  output: {
    filename: './dist/app/bundle.js'
  },
  module: {
    loaders:[
      { test: /\.html$/, loader: 'html-loader'},
      {
        test: __dirname + '/src/lib/jquery.js',
        loader: 'exports?window.$'
      }
    ]
  }
};