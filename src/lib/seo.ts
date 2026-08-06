import { Metadata } from "next";

const siteUrl = "https://stockflow.vexonet.online";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  path?: string;
  image?: string;
  type?: "website" | "article";
}

export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  path = "",
  image = "/og-image.svg",
  type = "website",
}: SEOProps): Metadata {
  const url = `${siteUrl}${path}`;
  const fullTitle = `${title} | StockFlow - إدارة مخازن`;

  const defaultKeywords = [
    "نظام إدارة مخازن",
    "إدارة مخزون",
    "إدارة مخازن مصري",
    "نظام مخازن مصري",
    "StockFlow",
    "إدارة المبيعات",
    "نظام فواتير",
    "إدارة الأوردرات",
    "نظام نقاط بيع",
    "inventory management",
    "warehouse management",
    "point of sale",
  ];

  return {
    title: fullTitle,
    description,
    keywords: [...keywords, ...defaultKeywords],
    authors: [{ name: "StockFlow Team" }],
    creator: "StockFlow",
    publisher: "StockFlow",
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      locale: "ar_EG",
      url,
      siteName: "StockFlow",
      title: fullTitle,
      description,
      images: [
        {
          url: image.startsWith("http") ? image : `${siteUrl}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image.startsWith("http") ? image : `${siteUrl}${image}`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
