"use client";

import { useState } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
} from "lucide-react";

const initialProducts = [
  { id: 1, name: "Wireless Mouse", sku: "WM-001", category: "Electronics", price: "$29.99", stock: 150, status: "Active" },
  { id: 2, name: "Office Chair", sku: "OC-023", category: "Furniture", price: "$199.00", stock: 45, status: "Active" },
  { id: 3, name: "USB Cable 2m", sku: "UC-045", category: "Accessories", price: "$9.99", stock: 500, status: "Active" },
  { id: 4, name: "Standing Desk", sku: "SD-067", category: "Furniture", price: "$449.00", stock: 12, status: "Low Stock" },
  { id: 5, name: "Monitor Stand", sku: "MS-089", category: "Accessories", price: "$39.99", stock: 0, status: "Out of Stock" },
  { id: 6, name: "Keyboard Pro", sku: "KP-101", category: "Electronics", price: "$79.99", stock: 200, status: "Active" },
  { id: 7, name: "Webcam HD", sku: "WC-123", category: "Electronics", price: "$59.99", stock: 85, status: "Active" },
  { id: 8, name: "Desk Lamp", sku: "DL-145", category: "Lighting", price: "$24.99", stock: 320, status: "Active" },
];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    stock: "",
  });

  const filtered = initialProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
    setNewProduct({ name: "", sku: "", category: "", price: "", stock: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your product catalog
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-sm text-muted-foreground hover:bg-border transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                  Product
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                  SKU
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                  Category
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                  Price
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                  Stock
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {product.sku}
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {product.category}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">
                    {product.price}
                  </td>
                  <td className="px-5 py-3 text-sm text-foreground">
                    {product.stock}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.status === "Active"
                          ? "bg-green-50 text-green-600"
                          : product.status === "Low Stock"
                          ? "bg-yellow-50 text-yellow-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md border border-border">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Add Product
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Product Name
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={newProduct.sku}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, sku: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Price
                  </label>
                  <input
                    type="text"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, stock: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
