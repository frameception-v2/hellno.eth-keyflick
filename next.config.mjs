/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Or your existing config options
  // Add the webpack configuration here:
  webpack: (config, { isServer, dev, buildId, config: nextConfigInstance, defaultLoaders, webpack }) => {
    // Enable experimental asyncWebAssembly and layers
    // layers is often needed together with asyncWebAssembly
    config.experiments = { ...config.experiments, asyncWebAssembly: true, layers: true };

    // Optional: Rule to handle .wasm files if needed, though asyncWebAssembly often suffices
    // config.module.rules.push({
    //   test: /\.wasm$/,
    //   type: 'webassembly/async',
    // });

    // Important: return the modified config
    return config;
  },
  // Any other existing configurations should remain here
};

export default nextConfig;
