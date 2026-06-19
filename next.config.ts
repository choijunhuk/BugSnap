import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/BugSnap",
  turbopack: {
    root: process.cwd()
  }
};

export default nextConfig;
