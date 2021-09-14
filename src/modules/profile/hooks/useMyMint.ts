import {
  decodeMetadata,
  MAX_CREATOR_LEN,
  MAX_NAME_LENGTH,
  MAX_SYMBOL_LENGTH,
  MAX_URI_LENGTH,
  METADATA_PROGRAM_ID,
  useConnection,
} from 'npms/oystoer';
import { getProgramAccounts } from 'contexts/meta/loadAccounts';
import { useEffect } from 'react';
import { useState } from 'react';

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

export const useMintMetaData = (address: string) => {
  const connection = useConnection();
  const [list, setList] = useState<IMyMintItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (address) {
        setLoading(true);
        const data = await getProgramAccounts(connection, METADATA_PROGRAM_ID, {
          filters: [
            {
              memcmp: {
                offset,
                bytes: address,
              },
            },
          ],
        });
        const list = data.map(e => {
          const v = decodeMetadata(e.account.data);
          return {
            // data: v.data,
            name: v.data.name,
            uri: v.data.uri,
            sellerFeeBasisPoints: v.data.sellerFeeBasisPoints,
            pubkey: e.pubkey,
          };
        });
        setLoading(false);
        setList(list);
      }
    };
    init();
  }, [connection, address]);

  return {
    data: list,
    loading,
  };
};
