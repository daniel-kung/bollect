import BigNumber from 'bignumber.js';
import { IPublishEnglishAuction } from './types';
const MIN_INCREMENTAL_PART = 0.05;

export const putOnSaleBidSubmit = ({
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
};
