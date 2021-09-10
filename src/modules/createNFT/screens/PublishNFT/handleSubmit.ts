import {
  IPartialCreateAuctionArgs,
  PriceFloor,
  PriceFloorType,
  useConnection,
  WinnerLimit,
  WinnerLimitType,
  WRAPPED_SOL_MINT,
} from '@oyster/common';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import BN from 'bn.js';
import { IPublishEnglishAuction } from './types';
import { createAuctionManager } from 'modules/common/actions/createAuctionManager';
import { useReactWeb3 } from 'modules/common/hooks/useReactWeb3';
const MIN_INCREMENTAL_PART = 0.05;

export const usePutOnSaleBidSubmit = () => {
  const connection = useConnection();
  const wallet = useWallet();
  const { account } = useReactWeb3();

  const handlePutOnSale = async ({
    payload,
    name,
    purchasePriceChecked,
    reservePriceChecked,
    tokenContract,
    tokenId,
  }: {
    name: string;
    purchasePriceChecked: boolean;
    reservePriceChecked: boolean;
    tokenContract: string;
    tokenId: string;
    payload: IPublishEnglishAuction;
  }) => {
    const params = {
      type: payload.type,
      purchasePrice: purchasePriceChecked ? payload.purchasePrice : '0',
      minBid: payload.minBid,
      minIncremental: new BigNumber(payload.minBid).multipliedBy(
        MIN_INCREMENTAL_PART,
      ),
      reservePrice: reservePriceChecked ? payload.reservePrice : '0',
      duration:
        process.env.REACT_APP_BASE_ENV === 'TEST'
          ? payload.duration * 60
          : payload.duration * 60 * 60 * 24,
      name,
      tokenContract,
      unitContract: payload.unitContract,
      tokenId,
      quantity: +payload.quantity,
      saleTime: payload.saleTimeEA,
    };
    console.log('---handleSubmit---', params);
    // TODO

    const winnerLimit = new WinnerLimit({
      type: WinnerLimitType.Capped,
      usize: new BN(1) as any,
    });
    const auctionSettings: IPartialCreateAuctionArgs = {
      winners: winnerLimit,
      // endAuctionAt is actually auction duration, poorly named, in seconds
      endAuctionAt: new BN(params.duration) as any,
      auctionGap: new BN(0) as any, // 1 minute in seconds
      priceFloor: new PriceFloor({
        type: payload.minBid ? PriceFloorType.Minimum : PriceFloorType.None,
        minPrice: new BN(
          (parseFloat(payload.minBid) || 0) * LAMPORTS_PER_SOL,
        ) as any,
      }),
      tokenMint: WRAPPED_SOL_MINT.toBase58(),
      gapTickSizePercentage: MIN_INCREMENTAL_PART,
      tickSize: null,
    };

    const attributesItems: any[] = [];
    const whitelistedCreatorsByCreator: any = {};
    const _auctionObj = await createAuctionManager(
      connection,
      {
        publicKey: account as unknown as PublicKey | null,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      },
      whitelistedCreatorsByCreator,
      auctionSettings,
      attributesItems,
      undefined,
      WRAPPED_SOL_MINT.toBase58(),
    );
    return _auctionObj;
  };
  return {
    handlePutOnSale,
  };
};
