import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-wallets';
import { useCallback } from 'react';
import { getJWTToken } from '../utils/localStorage';

export const useReactWeb3 = () => {
  const { select, adapter } = useWallet();
  const account = adapter?.publicKey;
  const address = account?.toString();
  const _isConnected = Boolean(adapter?.connected);
  const isConnected = Boolean(_isConnected && getJWTToken());

  const disconnect = useCallback(() => {
    return adapter?.disconnect?.();
  }, [adapter]);
  const connect = useCallback(
    (name: WalletName) =>
      new Promise((resolve, reject) => {
        const connect = () => {
          if (_isConnected || address) {
            console.log('--address resolve--');
            return resolve(name);
          }
          let isResolve = false;
          try {
            adapter?.connect().finally(() => {
              console.log('adapter connect');
              resolve(name);
              isResolve = true;
            });
          } catch (error) {
            console.log('uninstall');
            // console.log(error)
          }
          // Phantom connect timeout -> auto resolve
          // if (name !== WalletName.Phantom) {
          //   return;
          // }
          setTimeout(() => !isResolve && resolve(name), 600);
        };
        select(name);
        connect();
      }),
    [select, adapter, _isConnected, address],
  );
  return {
    isConnected,
    connected: adapter?.connected,
    account,
    address,
    disconnect,
    connect,
  };
};
