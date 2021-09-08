import { Button } from 'modules/uiKit/Button';
import { useProductCardStyles } from 'modules/common/components/ProductCard/useProductCardStyles';
import { ProductCards } from 'modules/common/components/ProductCards';
import { t } from 'modules/i18n/utils/intl';
import { IMyMintItem, useMintMetaData } from 'modules/profile/hooks/useMyMint';
import { Link as RouterLink } from 'react-router-dom';
import { RoutesConfiguration } from 'modules/createNFT/Routes';
import { useExtendedArt } from 'modules/common/hooks/useArt';
import { Img } from 'modules/uiKit/Img';
import { uid } from 'react-uid';

export const TabOwned: React.FC<{
  isOther?: boolean;
  address?: string;
  reload?: () => void;
}> = function ({ isOther = false, address: artAddress, reload }) {
  const { data: list, loading } = useMintMetaData();

  return (
    <ProductCards isLoading={loading}>
      {list.map(e => {
        return <Item key={uid(e)} item={e} />;
      })}
    </ProductCards>
  );
};

const Item: React.FC<{ item: IMyMintItem }> = ({ item }) => {
  const classes = useProductCardStyles();
  const { data } = useExtendedArt(item.uri);

  return (
    <div
      style={{
        border: '1px solid rgba(0,0,0,.1)',
        padding: 20,
        borderRadius: 15,
      }}
    >
      <Img src={data?.image} />
      <h2>{item.name}</h2>
      <Button
        className={classes.saleBtn}
        component={RouterLink}
        variant="outlined"
        rounded
        to={RoutesConfiguration.PublishNft.generatePath(
          'contractaddress',
          item.pubkey,
        )}
      >
        {t('product-card.put-on-sale')}
      </Button>
    </div>
  );
};
