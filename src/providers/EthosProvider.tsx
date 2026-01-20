import React, { createContext, useContext, useEffect, useState } from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || 'client-placeholder';

interface EthosProfile {
  address: string;
  name?: string;
  profilePictureUrl?: string;
}

interface EthosContextType {
  address: string | null;
  profile: EthosProfile | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  authenticated: boolean;
}

const EthosContext = createContext<EthosContextType | undefined>(undefined);

export const useEthos = () => {
  const context = useContext(EthosContext);
  if (!context) {
    throw new Error('useEthos must be used within an EthosProvider');
  }
  return context;
};

const EthosInternalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authenticated, login, logout, ready } = usePrivy();
  const [profile, setProfile] = useState<EthosProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const crossAppAccount = user?.linkedAccounts?.find((a: any) => a.type === 'cross_app');
  const address = (crossAppAccount as any)?.embeddedWallets?.[0]?.address || null;

  useEffect(() => {
    const fetchProfile = async () => {
      if (address) {
        try {
          const response = await fetch(`https://api.ethos.network/api/v2/user/by/ethos-everywhere-wallet/${address}`);
          if (response.ok) {
            const data = await response.json();
            setProfile({
              address,
              name: data.name,
              profilePictureUrl: data.profilePictureUrl,
            });
          } else {
            setProfile({ address });
          }
        } catch (error) {
          console.error('Error fetching Ethos profile:', error);
          setProfile({ address });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    if (ready) {
      fetchProfile();
    }
  }, [address, ready]);

  return (
    <EthosContext.Provider
      value={{
        address,
        profile,
        loading: !ready || loading,
        login,
        logout,
        authenticated,
      }}
    >
      {children}
    </EthosContext.Provider>
  );
};

export const EthosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#676FFF',
        },
      }}
    >
      <EthosInternalProvider>{children}</EthosInternalProvider>
    </PrivyProvider>
  );
};
