import type { MetadataRoute } from "next";
import { categories, locales, tool001Slug } from "@/lib/site";

const baseUrl = "https://toolbox.fixlgs.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    entries.push({ url: `${baseUrl}/${locale}`, changeFrequency: "weekly", priority: 1 });
    for (const category of categories) {
      entries.push({
        url: `${baseUrl}/${locale}/category/${category.slug}`,
        changeFrequency: "weekly",
        priority: category.slug === "image-convert" ? 0.9 : 0.7,
      });
    }
    entries.push({
      url: `${baseUrl}/${locale}/${tool001Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
  }

  return entries;
}
