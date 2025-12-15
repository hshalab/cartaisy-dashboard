'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Loader2, TrendingUp } from 'lucide-react';

interface TopSearch {
  query: string;
  count: number;
  avgResultsCount: number;
}

interface TopSearchesCardProps {
  searches: TopSearch[];
  isLoading?: boolean;
}

export function TopSearchesCard({ searches, isLoading = false }: TopSearchesCardProps) {
  const maxCount = Math.max(...searches.map((s) => s.count), 1);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Top Searches</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : searches.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">No search data available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {searches.slice(0, 6).map((search, index) => {
              const percentage = (search.count / maxCount) * 100;

              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Search className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-900 truncate">
                        {search.query}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-semibold text-slate-900">
                        {search.count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-400 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 w-16 text-right">
                      {search.avgResultsCount} results
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
