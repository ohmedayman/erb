"use client";

import dynamic from "next/dynamic";

const CheckoutClient = dynamic(() => import("./CheckoutClient"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    </div>
  ),
});

export default function CheckoutPage() {
  return <CheckoutClient />;
}
