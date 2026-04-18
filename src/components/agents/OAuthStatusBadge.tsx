'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { getOAuthStatus } from '@/services/agents/agentService';

interface OAuthStatusBadgeProps {
  keyId: string;
  clientId: string;
}

export function OAuthStatusBadge({ keyId, clientId }: OAuthStatusBadgeProps) {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [planType, setPlanType] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOAuthStatus(keyId, clientId);
      setConnected(data.connected);
      setPlanType(data.plan_type || null);
      setExpiresAt(data.expires_at || null);
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, [keyId, clientId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const getExpiryLabel = () => {
    if (!expiresAt) return null;
    const exp = new Date(expiresAt);
    const now = new Date();
    const hoursLeft = Math.floor((exp.getTime() - now.getTime()) / (1000 * 60 * 60));
    if (hoursLeft < 0) return 'Expired';
    if (hoursLeft < 24) return `${hoursLeft}h left`;
    return null;
  };

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Checking...
      </span>
    );
  }

  if (connected) {
    const expiryLabel = getExpiryLabel();
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Connected
        </span>
        {planType && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {planType === 'plus' ? 'Plus' : planType === 'pro' ? 'Pro' : planType}
          </span>
        )}
        {expiryLabel && (
          <span className="text-xs text-yellow-400">{expiryLabel}</span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            fetchStatus();
          }}
          className="text-muted-foreground transition-colors hover:text-foreground"
          title="Refresh status"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-400/10 px-2 py-0.5 text-xs font-medium text-red-400">
      <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
      Disconnected
    </span>
  );
}
