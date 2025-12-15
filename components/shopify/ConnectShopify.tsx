'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth';
import { useShopifyStatus } from '@/hooks/useShopifyStatus';
import * as shopifyService from '@/lib/services/shopify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AlertCircle, CheckCircle2, Loader2, Unlink } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function ConnectShopify() {
  const { data: session } = useSession();
  const { status, isLoading, error, refetch } = useShopifyStatus();
  const [shop, setShop] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState('');
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [disconnectConfirm, setDisconnectConfirm] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnectError('');

    if (!shop.trim()) {
      setConnectError('Please enter a shop name');
      return;
    }

    if (!session?.user) {
      setConnectError('You must be logged in');
      return;
    }

    setIsConnecting(true);
    try {
      const result = await shopifyService.initiateOAuth(shop);
      // Redirect to Shopify authorization URL
      if (result.authorizationUrl) {
        window.location.href = result.authorizationUrl;
      }
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : 'Failed to connect Shopify');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!session?.user) return;

    setIsDisconnecting(true);
    try {
      await shopifyService.disconnect();
      setShowDisconnectDialog(false);
      await refetch();
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : 'Failed to disconnect');
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shopify Connection</CardTitle>
          <CardDescription>Connect your Shopify store to manage products and collections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Shopify Connection</CardTitle>
          <CardDescription>Connect your Shopify store to manage products and collections</CardDescription>
        </CardHeader>
        <CardContent>
          {status?.isConnected ? (
            // Connected state
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-900">Connected</p>
                  <p className="text-sm text-green-700">{status.shop}</p>
                </div>
              </div>

              {status.connectedAt && (
                <div className="text-sm text-slate-600">
                  <p>Connected on {formatDate(new Date(status.connectedAt))}</p>
                </div>
              )}

              <Button
                variant="destructive"
                onClick={() => setShowDisconnectDialog(true)}
                className="gap-2"
              >
                <Unlink className="w-4 h-4" />
                Disconnect Shopify
              </Button>
            </div>
          ) : (
            // Not connected state
            <form onSubmit={handleConnect} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shop" className="text-sm font-medium">
                  Shopify Store Name
                </Label>
                <Input
                  id="shop"
                  type="text"
                  placeholder="your-store or your-store.myshopify.com"
                  value={shop}
                  onChange={(e) => setShop(e.target.value)}
                  disabled={isConnecting}
                  className="h-10"
                />
                <p className="text-xs text-slate-500">
                  Enter your Shopify store name (without .myshopify.com if not needed)
                </p>
              </div>

              {(error || connectError) && (
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error || connectError}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isConnecting || !shop.trim()}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  'Connect Shopify Store'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <DialogContent>
          <DialogTitle>Disconnect Shopify?</DialogTitle>
          <DialogDescription>
            This will disconnect your Shopify store. You can reconnect anytime.
          </DialogDescription>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => setShowDisconnectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Disconnecting...
                </>
              ) : (
                'Disconnect'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
