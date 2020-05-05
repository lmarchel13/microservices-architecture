module.exports = {
  webpackdevMiddleware: (config) => {
    config.watchOptions.poll = 300;
    return config;
  },
};
