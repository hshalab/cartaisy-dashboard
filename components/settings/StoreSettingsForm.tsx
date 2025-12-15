'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import { TIMEZONES } from '@/lib/data/timezones';
import { CURRENCIES } from '@/lib/data/currencies';
import { canManageSettings } from '@/lib/utils/permissions';

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
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const canEdit = canManageSettings(session?.user?.role);

  const hasChanges =
    timezone !== (store.settings?.timezone || 'UTC') ||
    currency !== (store.settings?.currency || 'USD');

  const handleReset = () => {
    setTimezone(store.settings?.timezone || 'UTC');
    setCurrency(store.settings?.currency || 'USD');
    setSuccess(false);
    setError('');
    setIsDirty(false);
  };

  const handleSave = async () => {
    setError('');
    setIsSaving(true);

    try {
      const response = await fetch('/api/store', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: { timezone, currency },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update settings');
        return;
      }

      setSuccess(true);
      setIsDirty(false);
      setTimeout(() => setSuccess(false), 3000);
      onSettingsSaved();
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Settings</CardTitle>
        <CardDescription>Configure timezone and currency preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone" className="text-sm font-medium">
              Timezone
            </Label>
            <Select
              value={timezone}
              onValueChange={(value) => {
                setTimezone(value);
                setIsDirty(true);
                setSuccess(false);
              }}
              disabled={!canEdit || isSaving}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Used for scheduling and time-based features
            </p>
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency" className="text-sm font-medium">
              Currency
            </Label>
            <Select
              value={currency}
              onValueChange={(value) => {
                setCurrency(value);
                setIsDirty(true);
                setSuccess(false);
              }}
              disabled={!canEdit || isSaving}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.code} - {curr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Used for pricing and financial displays
            </p>
          </div>
        </div>

        {!canEdit && (
          <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600">
              Only super admins can modify store settings.
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">Settings saved successfully!</p>
          </div>
        )}

        {canEdit && (
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!isDirty || isSaving}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
