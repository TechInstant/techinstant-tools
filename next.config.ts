import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Note: do NOT add `experimental.optimizePackageImports: ["lucide-react"]`.
     Next already handles lucide-react by default, and setting it explicitly
     under Turbopack split the icons into many small chunks — measured at +105kB
     of JS and 5 extra requests per page. Left out deliberately. */

  /* Source maps would roughly double what a visitor downloads, for no benefit
     to them. Keep them off in production. */
  productionBrowserSourceMaps: false,

  async headers() {
    return [
      {
        /* The published catalogue is static and read cross-origin by the main
           marketing site, so let a CDN hold it rather than re-fetching it on
           every visit there. */
        source: "/tools.json",
        headers: [
          {
            key: "cache-control",
            value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "x-content-type-options", value: "nosniff" },
          { key: "referrer-policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
