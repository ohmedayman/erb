import { MetadataRoute } from "next";

const siteUrl = "https://stockflow.vexonet.online";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${siteUrl}/login`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${siteUrl}/signup`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${siteUrl}/checkout`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${siteUrl}/setup`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${siteUrl}/dashboard`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${siteUrl}/dashboard/products`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.6 },
    { url: `${siteUrl}/dashboard/orders`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.6 },
    { url: `${siteUrl}/dashboard/invoices`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.6 },
    { url: `${siteUrl}/dashboard/customers`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.6 },
    { url: `${siteUrl}/dashboard/inventory`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.5 },
    { url: `${siteUrl}/dashboard/expenses`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.5 },
    { url: `${siteUrl}/dashboard/employees`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${siteUrl}/dashboard/pos`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.6 },
    { url: `${siteUrl}/dashboard/shipping`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.5 },
    { url: `${siteUrl}/dashboard/installments`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.5 },
    { url: `${siteUrl}/dashboard/accounts`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.5 },
    { url: `${siteUrl}/dashboard/journal`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.5 },
    { url: `${siteUrl}/dashboard/purchase-orders`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.5 },
    { url: `${siteUrl}/dashboard/warehouses`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.5 },
    { url: `${siteUrl}/dashboard/suppliers`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.5 },
    { url: `${siteUrl}/dashboard/stock-movements`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.5 },
    { url: `${siteUrl}/dashboard/returns`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.5 },
    { url: `${siteUrl}/dashboard/analytics`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.5 },
    { url: `${siteUrl}/dashboard/reports`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.5 },
    { url: `${siteUrl}/dashboard/reports/profit-loss`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.5 },
    { url: `${siteUrl}/dashboard/activity-log`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.4 },
    { url: `${siteUrl}/dashboard/notifications`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.4 },
    { url: `${siteUrl}/dashboard/team`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${siteUrl}/dashboard/settings`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${siteUrl}/admin`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.3 },
    { url: `${siteUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
  ];

  return staticPages;
}
