'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { TIMEZONES } from '@/lib/data/timezones';
import { CURRENCIES } from '@/lib/data/currencies';
import { canManageSettings } from '@/lib/utils/permissions';
import { useSyncFromShopify } from '@/hooks/useStoreSettings';

interface StoreSettingsFormProps {
  store: {
    settings?: {
      timezone?: string;
      currency?: string;
    };
  };
  onSettingsSaved: () => void;
}

export function StoreSettingsForm({ store, onSettingsSaved }: StoreSettingsFormProps) {
  const { data: session } = useSession();
  const [timezone, setTimezone] = useState(store.settings?.timezone || 'UTC');
  const [currency, setCurrency] = useState(store.settings?.currency || 'USD');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { syncFromShopify, isPending: isSyncing, error: syncError } = useSyncFromShopify();
  const canEdit = canManageSettings(session?.user?.role);

  // Get display labels for current values
  const timezoneLabel = TIMEZONES.find((tz) => tz.value === timezone)?.label || timezone;
  const currencyOption = CURRENCIES.find((curr) => curr.code === currency);
  const currencyLabel = currencyOption
    ? `${currencyOption.symbol} ${currencyOption.code} - ${currencyOption.name}`
    : currency;

  const handleSyncFromShopify = async () => {
    setError('');
    setSuccess(false);

    const result = await syncFromShopify();

    if (result?.success) {
      // Update local state with synced values
      setTimezone(result.data.timezone);
      setCurrency(result.data.currency);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onSettingsSaved();
    }
    // Error is handled by the hook and displayed via syncError
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Settings</CardTitle>
        <CardDescription>
          Currency and timezone are automatically synced from your Shopify store
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Timezone - Read Only */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Timezone</Label>
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-md">
              <span className="text-sm text-slate-700">{timezoneLabel}</span>
            </div>
            <p className="text-xs text-slate-500">
              Synced from Shopify
            </p>
          </div>

          {/* Currency - Read Only */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Currency</Label>
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-md">
              <span className="text-sm text-slate-700">{currencyLabel}</span>
            </div>
            <p className="text-xs text-slate-500">
              Synced from Shopify
            </p>
          </div>
        </div>

        {(error || syncError) && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error || syncError}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">Settings synced from Shopify successfully!</p>
          </div>
        )}

        {canEdit && (
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSyncFromShopify}
              disabled={isSyncing}
              variant="outline"
              className="gap-2"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Sync from Shopify
                </>
              )}
            </Button>
          </div>
        )}

        {!canEdit && (
          <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600">
              Only super admins can sync store settings from Shopify.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
