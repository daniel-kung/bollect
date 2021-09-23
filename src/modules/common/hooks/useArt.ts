import { useEffect, useMemo, useState } from 'react';
import { useMeta } from 'contexts';
import { Art, Artist, ArtType } from 'contexts/meta/types';
import {
  decodeMetadata,
  Edition,
  IMetadataExtension,
  MasterEditionV1,
  MasterEditionV2,
  Metadata,
  ParsedAccount,
  StringPublicKey,
  useConnection,
} from 'npms/oystoer';
import { WhitelistedCreator } from 'models/metaplex';
import { Cache } from 'three';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { accountGetMasterEditionInfo } from '../utils/solanaAccount';
import { AccountInfo, PublicKey } from '@solana/web3.js';

const metadataToArt = (
  info: Metadata | undefined,
  editions: Record<string, ParsedAccount<Edition>>,
  whitelistedCreatorsByCreator: Record<
    string,
    ParsedAccount<WhitelistedCreator>
  >,
  masterEdition?: {
    masterEditionAccountData: MasterEditionV1 | MasterEditionV2;
    masterEditionAccount: AccountInfo<Buffer>;
    masterKey: string;
  },
) => {
  console.log('info--->', info);
  console.log('masterEdition--->', masterEdition);
  let type: ArtType = ArtType.NFT;
  let editionNumber: number | undefined = undefined;
  let maxSupply: number | undefined = undefined;
  let supply: number | undefined = undefined;

  if (info) {
    // const edition = editions[info.edition || ''];
    const edition = '';
    if (edition) {
      // const myMasterEdition = masterEditions[edition.info.parent || ''];
      const myMasterEdition = masterEdition?.masterEditionAccountData;
      if (myMasterEdition) {
        type = ArtType.Print;
        // editionNumber = edition.info.edition.toNumber();
        editionNumber = 1;
        supply = myMasterEdition?.supply.toNumber() || 0;
      }
    } else if (masterEdition) {
      type = ArtType.Master;
      maxSupply = masterEdition.masterEditionAccountData.maxSupply?.toNumber();
      supply = masterEdition.masterEditionAccountData.supply.toNumber();
    }
  }

  return {
    uri: info?.data.uri || '',
    mint: info?.mint,
    title: info?.data.name,
    creators: (info?.data.creators || [])
      .map(creator => {
        const knownCreator = whitelistedCreatorsByCreator[creator.address];

        return {
          address: creator.address,
          verified: creator.verified,
          share: creator.share,
          image: knownCreator?.info.image || '',
          name: knownCreator?.info.name || '',
          link: knownCreator?.info.twitter || '',
        } as Artist;
      })
      .sort((a, b) => {
        const share = (b.share || 0) - (a.share || 0);
        if (share === 0) {
          return a.name.localeCompare(b.name);
        }

        return share;
      }),
    seller_fee_basis_points: info?.data.sellerFeeBasisPoints || 0,
    edition: editionNumber,
    maxSupply,
    supply,
    type,
  } as Art;
};

const cachedImages = new Map<string, string>();
export const useCachedImage = (uri: string, cacheMesh?: boolean) => {
  const [cachedBlob, setCachedBlob] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!uri) {
      return;
    }

    const result = cachedImages.get(uri);
    if (result) {
      setCachedBlob(result);
      return;
    }

    (async () => {
      let response: Response;
      try {
        response = await fetch(uri, { cache: 'force-cache' });
      } catch {
        try {
          response = await fetch(uri, { cache: 'reload' });
        } catch {
          // If external URL, just use the uri
          if (uri?.startsWith('http')) {
            setCachedBlob(uri);
          }
          setIsLoading(false);
          return;
        }
      }

      const blob = await response.blob();
      if (cacheMesh) {
        // extra caching for meshviewer
        Cache.enabled = true;
        Cache.add(uri, await blob.arrayBuffer());
      }
      const blobURI = URL.createObjectURL(blob);
      cachedImages.set(uri, blobURI);
      setCachedBlob(blobURI);
      setIsLoading(false);
    })();
  }, [uri, setCachedBlob, setIsLoading, cacheMesh]);

  return { cachedBlob, isLoading };
};

export const useArt = (key?: StringPublicKey, artAdress?: StringPublicKey) => {
  const { editions } = useMeta();
  const connection = useConnection();
  const storeWhiteCreators = useSelector(
    (state: RootState) => state.user.storeWhiteCreators,
  ).reduce<any>((pre, c) => {
    pre[c.address] = c.account;
    return pre;
  }, {});

  const [masterEdition, setMasterEdition] = useState<{
    masterEditionAccountData: MasterEditionV1 | MasterEditionV2;
    masterEditionAccount: AccountInfo<Buffer>;
    masterKey: string;
  }>();
  const [accountInfo, setAccountInfo] = useState<Metadata>();
  useEffect(() => {
    const initData = async () => {
      if (!key) {
        return;
      }
      setMasterEdition(
        await accountGetMasterEditionInfo({ publicKey: key, connection }),
      );
      const account = await connection.getAccountInfo(new PublicKey(key));
      if (account) {
        setAccountInfo(decodeMetadata(account.data));
      }
    };
    initData();
  }, [connection, key]);

  const art = useMemo(
    () =>
      metadataToArt(accountInfo, editions, storeWhiteCreators, masterEdition),
    [accountInfo, editions, masterEdition, storeWhiteCreators],
  );

  return art;
};

const routeCDN = (uri: string) => {
  const USE_CDN = false;
  let result = uri;
  if (USE_CDN) {
    result = uri.replace(
      'https://arweave.net/',
      'https://coldcdn.com/api/cdn/bronil/',
    );
    return result;
  }

  return result;
};

export const useExtendedArt = (uri: string) => {
  const [data, setData] = useState<IMetadataExtension>();

  useEffect(() => {
    if (uri && !data) {
      if (uri) {
        const processJson = (extended: any) => {
          if (!extended || extended?.properties?.files?.length === 0) {
            return;
          }

          if (extended?.image) {
            const file = extended.image.startsWith('http')
              ? extended.image
              : `${uri}/${extended.image}`;
            extended.image = routeCDN(file);
          }

          return extended;
        };

        try {
          const cached = localStorage.getItem(uri);
          if (cached) {
            setData(processJson(JSON.parse(cached)));
          } else {
            // TODO: BL handle concurrent calls to avoid double query
            fetch(uri)
              .then(async _ => {
                try {
                  const data = await _.json();
                  try {
                    localStorage.setItem(uri, JSON.stringify(data));
                  } catch {
                    // ignore
                  }
                  setData(processJson(data));
                } catch {
                  return undefined;
                }
              })
              .catch(() => {
                return undefined;
              });
          }
        } catch (ex) {
          console.error(ex);
        }
      }
    }
  }, [data, setData, uri]);

  return { data };
};
