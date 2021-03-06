module.exports.files = {
  stylesheets: { joinTo: 'app.css' }
  , javascripts: {
    entryPoints: {
      'app/client.js': 'app.js'
      , 'app/edge-worker-verify.js': '../.cloudflare/workers/verify/index.js'
    }
  }
};

module.exports.watcher = {
	usePolling: true
};

module.exports.plugins = {
  
  babel: {
    presets: ['@babel/preset-env', ['minify', {builtIns: false}]],
    plugins: ["@babel/plugin-proposal-class-properties", "macros"]
  },

  preval: {
    tokens: {
      BUILD_TIME:  Date.now() / 1000
      , BUILD_TAG: process.env.ENV_LOCK_TAG || 'notag'
      , BUILD_LOCALTIME: new Date
    }
    , log: true
  },

  raw: {
    pattern: /\.(jss|html|php|tmp|svg)/,
    wrapper: content => `module.exports = ${JSON.stringify(content)}`
  }

};

module.exports.modules = { autoRequire: {
  '../.cloudflare/workers/verify/index.js': ['edge-worker-verify']
  , 'app.js': ['client']
}};

module.exports.paths = {
  public: './docs'
};
