import type { MetadataRoute } from "next";
import { categories, locales, tool001Slug, tool002Slug, tool003Slug, tool004Slug, tool005Slug, tool006Slug, tool007Slug, tool008Slug, tool009Slug, tool010Slug, tool011Slug } from "@/lib/site";

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
    entries.push({
      url: `${baseUrl}/${locale}/${tool002Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool003Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool004Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool005Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool006Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool007Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool008Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool009Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool010Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool011Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
  }

  return entries;
}
