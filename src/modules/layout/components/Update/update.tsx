import { useReactWeb3 } from 'modules/common/hooks/useReactWeb3';
import { updateAddress } from 'modules/common/store/user';
import { ReactNode, useEffect } from 'react';
import { useDispatch } from 'react-redux';

export const Update: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { address } = useReactWeb3();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(updateAddress(address ?? ''));
  }, [address, dispatch]);
  return <>{children}</>;
};
