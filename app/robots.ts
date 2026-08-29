import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/tools/dev/",
          "/tools/tool020-harness",
          "/tools/__tool020-harness",
        ],
      },
    ],
    sitemap: "https://fixlgs.com/tools/sitemap.xml",
  };
}
