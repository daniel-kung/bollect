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
      <ScanBtn contractAddress={''} />

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

// { renderMedia() }
/* <Info className={classes.info}>
      <InfoDescr
        title={item.itemName}
        description={item.description}
        // copiesCurrent={item.balance}
        currentPage="itemDetail"
        copiesTotal={item.supply}
        creator={renderedCreator}
        owner={renderedCollection()}
        LikeBtn={<></>}
      />
      <InfoTabs
        tabs={[NftInfoOwnersOption, NftInfoDetailOption]}
        tokenInfo={renderedTokenInfoList}
        owners={<RenderedDetailOwnersList list={poolNftOwner} />}
      />
    </Info> */
// </div >
// <Queries<
//   ResponseData<typeof fetchItem>,
//   ResponseData<typeof fetchItem2>,
//   ResponseData<typeof fetchPoolNftOwner>
// >
//   requestActions={[fetchItem, fetchItem2, fetchPoolNftOwner]}
//   noDataMessage={<BuyNFTSkeleton />}
// >
//   {({ data: item }, { data: poolDetails }, { data: poolNftOwner }) => {
// const renderedCreator = (
//   <ProfileInfo
//     key={uid(item)}
//     subTitle={t('details-nft.role.minter')}
//     title={wrapperTitle(
//       poolDetails?.minter?.username,
//       poolDetails?.minter?.address,
//     )}
//     users={[
//       {
//         name: wrapperTitle(
//           poolDetails?.minter?.username,
//           poolDetails?.minter?.address,
//         ),
//         href: ProfileRoutesConfig.OtherProfile.generatePath(
//           poolDetails?.minter?.address,
//         ),
//         avatar: poolDetails?.minter?.avatar,
//         verified: item?.identity === UserRoleEnum.Verified,
//       },
//     ]}
//   />
// );
// const shieldNameList = ['', 'BOUNCE'];
// const renderedCollection = () => {
//   return !shieldNameList.includes(
//     poolDetails?.collection.name || '',
//   ) ? (
//     <>
//       {poolDetails?.collection?.address && (
//         <ProfileInfo
//           subTitle={t('details-nft.role.collection')}
//           title={wrapperTitle(
//             poolDetails.collection.name,
//             poolDetails.collection.address,
//           )}
//           users={[
//             {
//               name: poolDetails.collection.name,
//               avatar: poolDetails.collection.avatar,
//               href: ProfileRoutesConfig.Collection.generatePath(
//                 poolDetails.collection.address,
//               ),
//               verified: item?.identity === UserRoleEnum.Verified,
//             },
//           ]}
//         />
//       )}
//     </>
//   ) : (
//     <></>
//   );
// };

// const renderedTokenInfoList = (
//   <InfoTabsList>
//     <ScanBtn contractAddress={item.contractAddress} />
//     <TokenInfo
//       name={item.itemName}
//       itemSymbol={item.itemSymbol}
//       standard={item.standard}
//       contractAddress={item.contractAddress}
//       supply={item.supply}
//       tokenId={item.id}
//     />
//   </InfoTabsList>
// );

//     return (

//     );
//   }}
// </Queries>
//   );
// };
