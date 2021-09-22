import { Box } from '@material-ui/core';
import { useWallet } from '@solana/wallet-adapter-react';
import { Info } from 'modules/buyNFT/components/Info';
import { InfoDescr } from 'modules/buyNFT/components/InfoDescr';
import { InfoTabs } from 'modules/buyNFT/components/InfoTabs';
import { InfoTabsList } from 'modules/buyNFT/components/InfoTabsList';
import { MediaContainer } from 'modules/buyNFT/components/MediaContainer';
import { ScanBtn } from 'modules/buyNFT/components/ScanBtn';
import { TokenInfo } from 'modules/buyNFT/components/TokenInfo';
import { useArt } from 'modules/common/hooks/useArt';
import { useReactWeb3 } from 'modules/common/hooks/useReactWeb3';
import { t } from 'modules/i18n/utils/intl';
import { useCacheMetaData } from 'modules/profile/screens/Profile/cacheData';
import { Button } from 'modules/uiKit/Button';
import { useConnection, useUserAccounts } from 'npms/oystoer';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { mintEditionsToWallet } from './metaplex/mintEditionsIntoWallet';
import { useBuyNFTStyles } from './useBuyNFTStyles';

export const ShowNftDetail = () => {
  const classes = useBuyNFTStyles();
  const { accountByMint } = useUserAccounts();
  const { contract, artAddress } = useParams<{
    artAddress: string;
    contract: string;
  }>();
  const nftInfo = useCacheMetaData(contract, artAddress);
  const { address } = useReactWeb3();
  const wallets = useWallet();
  const art = useArt(contract, artAddress);
  const connection = useConnection();
  const artMintTokenAccount = accountByMint.get(art.mint!);

  const saleTime = false;
  const onChangeTime = () => {};
  const renderedComingSoon = <Box mt={2}>{t('common.coming-soon')}</Box>;

  const onMint = async () => {
    const toAddress = prompt(
      '输入要 mint to 的地址 （数量暂时默认为 1）',
      address,
    );
    if (!toAddress) return;
    console.log('art----------->', art);
    await mintEditionsToWallet(
      art,
      wallets!,
      connection,
      artMintTokenAccount!,
      1,
      toAddress || '',
      address || '',
    );
  };

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

          {/* TODO 需要加上屏蔽逻辑 */}
          <Button onClick={onMint}>Mint</Button>

          <InfoTabs
            tokenInfo={nftInfo ? renderedTokenInfoList : renderedComingSoon}
          />
        </Info>
      </div>
    );
    // eslint-disable-next-line
  }, [nftInfo]);
};
