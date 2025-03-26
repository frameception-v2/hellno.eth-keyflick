/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing Next.js config options might be here

  webpack: (config, { isServer }) => {
    // Enable asynchronous WebAssembly
    config.experiments = { ...config.experiments, asyncWebAssembly: true };

    // Ensure WASM files are handled correctly
    config.output.webassemblyModuleFilename = isServer
      ? './../static/wasm/[modulehash].wasm'
      : 'static/wasm/[modulehash].wasm';

    // Ensure loaders ignore WASM files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
