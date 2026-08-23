import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["nodemailer", "@neondatabase/serverless"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
