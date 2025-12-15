'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  sales: number;
  quantity: number;
  image?: string;
}

interface TopProductsCardProps {
  products: Product[];
  isLoading?: boolean;
}

export function TopProductsCard({ products, isLoading = false }: TopProductsCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Top Products</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No product data available
          </div>
        ) : (
          <div className="space-y-4">
            {products.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-slate-100 rounded-lg text-sm font-semibold text-slate-600">
                  {index + 1}
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
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
                    {product.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {product.quantity} sold
                  </p>
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  ${product.sales.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
