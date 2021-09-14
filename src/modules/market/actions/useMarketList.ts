import {
  decodeMetadata,
  MAX_CREATOR_LEN,
  MAX_NAME_LENGTH,
  MAX_SYMBOL_LENGTH,
  MAX_URI_LENGTH,
  TokenAccount,
  TokenAccountParser,
  useConnection,
} from '@oyster/common';
import { getProgramAccounts } from 'contexts/meta/loadAccounts';
import { useEffect } from 'react';
import { useState } from 'react';
import {
  AUCTION_ID,
  METADATA_PROGRAM_ID,
} from '@oyster/common/dist/lib/utils/ids';

const offset =
  1 + // key
  32 + // update auth
  32 + // mint
  4 + // name string length
  MAX_NAME_LENGTH + // name
  4 + // uri string length
  MAX_URI_LENGTH + // uri
  4 + // symbol string length
  MAX_SYMBOL_LENGTH + // symbol
  2 + // seller fee basis points
  1 + // whether or not there is a creators vec
  4 + // creators vec length
  0 * MAX_CREATOR_LEN;

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
