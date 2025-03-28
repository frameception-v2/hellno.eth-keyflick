/** @type {import('next').NextConfig} */
const nextConfig = {
  // Existing configurations might be here...

  // Add the following webpack configuration to enable async WebAssembly
  webpack: (config, { isServer }) => {
    // Required for tiny-secp256k1 and potentially other dependencies
    config.experiments = { ...config.experiments, asyncWebAssembly: true, layers: true };

    // Fixes issue for browser builds (if needed, often layers:true is enough)
    // config.output.webassemblyModuleFilename = isServer
    //   ? '../static/wasm/[modulehash].wasm'
    //   : 'static/wasm/[modulehash].wasm';

    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
