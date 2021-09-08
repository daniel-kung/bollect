import { useReactWeb3 } from 'modules/common/hooks/useReactWeb3';
import { updateAddress } from 'modules/common/store/user';
import { fetchProfileInfo } from 'modules/profile/actions/fetchProfileInfo';
import { ReactNode, useEffect } from 'react';
import { useDispatch } from 'react-redux';

export const Update: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { address } = useReactWeb3();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(updateAddress(address ?? ''));
    if (!address) return;
    dispatch(fetchProfileInfo());
  }, [address, dispatch]);
  return <>{children}</>;
};
