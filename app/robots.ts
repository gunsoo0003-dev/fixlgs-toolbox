import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dev/",
          "/tool020-harness",
          "/__tool020-harness",
        ],
      },
    ],
    sitemap: "https://toolbox.fixlgs.com/sitemap.xml",
  };
}
