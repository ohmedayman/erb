import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";
import AntiInspect from "@/components/AntiInspect";

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
    default: "StockFlow - نظام إدارة المخازن والمخزون الاحترافي في مصر",
    template: "%s | StockFlow - إدارة مخازن",
  },
  description:
    "StockFlow هو نظام إدارة مخازن ومخزون متكامل مصمم للشركات المصرية. أدر منتجاتك وعملاءك وفواتيرك وأوردراتك ومصروفاتك وموظفينك في مكان واحد. تقارير لحظية، باركود، شحن، نقاط بيع. ابدأ مجاناً الآن!",
  keywords: [
    "نظام إدارة مخازن",
    "إدارة مخزون",
    "إدارة مخازن مصري",
    "نظام مخازن مصري",
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
    "إدارة مخازن مصر",
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
      "نظام إدارة مخازن ومخزون متكامل للشركات المصرية. أدر منتجاتك وعملاءك وفواتيرك في مكان واحد. تقارير لحظية، باركود، شحن، نقاط بيع.",
    images: [
      {
        url: `${siteUrl}/og-image.svg`,
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
      "نظام إدارة مخازن ومخزون متكامل للشركات المصرية. أدر منتجاتك وعملاءك وفواتيرك في مكان واحد.",
    images: [`${siteUrl}/og-image.svg`],
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
      "نظام إدارة مخازن ومخزون متكامل للشركات المصرية. أدر منتجاتك وعملاءك وفواتيرك في مكان واحد.",
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
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col">
        <AntiInspect />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Register Service Worker
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('SW registered:', reg.scope);
                    
                    // Check for updates periodically
                    setInterval(function() {
                      reg.update();
                    }, 60 * 60 * 1000); // Every hour
                  }).catch(function(err) {
                    console.log('SW failed:', err);
                  });
                });
              }

              // Handle install prompt
              let deferredPrompt;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                deferredPrompt = e;
                
                // Show custom install button after 3 seconds
                setTimeout(function() {
                  if (deferredPrompt) {
                    var installBtn = document.getElementById('pwa-install-btn');
                    if (installBtn) {
                      installBtn.style.display = 'flex';
                    }
                  }
                }, 3000);
              });

              window.installPWA = function() {
                if (deferredPrompt) {
                  deferredPrompt.prompt();
                  deferredPrompt.userChoice.then(function(choiceResult) {
                    if (choiceResult.outcome === 'accepted') {
                      console.log('PWA installed');
                    }
                    deferredPrompt = null;
                    var installBtn = document.getElementById('pwa-install-btn');
                    if (installBtn) installBtn.style.display = 'none';
                  });
                }
              };

              // Handle app installed
              window.addEventListener('appinstalled', function() {
                console.log('PWA installed successfully');
                deferredPrompt = null;
                var installBtn = document.getElementById('pwa-install-btn');
                if (installBtn) installBtn.style.display = 'none';
              });
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
