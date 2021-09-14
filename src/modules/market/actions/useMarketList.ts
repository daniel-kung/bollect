import { TokenAccountParser, useConnection } from 'npms/oystoer';
import { getProgramAccounts } from 'contexts/meta/loadAccounts';
import { useEffect } from 'react';
import { useState } from 'react';
import { AUCTION_ID } from 'npms/oystoer';

export interface IMyMintItem {
  name: string;
  uri: string;
  sellerFeeBasisPoints: number;
  pubkey: string;
}

export const useMarketList = () => {
  const connection = useConnection();
  const [list, setList] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const data = await getProgramAccounts(connection, AUCTION_ID);
      const filterData = data.slice(0);
      console.log('data', filterData);
      const list = filterData.map(e => {
        const v = TokenAccountParser(e.pubkey, e.account);
        console.log('list', v);
        return {
          // data: v.data,
          ...v,
        };
      });

      console.log('list', list);
      setLoading(false);
      setList(list);
    };
    init();
  }, [connection]);

  return {
    data: list,
    loading,
  };
};
