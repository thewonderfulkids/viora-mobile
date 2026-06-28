import NetInfo from "@react-native-community/netinfo";
import { createContext, ReactNode, useEffect, useMemo, useState } from "react";

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

  async function refreshNetworkStatus() {
    setIsChecking(true);

    try {
      const state = await NetInfo.fetch();
      const online = resolveOnlineState(
        state.isConnected,
        state.isInternetReachable
      );

      setIsOnline(online);
      setLastCheckedAt(Date.now());

      return online;
    } finally {
      setIsChecking(false);
    }
  }

  useEffect(() => {
    refreshNetworkStatus();

    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = resolveOnlineState(
        state.isConnected,
        state.isInternetReachable
      );

      setIsOnline(online);
      setLastCheckedAt(Date.now());
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      isOnline,
      isChecking,
      lastCheckedAt,
      refreshNetworkStatus,
    }),
    [isOnline, isChecking, lastCheckedAt]
  );

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}