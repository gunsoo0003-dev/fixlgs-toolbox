import type { MetadataRoute } from "next";
import { categories, locales, tool001Slug, tool002Slug, tool003Slug, tool004Slug, tool005Slug, tool006Slug, tool007Slug, tool008Slug, tool009Slug, tool010Slug, tool011Slug, tool012Slug, tool013Slug, tool014Slug, tool015Slug, tool016Slug, tool017Slug, tool018Slug, tool019Slug, tool020Slug, tool021Slug, tool022Slug, tool023Slug, tool024Slug, tool025Slug, tool026Slug, tool027Slug, tool028Slug, tool029Slug, tool030Slug, tool031Slug, tool032Slug, tool033Slug, tool034Slug, tool035Slug, tool036Slug, tool037Slug, tool038Slug, tool039Slug, tool040Slug, tool041Slug, tool042Slug, tool043Slug, tool044Slug, tool045Slug } from "@/lib/site";

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
    entries.push({
      url: `${baseUrl}/${locale}/${tool012Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool013Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool014Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool015Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool016Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool017Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool018Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool019Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool020Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool021Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool022Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool023Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool024Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool025Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool026Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool027Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool028Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool029Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool030Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool031Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool032Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool033Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool034Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool035Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool036Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool037Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool038Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool039Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool040Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool041Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool042Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool043Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool044Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
    entries.push({
      url: `${baseUrl}/${locale}/${tool045Slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
  }

  return entries;
}
