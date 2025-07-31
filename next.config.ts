const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/(.*)/,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: { maxEntries: 16, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /^https?:\/\/.*\.(?:png|jpg|jpeg|svg|gif|ico|webp)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: { maxEntries: 64, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /^https?:\/\/.*\/(?:api|api\/.*)$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "api",
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /^https?:\/\/.*\.(?:js|css)$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-resources",
        expiration: { maxEntries: 32, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
  ],
});

module.exports = withPWA({
  /* config options here */
});
