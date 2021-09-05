import { FC, ReactNode, useMemo } from 'react';
import {
  ConnectionProvider,
  useLocalStorage,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { clusterApiUrl } from '@solana/web3.js';
import {
  getPhantomWallet,
  getSolletWallet,
  getSolongWallet,
  getMathWallet,
} from '@solana/wallet-adapter-wallets';
import { NotificationActions } from 'modules/notification/store/NotificationActions';
import { extractMessage } from 'modules/common/utils/extractError';
import { useDispatch } from 'react-redux';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export const SolanaWalletProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [autoConnect] = useLocalStorage('autoConnect', true);
  const endpoint = useMemo(
    () => clusterApiUrl(WalletAdapterNetwork.Mainnet),
    [],
  );
  const dispatch = useDispatch();

  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getMathWallet(),
      getSolongWallet(),
      getSolletWallet({
        provider: (window as any).sollet,
        network: WalletAdapterNetwork.Mainnet,
      }),
    ],
    [],
  );

  const onError = (err: any) => {
    console.log(err);
    dispatch(
      NotificationActions.showNotification({
        message: extractMessage(err),
        severity: 'error',
      }),
    );
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
