'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface LowStockProduct {
  productId: string;
  title: string;
  image?: string;
  quantity: number;
  threshold: number;
}

interface LowStockCardProps {
  products: LowStockProduct[];
  isLoading?: boolean;
}

export function LowStockCard({ products, isLoading = false }: LowStockCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Low Stock Alerts</CardTitle>
          {products.length > 0 && (
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              {products.length} items
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-slate-500 text-sm">All products are well stocked</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.slice(0, 5).map((product) => {
              const stockPercentage = (product.quantity / product.threshold) * 100;
              const isVeryLow = product.quantity <= product.threshold * 0.5;

              return (
                <div
                  key={product.productId}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.title}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {product.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isVeryLow ? 'bg-red-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        isVeryLow ? 'text-red-600' : 'text-amber-600'
                      }`}>
                        {product.quantity} left
                      </span>
                    </div>
                  </div>
                  {isVeryLow && (
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
