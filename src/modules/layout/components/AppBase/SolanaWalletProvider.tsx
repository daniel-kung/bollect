import { FC, ReactNode, useMemo } from 'react';
import {
  ConnectionProvider,
  useLocalStorage,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { clusterApiUrl } from '@solana/web3.js';
import {
  getPhantomWallet,
  // getSolletWallet,
  // getSolongWallet,
  getMathWallet,
} from '@solana/wallet-adapter-wallets';
import { useIsXLUp } from 'modules/themes/useTheme';

export const SolanaWalletProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [autoConnect] = useLocalStorage('autoConnect', true);
  const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), []);
  const isXLUp = useIsXLUp();

  const wallets = useMemo(
    () =>
      isXLUp
        ? [
            getPhantomWallet(),
            // getSolletWallet(),
            // getSolongWallet(),
          ]
        : [getPhantomWallet(), getMathWallet()],
    [isXLUp],
  );

  const onError = (err: any) => {
    console.log(err);
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
