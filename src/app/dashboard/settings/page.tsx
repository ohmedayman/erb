"use client";

import { useState, useEffect } from "react";
import {
  Store,
  User,
  Bell,
  Shield,
  CreditCard,
  Save,
  Camera,
  MapPin,
  Phone,
  Mail,
  Globe,
  Building2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface StoreData {
  // Store Info
  storeName: string;
  storeDescription: string;
  storeLogo: string;
  storeWebsite: string;
  storeCategory: string;

  // Owner Info
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;

  // Address
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;

  // Business
  taxId: string;
  currency: string;
  timezone: string;

  // Notifications
  emailNotifications: boolean;
  orderAlerts: boolean;
  lowStockAlerts: boolean;
  weeklyReports: boolean;
}

const defaultStoreData: StoreData = {
  storeName: "",
  storeDescription: "",
  storeLogo: "",
  storeWebsite: "",
  storeCategory: "Electronics",
  ownerName: "",
  ownerEmail: "",
  ownerPhone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "United States",
  taxId: "",
  currency: "USD",
  timezone: "America/New_York",
  emailNotifications: true,
  orderAlerts: true,
  lowStockAlerts: true,
  weeklyReports: false,
};

const tabs = [
  { id: "store", label: "Store Info", icon: Store },
  { id: "owner", label: "Owner Details", icon: User },
  { id: "address", label: "Address", icon: MapPin },
  { id: "business", label: "Business", icon: Building2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("store");
  const [storeData, setStoreData] = useState<StoreData>(defaultStoreData);
  const [saved, setSaved] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    const savedData = localStorage.getItem("storeData");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setStoreData((prev) => ({
        ...prev,
        storeName: parsed.storeName || "",
        ownerName: parsed.ownerName || "",
        ownerEmail: parsed.email || "",
      }));
    }

    const fullSettings = localStorage.getItem("storeSettings");
    if (fullSettings) {
      setStoreData(JSON.parse(fullSettings));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("storeSettings", JSON.stringify(storeData));
    localStorage.setItem(
      "storeData",
      JSON.stringify({
        storeName: storeData.storeName,
        ownerName: storeData.ownerName,
        email: storeData.ownerEmail,
      })
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateField = (field: keyof StoreData, value: string | boolean) => {
    setStoreData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your store configuration and preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {/* Success Toast */}
      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
          <CheckCircle className="w-4 h-4" />
          Settings saved successfully!
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-56 shrink-0">
          <nav className="bg-card rounded-xl border border-border p-2 flex lg:flex-col gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Store Info */}
          {activeTab === "store" && (
            <div className="bg-card rounded-xl border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Store Information</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Update your store details and branding
                </p>
              </div>
              <div className="p-6 space-y-6">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Store Logo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border">
                      {storeData.storeLogo ? (
                        <img
                          src={storeData.storeLogo}
                          alt="Logo"
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <Store className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-sm font-medium hover:bg-border transition-colors">
                        <Camera className="w-4 h-4" />
                        Upload Logo
                      </button>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG up to 2MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Store Name *
                    </label>
                    <input
                      type="text"
                      value={storeData.storeName}
                      onChange={(e) => updateField("storeName", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="My Store Name"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={storeData.storeDescription}
                      onChange={(e) =>
                        updateField("storeDescription", e.target.value)
                      }
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      placeholder="Brief description of your store..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Website
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="url"
                        value={storeData.storeWebsite}
                        onChange={(e) =>
                          updateField("storeWebsite", e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="https://mystore.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Category
                    </label>
                    <select
                      value={storeData.storeCategory}
                      onChange={(e) =>
                        updateField("storeCategory", e.target.value)
                      }
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option>Electronics</option>
                      <option>Furniture</option>
                      <option>Clothing</option>
                      <option>Food & Beverage</option>
                      <option>Industrial</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Owner Details */}
          {activeTab === "owner" && (
            <div className="bg-card rounded-xl border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Owner Details</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Your personal account information
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={storeData.ownerName}
                    onChange={(e) => updateField("ownerName", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={storeData.ownerEmail}
                      onChange={(e) => updateField("ownerEmail", e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={storeData.ownerPhone}
                      onChange={(e) => updateField("ownerPhone", e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Address */}
          {activeTab === "address" && (
            <div className="bg-card rounded-xl border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Address</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Your store&apos;s physical location
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={storeData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={storeData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      value={storeData.state}
                      onChange={(e) => updateField("state", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="NY"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={storeData.zipCode}
                      onChange={(e) => updateField("zipCode", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="10001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Country
                    </label>
                    <select
                      value={storeData.country}
                      onChange={(e) => updateField("country", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option>United States</option>
                      <option>United Kingdom</option>
                      <option>Canada</option>
                      <option>Germany</option>
                      <option>France</option>
                      <option>Saudi Arabia</option>
                      <option>UAE</option>
                      <option>Egypt</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Business */}
          {activeTab === "business" && (
            <div className="bg-card rounded-xl border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Business Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure business-related settings
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Tax ID / VAT Number
                    </label>
                    <input
                      type="text"
                      value={storeData.taxId}
                      onChange={(e) => updateField("taxId", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="XX-XXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Currency
                    </label>
                    <select
                      value={storeData.currency}
                      onChange={(e) => updateField("currency", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="SAR">SAR - Saudi Riyal</option>
                      <option value="AED">AED - UAE Dirham</option>
                      <option value="EGP">EGP - Egyptian Pound</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Timezone
                  </label>
                  <select
                    value={storeData.timezone}
                    onChange={(e) => updateField("timezone", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Riyadh">Riyadh (AST)</option>
                    <option value="Asia/Dubai">Dubai (GST)</option>
                    <option value="Africa/Cairo">Cairo (EET)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className="bg-card rounded-xl border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Notifications</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose what notifications you receive
                </p>
              </div>
              <div className="p-6 space-y-4">
                {[
                  {
                    key: "emailNotifications" as const,
                    label: "Email Notifications",
                    desc: "Receive email updates about your store activity",
                  },
                  {
                    key: "orderAlerts" as const,
                    label: "Order Alerts",
                    desc: "Get notified when new orders are placed",
                  },
                  {
                    key: "lowStockAlerts" as const,
                    label: "Low Stock Alerts",
                    desc: "Alert when products fall below minimum stock level",
                  },
                  {
                    key: "weeklyReports" as const,
                    label: "Weekly Reports",
                    desc: "Receive a weekly summary of your store performance",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        updateField(item.key, !storeData[item.key])
                      }
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        storeData[item.key] ? "bg-primary" : "bg-border"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          storeData[item.key] ? "translate-x-5" : ""
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <div className="bg-card rounded-xl border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Security</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your password and security settings
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords({ ...passwords, current: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwords.new}
                    onChange={(e) =>
                      setPasswords({ ...passwords, new: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Min. 8 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirm: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Confirm new password"
                  />
                </div>
                {passwords.new &&
                  passwords.confirm &&
                  passwords.new !== passwords.confirm && (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      Passwords do not match
                    </div>
                  )}
                <button className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
                  Update Password
                </button>

                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-medium text-foreground mb-2">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Add an extra layer of security to your account
                  </p>
                  <button className="px-4 py-2 bg-muted rounded-lg text-sm font-medium hover:bg-border transition-colors">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
