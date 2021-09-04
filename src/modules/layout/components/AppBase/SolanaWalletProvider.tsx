import { FC, ReactNode, useMemo } from 'react';
import {
  ConnectionProvider,
  useLocalStorage,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { clusterApiUrl } from '@solana/web3.js';
import {
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
} from '@solana/wallet-adapter-wallets';

export const SolanaWalletProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [autoConnect] = useLocalStorage('autoConnect', true);
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);

  const wallets = useMemo(
    () => [getPhantomWallet(), getSolflareWallet(), getSolletWallet()],
    [],
  );

  const onError = (err: any) => {
    console.error(err);
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        onError={onError}
        autoConnect={autoConnect}
      >
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};
