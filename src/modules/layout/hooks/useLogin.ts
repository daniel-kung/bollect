import { useDispatchRequest } from '@redux-requests/react';
import bs58 from 'bs58';
import { getAuthToken } from 'modules/account/api/getAuthToken';
import { useReactWeb3 } from 'modules/common/hooks/useReactWeb3';
import { extractMessage } from 'modules/common/utils/extractError';
import { setJWTToken } from 'modules/common/utils/localStorage';
import { NotificationActions } from 'modules/notification/store/NotificationActions';
import { fetchProfileInfo } from 'modules/profile/actions/fetchProfileInfo';
import { queryLikedItems } from 'modules/profile/actions/queryLikedItems';
import { useDispatch } from 'react-redux';

const getSolSignature = async (sinMessage: string) => {
  const encodedMessage = new TextEncoder().encode(sinMessage);
  const signedMessage = await (window as any)?.solana?.signMessage(
    encodedMessage,
    'utf8',
  );
  const signature = bs58.encode(signedMessage.signature);
  return signature;
};

export const useLogin = () => {
  const { address } = useReactWeb3();
  const dispatch = useDispatch();
  const dispatchRequest = useDispatchRequest();
  const login = async (cb: () => void) => {
    try {
      const message = `Bollect`;
      const signature = await getSolSignature(message);
      setJWTToken(signature);
      cb?.();
      // -----  Login -----
      const params = {
        accountaddress: address ?? (window as any).solana.publicKey.toBase58(),
        message: message,
        signature: signature,
      };
      const authResponse = await dispatchRequest(getAuthToken(params));
      const token = authResponse.data.data.token;
      setJWTToken(token);
      setTimeout(() => {
        dispatch(queryLikedItems());
      }, 500);
    } catch (error: any) {
      console.log(error);
      dispatch(
        NotificationActions.showNotification({
          message: extractMessage(
            new Error(error?.message ?? 'signature error'),
          ),
          severity: 'error',
        }),
      );
    }
  };

  return {
    login,
  };
};
