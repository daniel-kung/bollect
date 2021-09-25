import { Connection } from '@solana/web3.js';
import { getProgramAccounts } from 'contexts/meta/loadAccounts';
import { AUCTION_ID, BIDDER_POT_LEN } from 'npms/oystoer';

interface myBidderPotProps {
  connection: Connection;
  walletPubkey: string;
  auctionPubkey: string;
}

export const getMyBidderPot = async ({
  connection,
  walletPubkey,
  auctionPubkey,
}: myBidderPotProps) => {
  const biderPot = await getProgramAccounts(connection, AUCTION_ID, {
    filters: [
      {
        dataSize: BIDDER_POT_LEN,
      },
      {
        memcmp: {
          offset: 32,
          //  bidderAct
          bytes: walletPubkey,
        },
      },
      {
        memcmp: {
          offset: 32 + 32,
          //  auctionAct
          bytes: auctionPubkey,
        },
      },
    ],
  });
  return biderPot;
};
