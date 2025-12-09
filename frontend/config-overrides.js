const path = require('path');

module.exports = function override(config, env) {
  // Otimizações para produção
  if (env === 'production') {
    // Desabilitar source maps em produção (já está no script, mas garantindo aqui)
    config.devtool = false;
    
    // Otimizar chunk splitting
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk para Material-UI
          mui: {
            name: 'mui',
            test: /[\\/]node_modules[\\/](@mui|@material-ui)[\\/]/,
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Vendor chunk para React
          react: {
            name: 'react-vendor',
            test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
            priority: 30,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Vendor chunk para outras libs grandes
          largeLibs: {
            name: 'large-libs',
            test: /[\\/]node_modules[\\/](socket\.io-client|axios|chart\.js|react-pdf|react-flow-renderer|reactflow|xlsx|moment)[\\/]/,
            priority: 15,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Chunk para bibliotecas de UI
          uiLibs: {
            name: 'ui-libs',
            test: /[\\/]node_modules[\\/](react-toastify|react-modal|react-dropzone|react-icons|emoji-mart)[\\/]/,
            priority: 12,
            reuseExistingChunk: true,
          },
          // Chunk comum para código compartilhado
          common: {
            name: 'common',
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      },
      // Minimizar código
      minimize: true,
      // Tree shaking mais agressivo
      usedExports: true,
      sideEffects: false,
      // Otimizar módulos
      moduleIds: 'deterministic',
      chunkIds: 'deterministic',
    };

    // Otimizar resolução de módulos
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        // Evitar duplicação de React
        'react': path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      },
      // Otimizar extensões
      extensions: ['.js', '.jsx', '.json'],
    };

    // Reduzir informações de build
    config.stats = {
      ...config.stats,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false,
      colors: true,
      warnings: false,
    };

    // Otimizar performance
    config.performance = {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    };
  }

  // Otimizações para desenvolvimento também
  if (env === 'development') {
    // Cache mais agressivo em desenvolvimento
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
      cacheDirectory: path.resolve(__dirname, 'node_modules/.cache'),
    };

    // Otimizar rebuilds
    config.optimization = {
      ...config.optimization,
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false,
    };
  }

  return config;
};

