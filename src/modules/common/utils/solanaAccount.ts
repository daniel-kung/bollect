import {
  decodeMasterEdition,
  decodeMetadata,
  ENDPOINTS,
  METAPLEX_ID,
  ParsedAccount,
} from 'npms/oystoer';
import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';
import { getProgramAccounts } from 'contexts/meta/loadAccounts';
import { processMetaplexAccounts } from 'contexts/meta/processMetaplexAccounts';
import {
  MAX_WHITELISTED_CREATOR_SIZE,
  WhitelistedCreator,
} from 'models/metaplex';

export const getAccountInfo = (publicKey: string) => {
  return axios.post(ENDPOINTS[0].endpoint, {
    method: 'getAccountInfo',
    jsonrpc: '2.0',
    params: [publicKey, { encoding: 'jsonParsed' }],
    // TODO web3 PR
    id: '5b5044f3-b12b-4904-8d79-a2affae6247b',
  });
};

export const getAccountTokenSpl = async ({
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
  if (account) {
    const mint = decodeMetadata(account.data).mint;

    const tokenLspAccounts = await connection.getTokenLargestAccounts(
      new PublicKey(mint),
    );
    const holding = tokenLspAccounts.value[0].address.toBase58();
    return holding;
  }
  new Error('SPL Error');
  return '';
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
      console.log('masterKey------>', masterKey);
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
          masterKey,
        };
      }
    }
  }
};

export const getCreators = async ({
  connection,
}: {
  connection: Connection;
}) => {
  const _creators = await getProgramAccounts(connection, METAPLEX_ID, {
    filters: [
      {
        dataSize: MAX_WHITELISTED_CREATOR_SIZE,
      },
    ],
  });
  let creators: {
    address: string;
    account: ParsedAccount<WhitelistedCreator>;
  }[] = [];
  for (const creator of _creators) {
    await processMetaplexAccounts(
      creator,
      (key, address, account) => {
        creators.push({ address, account });
      },
      false,
    );
  }
  return creators;
};
