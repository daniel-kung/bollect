import {
  decodeEdition,
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
import { isMetadataV1Account } from 'contexts/meta/processMetaData';
import { accountGetEditionInfo } from 'modules/common/utils/solanaAccount';

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
        // TODO TEST
        const testEdition = await accountGetEditionInfo({
          connection,
          parentPubkey: '9tQbgz8LVZ5DBxRtiW9wfKTZnDiNSUAR2kaDdkZB8pc4',
        });
        console.log('testEdition------>', testEdition);
        console.log(
          'testEdition------>',
          decodeEdition(testEdition[0].account.data),
        );
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

export const useMyCrateMetaData = (address: string) => {
  const connection = useConnection();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (address) {
        setLoading(true);
        const data = await getProgramAccounts(
          connection,
          METADATA_PROGRAM_ID,
          {},
        );
        const list = data
          .filter(m => isMetadataV1Account(m.account))
          .map(e => {
            const v = decodeMetadata(e.account.data);
            return {
              info: v,
              name: v.data.name,
              uri: v.data.uri,
              sellerFeeBasisPoints: v.data.sellerFeeBasisPoints,
              pubkey: e.pubkey,
            };
          })
          .filter(m => m.info.data.creators?.some(c => c.address === address));
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
