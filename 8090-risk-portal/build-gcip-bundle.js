import webpack from 'webpack';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
  mode: 'production',
  entry: './src/gcip-iap-browser.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'gcip-iap-bundle.js',
    library: 'GcipIap',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  externals: {
    'firebase/app': 'firebase',
    'firebase/auth': 'firebase'
  },
  resolve: {
    extensions: ['.js', '.json'],
    fallback: {
      "crypto": false,
      "stream": false,
      "buffer": false,
      "util": false,
      "process": false
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ]
};

export default config;