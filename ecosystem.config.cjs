module.exports = {
  apps: [
    {
      name: "wall-ad-h5",
      script: "server/index.js",
      cwd: "/www/wall-ad-system/current",
      env: {
        NODE_ENV: "production",
        PORT: "8787",
        PUBLIC_APP_ORIGIN: "https://wall.hc12345.com",
        APP_ORIGIN: "https://wall.hc12345.com",
        CORS_ORIGIN: "https://wall.hc12345.com",
        VITE_PUBLIC_APP_ORIGIN: "https://wall.hc12345.com",
        VITE_ENABLE_DEV_LOGIN: "false",
      },
      max_memory_restart: "512M",
      time: true,
    },
  ],
};
