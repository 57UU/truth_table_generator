const TerserPlugin = require('terser-webpack-plugin');
const { addWebpackPlugin } = require('customize-cra');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


module.exports = function override(config, env) {
  if (env === 'production') {
    config.optimization.minimizer = [
        new TerserPlugin(),
    ];
  }

  //addWebpackPlugin()
  if(false){//load react from cdn
    config.externals = {
        ...config.externals,
        react: 'React',
        'react-dom': 'ReactDOM'
      };
  }
  return config;
};
