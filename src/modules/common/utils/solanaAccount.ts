import { decodeMasterEdition, decodeMetadata, ENDPOINTS } from 'npms/oystoer';
import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';

export const getAccountInfo = (publicKey: string) => {
  return axios.post(ENDPOINTS[0].endpoint, {
    method: 'getAccountInfo',
    jsonrpc: '2.0',
    params: [publicKey, { encoding: 'jsonParsed' }],
    // TODO
    id: '5b5044f3-b12b-4904-8d79-a2affae6247b',
  });
};

export const accountGetMasterEditionInfo = async ({
  publicKey,
  connection,
}: {
  publicKey: string;
  connection: Connection;
}) => {
  const account = await connection.getAccountInfo(
    new PublicKey(publicKey),
    'confirmed',
  );
  if (account && account?.data) {
    const nftInfo = await getAccountInfo(decodeMetadata(account.data).mint);
    const masterKey: string =
      nftInfo.data?.result.value.data.parsed.info.mintAuthority;
    if (masterKey) {
      const masterEditionAccount = await connection.getAccountInfo(
        new PublicKey(masterKey),
      );
      if (masterEditionAccount) {
        const masterEditionAccountData = decodeMasterEdition(
          masterEditionAccount.data,
        );
        return {
          masterEditionAccountData,
          masterEditionAccount,
        };
      }
    }
  }
};
