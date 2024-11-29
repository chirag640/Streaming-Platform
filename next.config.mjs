/** @type {import('next').NextConfig} */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initSocket } from './src/lib/socket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add ESM support
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        dns: false,
        tls: false,
        fs: false,
      };
    }
    
    // Add error handling plugin
    config.plugins = config.plugins || [];
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.done.tap('ErrorHandler', (stats) => {
          if (stats.hasErrors()) {
            console.error(stats.toString('errors-only'));
          }
        });
      },
    });
    
    return config;
  },
  images: {
    domains: [
      process.env.AWS_S3_BUCKET + '.s3.' + process.env.AWS_REGION + '.amazonaws.com'
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
  experimental: {
    outputFileTracingRoot: process.cwd(),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverOptions: {
    port: process.env.PORT || 3000,
  },
};

const findAvailablePort = async (startPort) => {
  let port = startPort;
  while (true) {
    try {
      await new Promise((resolve, reject) => {
        const server = createServer()
          .listen(port, () => {
            server.close();
            resolve();
          })
          .on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
              port++;
              reject(err);
            } else {
              reject(err);
            }
          });
      });
      return port;
    } catch (err) {
      if (err.code !== 'EADDRINUSE') throw err;
    }
  }
};

app.prepare().then(async () => {
  const port = await findAvailablePort(3000);
  process.env.PORT = port.toString();
  
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  initSocket(server);

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});

export default nextConfig;
