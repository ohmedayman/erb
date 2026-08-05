import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const siteUrl = "https://stockflow.vexonet.online";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "StockFlow - نظام إدارة المخازن والمخزون الاحترافي في مصر | SaaS",
    template: "%s | StockFlow - إدارة مخازن",
  },
  description:
    "StockFlow هو نظام إدارة مخازن ومخزون SaaS متكامل مصمم للشركات المصرية. أدر منتجاتك وعملاءك وفواتيرك وأوردراتك ومصروفاتك وموظفينك في مكان واحد. تقارير لحظية، باركود، شحن، نقاط بيع. ابدأ مجاناً الآن!",
  keywords: [
    "نظام إدارة مخازن",
    "إدارة مخزون",
    "إدارة مخازن مصري",
    "نظام مخازن SaaS",
    "إدارة المنتجات",
    "إدارة العملاء",
    "إدارة الفواتير",
    "نظام نقاط بيع",
    "point of sale",
    "inventory management",
    "warehouse management",
    "StockFlow",
    "إدارة المبيعات",
    "تتبع المخزون",
    "نظام فواتير",
    "إدارة الأوردرات",
    "إدارة الموظفين",
    "تقارير مبيعات",
    "إدارة المصروفات",
    "شحن وتوصيل",
    "باركود منتجات",
    "نظام إدارة مخازن مجاني",
    "أفضل نظام إدارة مخازن",
    "برنامج مخازن",
    "تطبيق إدارة مخازن",
    "إدارة المستودعات",
    "نظام حسابات",
    "قيود يومية",
    "إدارة الموردين",
    "الأقساط",
    "مرتجعات",
    "حركات المخزون",
    "تحليلات مبيعات",
    "أرباح وخسائر",
    "سجل نشاطات",
    "فريق عمل",
    "إدارة المتاجر",
    "مخازن مصر",
    "شركات مصرية",
    "SaaS مصر",
    "برنامج مخازن مصري",
  ],
  authors: [{ name: "StockFlow Team" }],
  creator: "StockFlow",
  publisher: "StockFlow",
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: siteUrl,
    siteName: "StockFlow",
    title: "StockFlow - نظام إدارة المخازن والمخزون الاحترافي في مصر",
    description:
      "نظام إدارة مخازن ومخزون SaaS متكامل للشركات المصرية. أدر منتجاتك وعملاءك وفواتيرك في مكان واحد. تقارير لحظية، باركود، شحن، نقاط بيع.",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "StockFlow - نظام إدارة المخازن",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StockFlow - نظام إدارة المخازن والمخزون الاحترافي",
    description:
      "نظام إدارة مخازن ومخزون SaaS متكامل للشركات المصرية. أدر منتجاتك وعملاءك وفواتيرك في مكان واحد.",
    images: [`${siteUrl}/og-image.png`],
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
  alternates: {
    canonical: siteUrl,
    languages: {
      "ar": siteUrl,
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "StockFlow",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "نظام إدارة مخازن ومخزون SaaS متكامل للشركات المصرية. أدر منتجاتك وعملاءك وفواتيرك في مكان واحد.",
    url: siteUrl,
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "1500",
      highPrice: "6000",
      priceCurrency: "EGP",
      offerCount: "3",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
    },
    author: {
      "@type": "Organization",
      name: "StockFlow",
      url: siteUrl,
    },
    inLanguage: "ar",
    featureList: [
      "إدارة المنتجات والمخزون",
      "إدارة العملاء والموردين",
      "نظام الفواتير والأوردرات",
      "نقاط البيع POS",
      "التقارير والتحليلات اللحظية",
      "الشحن والتوصيل",
      "باركود وطباعة",
      "إدارة الموظفين والفريق",
      "الأقساط والحسابات",
      "المصروفات والقيود اليومية",
    ],
  };

  return (
    <html
      lang="ar-EG"
      dir="rtl"
      className={`${cairo.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#f97316" />
        <meta name="msapplication-TileColor" content="#f97316" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="StockFlow" />
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
        <link rel="canonical" href={siteUrl} />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('SW registered:', reg.scope);
                  }).catch(function(err) {
                    console.log('SW failed:', err);
                  });
                });
              }
            `,
          }}
        />
        {children}
        <ToastProvider />
        <Script
          src="https://cdn.jotfor.ms/agent/embedjs/019fd362562870008d912d62274b76525a2e/embed.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
