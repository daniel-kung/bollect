import { Box } from '@material-ui/core';
import { Info } from 'modules/buyNFT/components/Info';
import { InfoDescr } from 'modules/buyNFT/components/InfoDescr';
import { InfoTabs } from 'modules/buyNFT/components/InfoTabs';
import { InfoTabsList } from 'modules/buyNFT/components/InfoTabsList';
import { MediaContainer } from 'modules/buyNFT/components/MediaContainer';
import { ScanBtn } from 'modules/buyNFT/components/ScanBtn';
import { TokenInfo } from 'modules/buyNFT/components/TokenInfo';
import { t } from 'modules/i18n/utils/intl';
import { useCacheMetaData } from 'modules/profile/screens/Profile/cacheData';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useBuyNFTStyles } from './useBuyNFTStyles';

export const BuyItemNFT = () => {
  const classes = useBuyNFTStyles();
  const { contract, artAddress } = useParams<{
    artAddress: string;
    contract: string;
  }>();
  const nftInfo = useCacheMetaData(contract, artAddress);

  const saleTime = false;
  const onChangeTime = () => {};

  const renderedComingSoon = <Box mt={2}>{t('common.coming-soon')}</Box>;

  const renderedTokenInfoList = (
    <InfoTabsList>
      <ScanBtn contractAddress={nftInfo?.pubkey || ''} />

      <TokenInfo
        name={nftInfo?.name || ''}
        itemSymbol={'BOUNCE'}
        standard={undefined}
        contractAddress={nftInfo?.pubkey || ''}
        supply={0}
        tokenId={0}
      />
    </InfoTabsList>
  );

  return useMemo(() => {
    if (!nftInfo) return <></>;
    return (
      <div className={classes.root}>
        <MediaContainer
          className={classes.imgContainer}
          src={nftInfo.image || ''}
          title={''}
          description={''}
          category={'image'}
          isOpenSaleTime={saleTime}
          onchange={onChangeTime}
          LikeBtn={<></>}
        />
        <Info className={classes.info}>
          <InfoDescr
            title={nftInfo.name || ''}
            description={nftInfo.description || ''}
            // copiesCurrent={item.balance}
            currentPage="itemDetail"
            // copiesTotal={item.supply}
            // creator={renderedCreator}
            // owner={renderedCollection()}
            LikeBtn={<></>}
          />

          <InfoTabs
            tokenInfo={nftInfo ? renderedTokenInfoList : renderedComingSoon}
          />
        </Info>
      </div>
    );
    // eslint-disable-next-line
  }, [nftInfo]);
};
