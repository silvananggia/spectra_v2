const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  app.use(
    '/stac',
    createProxyMiddleware({
      target: process.env.STAC_PROXY_TARGET || 'http://192.168.101.173:8082',
      changeOrigin: true,
      pathRewrite: { '^/stac': '' },
    })
  );

  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.API_PROXY_TARGET || 'http://192.168.101.173:8888',
      changeOrigin: true,
    })
  );
};
