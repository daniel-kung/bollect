import {
  Box,
  Container,
  Grid,
  InputAdornment,
  InputLabel,
  Paper,
  Switch,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { useDispatchRequest } from '@redux-requests/react';
import BigNumber from 'bignumber.js';
import { add } from 'date-fns';
import { SelectTimeField } from '../../../form/components/SelectTimeField';
import { NftType } from 'modules/api/common/NftType';
import { Button } from 'modules/uiKit/Button';
import { Img } from 'modules/uiKit/Img';
import { Section } from 'modules/uiKit/Section';
import React, { useCallback, useMemo, useState } from 'react';
import { Field, Form, FormRenderProps } from 'react-final-form';
import { useHistory, useParams } from 'react-router';
import { AuctionType } from '../../../api/common/auctionType';
import { ReactComponent as QuestionIcon } from '../../../common/assets/question.svg';
import { VideoPlayer } from '../../../common/components/VideoPlayer';
import { Address } from '../../../common/types/unit';
import { InputField } from '../../../form/components/InputField';
import { SelectField } from '../../../form/components/SelectField';
import { FormErrors } from '../../../form/utils/FormErrors';
import { OnChange } from '../../../form/utils/OnChange';
import { t } from '../../../i18n/utils/intl';
import { GoBack } from '../../../layout/components/GoBack';
import { fetchCurrency } from '../../../overview/actions/fetchCurrency';
import {
  ProfileRoutesConfig,
  ProfileTab,
} from '../../../profile/ProfileRoutes';
import { useCurrencies } from '../../hooks/useCurrencies';
import { usePublishNFTtyles } from './usePublishNFTtyles';
import {
  UserRoleEnum,
  UserRoleType,
} from 'modules/common/actions/queryAccountInfo';
import { IItemRoyaltyRes } from 'modules/brand/components/RoyaltyDialog/action/fetchItemRoyalty';
import { RenderRoyalty } from './Royalty';
import { IPublishEnglishAuction, IPublishFixedSwap } from './types';
import { usePutOnSaleBidSubmit } from './handleSubmit';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { accountGetMasterEditionInfo } from 'modules/common/utils/solanaAccount';
import { decodeMetadata, useConnection } from 'npms/oystoer';
import { PublicKey } from '@solana/web3.js';
import { AmountRange, WinningConfigType } from 'models/metaplex';
import BN from 'bn.js';
import { TokenSymbol } from 'modules/common/types/TokenSymbol';

const MIN_AMOUNT = 1;

type IPublishNFTFormData = IPublishFixedSwap | IPublishEnglishAuction;

interface IPublishNFTComponentProps {
  name: string;
  tokenContract: string;
  nftType: NftType;
  tokenId: string;
  maxQuantity: number;
  onPublish: () => void;
  category: 'image' | 'video';
  file?: string;
  identity: UserRoleType;
  RoyaltyData: IItemRoyaltyRes | null;
}

export const PublishNFTComponent = ({
  name,
  tokenContract,
  nftType,
  tokenId,
  maxQuantity,
  onPublish,
  category,
  file,
  identity,
  RoyaltyData,
}: IPublishNFTComponentProps) => {
  const classes = usePublishNFTtyles();
  const dispatch = useDispatchRequest();
  const { push } = useHistory();
  const connection = useConnection();
  const { handlePutOnSale } = usePutOnSaleBidSubmit();
  const [purchasePriceChecked, setPurchasePriceChecked] = useState(true);
  const [reservePriceChecked, setReservePriceChecked] = useState(true);
  const storeWhiteCreators = useSelector(
    (state: RootState) => state.user.storeWhiteCreators,
  );
  const [loading, setLoading] = useState(false);

  const togglePurchasePriceChecked = useCallback(() => {
    setPurchasePriceChecked(prev => !prev);
  }, []);

  const toggleReservePriceChecked = useCallback(() => {
    setReservePriceChecked(prev => !prev);
  }, []);

  const { options: currencyOptions, default: defaultCurrency } =
    useCurrencies();

  const handleUnitChange = useCallback(
    (value: Address) => {
      dispatch(fetchCurrency({ unitContract: value }));
    },
    [dispatch],
  );

  const validateCreateNFT = useCallback(
    (payload: IPublishNFTFormData) => {
      const errors: FormErrors<IPublishNFTFormData> = {};
      const quantity = +payload.quantity;

      if (!quantity) {
        errors.quantity = t('validation.required');
      } else if (quantity < MIN_AMOUNT) {
        errors.quantity = t('validation.min', { value: MIN_AMOUNT });
      } else if (quantity > maxQuantity) {
        errors.quantity = t('validation.max', { value: maxQuantity });
      }

      if (payload.type === AuctionType.FixedSwap) {
        const price = +payload.price;
        if (!price) {
          errors.price = t('validation.required');
        } else if (price <= 0) {
          errors.price = t('validation.min', { value: 0 });
        }
      } else {
        const minBid = +payload.minBid;
        const purchasePrice = +payload.purchasePrice;
        const reservePrice = +payload.reservePrice;
        if (!minBid) {
          errors.minBid = t('validation.required');
        } else if (minBid <= 0) {
          errors.minBid = t('validation.min', { value: 0 });
        }

        if (purchasePriceChecked) {
          if (!purchasePrice) {
            errors.purchasePrice = t('validation.required');
          } else if (purchasePrice <= 0) {
            errors.purchasePrice = t('validation.min', { value: 0 });
          } else if (!reservePriceChecked && minBid >= purchasePrice) {
            errors.purchasePrice = t(
              'publish-nft.error.wrong-direct-bid-amount',
            );
          }
        }

        if (reservePriceChecked) {
          if (!reservePrice) {
            errors.reservePrice = t('validation.required');
          } else if (reservePrice <= 0) {
            errors.reservePrice = t('validation.min', { value: 0 });
          } else if (!purchasePriceChecked && minBid > reservePrice) {
            errors.purchasePrice = t(
              'publish-nft.error.wrong-reserve-bid-amount',
            );
          }
        }

        if (
          minBid &&
          purchasePriceChecked &&
          reservePriceChecked &&
          !(minBid <= reservePrice && reservePrice < purchasePrice)
        ) {
          errors.minBid = t(
            'publish-nft.error.wrong-direct-reserve-bid-amount',
          );
        }
      }

      return errors;
    },
    [maxQuantity, purchasePriceChecked, reservePriceChecked],
  );

  const durationOptions = useMemo(
    () => [
      {
        label: t('unit.day', { value: 3 }),
        value: 3,
      },
      {
        label: t('unit.day', { value: 5 }),
        value: 5,
      },
      {
        label: t('unit.day', { value: 7 }),
        value: 7,
      },
      {
        label: t('unit.day', { value: 14 }),
        value: 14,
      },
      {
        label: t('unit.day', { value: 30 }),
        value: 30,
      },
    ],
    [],
  );

  const handleSubmit = useCallback(
    async (payload: IPublishNFTFormData) => {
      setLoading(true);
      const metadataAccount = await connection.getAccountInfo(
        new PublicKey(tokenId),
      );
      const masterEdition = await accountGetMasterEditionInfo({
        publicKey: tokenId,
        connection,
      });
      if (
        payload.type === AuctionType.EnglishAuction &&
        metadataAccount?.data
      ) {
        const auctionObj = await handlePutOnSale({
          name,
          purchasePriceChecked,
          reservePriceChecked,
          tokenContract,
          tokenId,
          payload,
          storeWhiteCreators,
          attributesItems: [
            {
              masterEdition: masterEdition
                ? {
                    info: masterEdition.masterEditionAccountData,
                    pubkey: tokenId,
                    account: masterEdition.masterEditionAccount,
                  }
                : undefined,
              // TODO edition
              // edition: {},
              metadata: {
                info: decodeMetadata(metadataAccount.data),
                pubkey: tokenId,
                account: metadataAccount,
              },
              holding: tokenId,
              winningConfigType: WinningConfigType.FullRightsTransfer,
              amountRanges: [
                new AmountRange({
                  amount: new BN(1),
                  length: new BN(1),
                }),
              ],
            },
          ],
        });
        console.log('auctionObj------>', auctionObj);
        push(ProfileRoutesConfig.UserProfile.generatePath(ProfileTab.sells));
      }
      setLoading(false);
    },
    [
      connection,
      tokenId,
      handlePutOnSale,
      name,
      purchasePriceChecked,
      reservePriceChecked,
      tokenContract,
      storeWhiteCreators,
      push,
    ],
  );

  const isVerify = identity === UserRoleEnum.Verified;
  const renderForm = ({
    handleSubmit,
    values,
  }: FormRenderProps<IPublishNFTFormData>) => {
    return (
      <Box className={classes.form} component="form" onSubmit={handleSubmit}>
        <OnChange name="unitContract">{handleUnitChange}</OnChange>
        <div className={classes.formImgCol}>
          {file && (
            <Paper className={classes.formImgBox} variant="outlined">
              {category === 'image' ? (
                <Img
                  src={file}
                  alt={name}
                  title={name}
                  ratio="1x1"
                  objectFit="scale-down"
                />
              ) : (
                <VideoPlayer src={file} objectFit="cover" />
              )}
            </Paper>
          )}

          <Box mt={2}>
            <Typography variant="h2" className={classes.textCenter}>
              {name}
            </Typography>
          </Box>
        </div>

        <div>
          {values.type === AuctionType.FixedSwap ? (
            <></>
          ) : (
            <>
              <Box className={classes.formControl}>
                <Field
                  component={InputField}
                  name="minBid"
                  type="number"
                  label={t('publish-nft.label.minBid')}
                  color="primary"
                  fullWidth={true}
                  inputProps={{
                    step: 'any',
                    min: '0',
                    inputMode: 'decimal',
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {TokenSymbol.SOLANA}
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box className={classes.formControl}>
                <Field
                  component={InputField}
                  name="quantity"
                  type="number"
                  label={t('publish-nft.label.amount')}
                  color="primary"
                  fullWidth={true}
                  disabled={nftType === NftType.ERC721}
                  inputProps={{
                    step: 1,
                    min: '0',
                    inputMode: 'decimal',
                  }}
                />
                <div className={classes.fieldText}>
                  {t('publish-nft.auction-amount')}
                </div>
              </Box>

              <Box className={classes.formControl}>
                <Field
                  component={SelectField}
                  name="duration"
                  color="primary"
                  fullWidth={true}
                  options={durationOptions}
                  label={
                    <Box display="flex" alignItems="center">
                      {t('publish-nft.label.duration')}

                      <Tooltip title={t('publish-nft.tooltip.duration')}>
                        <Box component="i" ml={1}>
                          <QuestionIcon />
                        </Box>
                      </Tooltip>
                    </Box>
                  }
                />

                <div className={classes.fieldText}>
                  {t('publish-nft.expire', {
                    value: add(
                      isVerify &&
                        values.saleTimeEA?.open &&
                        values.saleTimeEA?.time
                        ? values.saleTimeEA?.time
                        : new Date(),
                      {
                        days: +values.duration,
                      },
                    ),
                  })}
                </div>
              </Box>

              {isVerify && (
                <Box className={classes.formControl}>
                  <Field
                    component={SelectTimeField}
                    name="saleTimeEA"
                    type="text"
                    label={t('create-nft.label.specific-time-sale')}
                    color="primary"
                    fullWidth={true}
                  />
                </Box>
              )}

              <Box className={classes.formControl}>
                <Box mb={2.5}>
                  <Grid container alignItems="center">
                    <Grid item xs>
                      <InputLabel shrink className={classes.labelNoMargin}>
                        <Box display="flex" alignItems="center">
                          {t('publish-nft.label.directPurchase')}

                          <Tooltip
                            title={t('publish-nft.tooltip.directPurchase')}
                          >
                            <Box component="i" ml={1}>
                              <QuestionIcon />
                            </Box>
                          </Tooltip>
                        </Box>
                      </InputLabel>
                    </Grid>

                    <Grid item>
                      <Switch
                        checked={purchasePriceChecked}
                        onChange={togglePurchasePriceChecked}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {purchasePriceChecked && (
                  <Field
                    component={InputField}
                    name="purchasePrice"
                    type="number"
                    color="primary"
                    fullWidth={true}
                    inputProps={{
                      step: 'any',
                      min: '0',
                      inputMode: 'decimal',
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Field
                            component={SelectField}
                            name="unitContract"
                            color="primary"
                            fullWidth
                            options={currencyOptions}
                            className={classes.currencySelect}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </Box>

              <Box className={classes.formControl}>
                <Box mb={2.5}>
                  <Grid container alignItems="center">
                    <Grid item xs>
                      <InputLabel shrink className={classes.labelNoMargin}>
                        <Box display="flex" alignItems="center">
                          {t('publish-nft.label.reservePrice')}

                          <Tooltip
                            title={t('publish-nft.tooltip.reservePrice')}
                          >
                            <Box component="i" ml={1}>
                              <QuestionIcon />
                            </Box>
                          </Tooltip>
                        </Box>
                      </InputLabel>
                    </Grid>

                    <Grid item>
                      <Switch
                        checked={reservePriceChecked}
                        onChange={toggleReservePriceChecked}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {reservePriceChecked && (
                  <Field
                    component={InputField}
                    name="reservePrice"
                    type="number"
                    color="primary"
                    fullWidth={true}
                    inputProps={{
                      step: 'any',
                      min: '0',
                      inputMode: 'decimal',
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Field
                            component={SelectField}
                            name="unitContract"
                            color="primary"
                            fullWidth={true}
                            options={currencyOptions}
                            className={classes.currencySelect}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </Box>
            </>
          )}

          {RoyaltyData && <RenderRoyalty RoyaltyData={RoyaltyData} />}

          <Box>
            <Button size="large" type="submit" fullWidth loading={loading}>
              {loading ? t('publish-nft.submitting') : t('publish-nft.submit')}
            </Button>
          </Box>
        </div>
      </Box>
    );
  };

  return (
    <Section>
      <Container maxWidth="lg">
        <Box mb={3.5}>
          <GoBack />
        </Box>
        <Box mb={6}>
          <Typography variant="h1">{t('publish-nft.title')}</Typography>
        </Box>
        <Box>
          <Form
            onSubmit={handleSubmit}
            render={renderForm}
            validate={validateCreateNFT}
            initialValues={
              {
                type: AuctionType.EnglishAuction,
                unitContract: defaultCurrency,
                duration: durationOptions[0].value,
                quantity: maxQuantity.toString(),
              } as Partial<IPublishEnglishAuction>
            }
          />
        </Box>
      </Container>
    </Section>
  );
};

export const PublishNFT = () => {
  const { id, contract } = useParams<{
    contract: string;
    id: string;
  }>();
  const { replace } = useHistory();

  const handlePublish = useCallback(() => {
    replace(ProfileRoutesConfig.UserProfile.generatePath());
  }, [replace]);

  return (
    <>
      <PublishNFTComponent
        name={'itemName'}
        tokenContract={contract}
        tokenId={id}
        nftType={1}
        file={'https://baidu.com'}
        category={'image'}
        maxQuantity={11}
        onPublish={handlePublish}
        identity={UserRoleEnum.Verified}
        RoyaltyData={{
          remainingRatio: new BigNumber(1),
          platformFee: new BigNumber(1),
          royaltyFee: new BigNumber(1),
        }}
      />
    </>
  );
};
