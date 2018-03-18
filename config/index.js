// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path')

module.exports = {
  build: {
      // 环境变量
      env: require('./prod.env'),
      // html入口文件
      index: path.resolve(__dirname, '../dist/index.html'),
      // 产品文件的存放路径
      assetsRoot: path.resolve(__dirname, '../dist'),
      // 二级目录，存放静态资源文件的目录，位于dist文件夹下
      assetsSubDirectory: 'zhihu',
      // 发布路径，如果构建后的产品文件有用于发布CDN或者放到其他域名的服务器，可以在这里进行设置
      // 设置之后构建的产品文件在注入到index.html中的时候就会带上这里的发布路径
    assetsPublicPath: '/',
    productionSourceMap: true,
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
      // 是否开启gzip压缩
      productionGzip: false,
      // gzip模式下需要压缩的文件的扩展名，设置js、css之后就只会对js和css文件进行压缩
      productionGzipExtensions: ['js', 'css'],
      // Run the build command with an extra argument to
      // View the bundle analyzer report after build finishes:
      // `npm run build --report`
      // Set to `true` or `false` to always turn it on or off
      // 是否展示webpack构建打包之后的分析报告
      bundleAnalyzerReport: process.env.npm_config_report
  },
  dev: {
    autoOpenBrowser: true,
      env: require('./dev.env'),
    port: 8080,
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {
      '/api': {
        target: 'https://news-at.zhihu.com/api/4',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/'
        }
      }
    },
    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false
  }
}
