"use client";

import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
  jsonLd?: object;
}

export default function SEOHead({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage = "https://stockflow.vexonet.online/og-image.png",
  canonical,
  jsonLd,
}: SEOHeadProps) {
  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, attribute?: string) => {
      let el = document.querySelector(`meta[${attribute || "name"}="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        if (attribute) el.setAttribute(attribute, name);
        else el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    if (keywords) setMeta("keywords", keywords);

    setMeta("og:title", ogTitle || title, "property");
    setMeta("og:description", ogDescription || description, "property");
    setMeta("og:image", ogImage, "property");
    setMeta("og:type", "website", "property");
    setMeta("og:locale", "ar_EG", "property");
    setMeta("og:site_name", "StockFlow", "property");

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", ogTitle || title);
    setMeta("twitter:description", ogDescription || description);
    setMeta("twitter:image", ogImage);

    if (canonical) {
      let linkEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!linkEl) {
        linkEl = document.createElement("link");
        linkEl.setAttribute("rel", "canonical");
        document.head.appendChild(linkEl);
      }
      linkEl.setAttribute("href", canonical);
    }

    if (jsonLd) {
      let scriptEl = document.querySelector('script[type="application/ld+json"]');
      if (scriptEl) scriptEl.remove();
      scriptEl = document.createElement("script");
      scriptEl.setAttribute("type", "application/ld+json");
      scriptEl.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(scriptEl);
    }
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonical, jsonLd]);

  return null;
}
