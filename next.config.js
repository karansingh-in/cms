const path = require("node:path");

/** @type {import('next').NextConfig} */
module.exports = {
  trailingSlash: true,
  turbopack: { root: path.resolve(__dirname) },
};
