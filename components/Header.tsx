'use client';

import Link from 'next/link';
import { useSession } from '@/lib/auth';
import { useAuth } from '@/lib/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, ShoppingBag } from 'lucide-react';
import { useShopifyStatus } from '@/hooks/useShopifyStatus';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { data: session } = useSession();
  const { logout } = useAuth();
  const { status, isLoading } = useShopifyStatus();
  const userInitials = session?.user?.email
    ?.split('@')[0]
    ?.split('')
    ?.slice(0, 2)
    ?.join('')
    ?.toUpperCase() || 'US';

  return (
    <header className="hidden md:flex h-14 bg-white border-b border-slate-200 items-center justify-between px-6">
      <h2 className="text-base font-semibold tracking-tight text-slate-900">{title}</h2>

      <div className="flex items-center gap-3">
        {/* Shopify Status Indicator */}
        {!isLoading && (
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            {status?.isConnected ? (
              <>
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                <span className="text-xs text-slate-600">Shopify Connected</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-600">Connect Shopify</span>
              </>
            )}
          </Link>
        )}

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0 h-auto">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-xs font-medium truncate">{session?.user?.email || 'User'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/dashboard/settings" className="w-full">
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-xs">
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="flex items-center gap-2 text-red-600 cursor-pointer text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
