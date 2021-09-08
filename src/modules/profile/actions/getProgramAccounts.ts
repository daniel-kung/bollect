import { AccountInfo } from '@solana/web3.js';
import axios from 'axios';

export const getProgramAccounts = async ({
  userAddress,
}: {
  userAddress: string;
}) =>
  new Promise((resolve, reject) => {
    axios
      .post('https://api.devnet.solana.com', {
        method: 'getProgramAccounts',
        jsonrpc: '2.0',
        params: [
          'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
          {
            encoding: 'jsonParsed',
            commitment: 'recent',
            filters: [
              {
                memcmp: {
                  offset: 326,
                  bytes: userAddress,
                },
              },
            ],
          },
        ],
        id: '748c9408-f6b9-48ef-a494-6f095b0e0560',
      })
      .then(e => {
        const unsafeRes = e.data;
        const data = (
          unsafeRes.result as Array<{
            account: AccountInfo<[string, string]>;
            pubkey: string;
          }>
        ).map(item => {
          return {
            account: {
              // TODO: possible delay parsing could be added here
              data: Buffer.from(item.account.data[0], 'base64'),
              executable: item.account.executable,
              lamports: item.account.lamports,
              // TODO: maybe we can do it in lazy way? or just use string
              owner: item.account.owner,
            } as AccountInfo<Buffer>,
            pubkey: item.pubkey,
          };
        });
        resolve(data);
      });
  });
