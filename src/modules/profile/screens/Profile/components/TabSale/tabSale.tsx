import { ProductCards } from 'modules/common/components/ProductCards';
import { uid } from 'react-uid';

import { useReactWeb3 } from 'modules/common/hooks/useReactWeb3';
import { useMyCrateMetaData } from 'modules/profile/hooks/useMyMint';
import { ItemCard } from '../tabOwned';

export const TabSale: React.FC<{
  isOther?: boolean;
  isCollectionSale?: boolean;
  reload?: () => void;
}> = function ({ isOther = false, reload, isCollectionSale = false }) {
  const { address } = useReactWeb3();
  const artAddress = address ?? '';
  const { data: list, loading } = useMyCrateMetaData(artAddress);

  return (
    <ProductCards isLoading={loading}>
      {list.map(e => {
        return <ItemCard key={uid(e)} item={e} artAddress={artAddress} />;
      })}
    </ProductCards>
  );
};
