import NetInfo from "@react-native-community/netinfo";
import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from "react";

type NetworkContextValue = {
  isOnline: boolean;
  isChecking: boolean;
  lastCheckedAt: number | null;
  refreshNetworkStatus: () => Promise<boolean>;
};

export const NetworkContext = createContext<NetworkContextValue | undefined>(
  undefined
);

type NetworkProviderProps = {
  children: ReactNode;
};

function resolveOnlineState(isConnected: boolean | null, isInternetReachable: boolean | null) {
  if (isConnected === false) return false;
  if (isInternetReachable === false) return false;
  return true;
}

export function NetworkProvider({ children }: NetworkProviderProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);

  const refreshNetworkStatus = useCallback(async () => {
    setIsChecking(true);

    try {
      const state = await NetInfo.fetch();
      const online = resolveOnlineState(
        state.isConnected,
        state.isInternetReachable
      );

      setIsOnline((current) => (current === online ? current : online));
      setLastCheckedAt(Date.now());

      return online;
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    void refreshNetworkStatus();

    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = resolveOnlineState(
        state.isConnected,
        state.isInternetReachable
      );

      setIsOnline((current) => (current === online ? current : online));
      setLastCheckedAt(Date.now());
    });

    return unsubscribe;
  }, [refreshNetworkStatus]);

  const value = useMemo(
    () => ({
      isOnline,
      isChecking,
      lastCheckedAt,
      refreshNetworkStatus,
    }),
    [isOnline, isChecking, lastCheckedAt, refreshNetworkStatus]
  );

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}