"use client";

import { useState, useEffect } from "react";
import { Package, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";

export default function InventairePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/produits");
      const data = await response.json();
      if (data.success) setProducts(data.data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const lowStockProducts = products.filter(
    (p) => p.trackQuantity && p.quantity <= (p.lowStockAlert || 10)
  );
  const outOfStockProducts = products.filter(
    (p) => p.trackQuantity && p.quantity === 0
  );

  const filteredProducts =
    filter === "LOW_STOCK"
      ? lowStockProducts
      : filter === "OUT_OF_STOCK"
      ? outOfStockProducts
      : products;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventaire</h1>
        <p className="text-gray-600">
          Gérez vos stocks et niveaux d'inventaire
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Produits
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {products.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Faible</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {lowStockProducts.length}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rupture</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {outOfStockProducts.length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-6 flex gap-2">
        {["ALL", "LOW_STOCK", "OUT_OF_STOCK"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {status === "ALL"
              ? "Tous"
              : status === "LOW_STOCK"
              ? "Stock Faible"
              : "Rupture"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alerte
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valeur
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => {
              const isLowStock =
                product.trackQuantity &&
                product.quantity <= (product.lowStockAlert || 10);
              const isOutOfStock =
                product.trackQuantity && product.quantity === 0;
              const stockValue =
                product.quantity * (product.cost || product.price);

              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.images && JSON.parse(product.images)[0] ? (
                        <img
                          src={JSON.parse(product.images)[0]}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-200 mr-3 flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        {product.category && (
                          <div className="text-xs text-gray-500">
                            {product.category}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sku || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`text-sm font-semibold ${
                        isOutOfStock
                          ? "text-red-600"
                          : isLowStock
                          ? "text-orange-600"
                          : "text-gray-900"
                      }`}
                    >
                      {product.trackQuantity ? product.quantity : "∞"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    {product.trackQuantity ? product.lowStockAlert || 10 : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isOutOfStock ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                        Rupture
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                        Stock Faible
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        En Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    {product.trackQuantity ? `${stockValue.toFixed(2)} €` : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucun produit</p>
        </div>
      )}
    </div>
  );
}
