import {
  createAssociatedTokenAccountInstruction,
  createMint,
  createMetadata,
  programIds,
  notify,
  ENV,
  updateMetadata,
  createMasterEdition,
  sendTransactionWithRetry,
  Data,
  Creator,
  findProgramAddress,
  StringPublicKey,
  toPublicKey,
  WalletSigner,
  Attribute,
} from 'npms/oystoer';
import React from 'react';
import { MintLayout, Token } from '@solana/spl-token';
import { Keypair, Connection, TransactionInstruction } from '@solana/web3.js';
import crypto from 'crypto';
import BN from 'bn.js';
import { uploadFile } from 'modules/common/actions/uploadFile';
import { DispatchRequest } from '@redux-requests/core';

export const mintNFT = async (
  connection: Connection,
  wallet: WalletSigner | undefined,
  env: ENV,
  metadata: {
    name: string;
    symbol: string;
    description: string;
    image: string | undefined;
    animation_url: string | undefined;
    attributes: Attribute[] | undefined;
    external_url: string;
    properties: any;
    creators: Creator[] | null;
    sellerFeeBasisPoints: number;
  },
  maxSupply: number,
  dispatchRequest: DispatchRequest,
): Promise<{
  metadataAccount: StringPublicKey;
} | void> => {
  if (!wallet?.publicKey) return;

  const metadataContent = {
    name: metadata.name,
    symbol: metadata.symbol,
    description: metadata.description,
    seller_fee_basis_points: metadata.sellerFeeBasisPoints,
    image: metadata.image,
    animation_url: metadata.animation_url,
    attributes: metadata.attributes,
    external_url: metadata.external_url,
    properties: {
      ...metadata.properties,
      creators: metadata.creators?.map(creator => {
        return {
          address: creator.address,
          share: creator.share,
        };
      }),
    },
  };

  const metadataContentFile = new File(
    [JSON.stringify(metadataContent)],
    'metadata.json',
  );
  const realFiles: File[] = [metadataContentFile];

  const { instructions: pushInstructions, signers: pushSigners } =
    await prepPayForFilesTxn(wallet, realFiles, metadata);

  const TOKEN_PROGRAM_ID = programIds().token;

  const mintRent = await connection.getMinimumBalanceForRentExemption(
    MintLayout.span,
  );

  const payerPublicKey = wallet.publicKey.toBase58();
  const instructions: TransactionInstruction[] = [...pushInstructions];
  const signers: Keypair[] = [...pushSigners];

  const mintKey = createMint(
    instructions,
    wallet.publicKey,
    mintRent,
    0,
    // Some weird bug with phantom where it's public key doesnt mesh with data encode wellff
    toPublicKey(payerPublicKey),
    toPublicKey(payerPublicKey),
    signers,
  ).toBase58();

  const recipientKey = (
    await findProgramAddress(
      [
        wallet.publicKey.toBuffer(),
        programIds().token.toBuffer(),
        toPublicKey(mintKey).toBuffer(),
      ],
      programIds().associatedToken,
    )
  )[0];

  createAssociatedTokenAccountInstruction(
    instructions,
    toPublicKey(recipientKey),
    wallet.publicKey,
    wallet.publicKey,
    toPublicKey(mintKey),
  );

  const metadataAccount = await createMetadata(
    new Data({
      symbol: metadata.symbol,
      name: metadata.name,
      uri: 'x'.repeat(64), // size of url for arweave
      sellerFeeBasisPoints: metadata.sellerFeeBasisPoints,
      creators: metadata.creators,
    }),
    payerPublicKey,
    mintKey,
    payerPublicKey,
    instructions,
    wallet.publicKey.toBase58(),
  );

  const { txid } = await sendTransactionWithRetry(
    connection,
    wallet,
    instructions,
    signers,
  );

  try {
    await connection.confirmTransaction(txid, 'max');
  } catch {
    // ignore
  }

  // Force wait for max confirmations
  // await connection.confirmTransaction(txid, 'max');
  await connection.getParsedConfirmedTransaction(txid, 'confirmed');

  /* // this means we're done getting AR txn setup. Ship it off to ARWeave!
  const data = new FormData();

  const tags = realFiles.reduce(
    (acc: Record<string, Array<{ name: string; value: string }>>, f) => {
      acc[f.name] = [{ name: 'mint', value: mintKey }];
      return acc;
    },
    {},
  );
  data.append('tags', JSON.stringify(tags));
  data.append('transaction', txid);
  realFiles.map(f => data.append('file[]', f));

  // TODO: convert to absolute file name for image

  const result: IArweaveResult = await (
    await fetch(
      // TODO: add CNAME
      env.startsWith('mainnet-beta')
        ? 'https://us-central1-principal-lane-200702.cloudfunctions.net/uploadFileProd2'
        : 'https://us-central1-principal-lane-200702.cloudfunctions.net/uploadFile2',
      {
        method: 'POST',
        body: data,
      },
    )
  ).json();

  const metadataFile = result.messages?.find(
    m => m.filename === RESERVED_TXN_MANIFEST,
  );
   */

  // TODO: connect to testnet arweave
  console.log('metadataContent, realFiles');
  console.log(metadataContent, realFiles);
  const { data } = await dispatchRequest(
    uploadFile({ file: metadataContentFile }),
  );
  const metadataUri = data?.result?.path;

  if (metadataUri && wallet.publicKey) {
    const updateInstructions: TransactionInstruction[] = [];
    const updateSigners: Keypair[] = [];

    await updateMetadata(
      new Data({
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadataUri,
        creators: metadata.creators,
        sellerFeeBasisPoints: metadata.sellerFeeBasisPoints,
      }),
      undefined,
      undefined,
      mintKey,
      payerPublicKey,
      updateInstructions,
      metadataAccount,
    );

    updateInstructions.push(
      Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        toPublicKey(mintKey),
        toPublicKey(recipientKey),
        toPublicKey(payerPublicKey),
        [],
        1,
      ),
    );
    // // In this instruction, mint authority will be removed from the main mint, while
    // // minting authority will be maintained for the Printing mint (which we want.)
    await createMasterEdition(
      maxSupply !== undefined ? (new BN(maxSupply) as any) : undefined,
      mintKey,
      payerPublicKey,
      payerPublicKey,
      payerPublicKey,
      updateInstructions,
    );

    // TODO: enable when using payer account to avoid 2nd popup
    /*  if (maxSupply !== undefined)
      updateInstructions.push(
        setAuthority({
          target: authTokenAccount,
          currentAuthority: payerPublicKey,
          newAuthority: wallet.publicKey,
          authorityType: 'AccountOwner',
        }),
      );
*/
    // TODO: enable when using payer account to avoid 2nd popup
    // Note with refactoring this needs to switch to the updateMetadataAccount command
    // await transferUpdateAuthority(
    //   metadataAccount,
    //   payerPublicKey,
    //   wallet.publicKey,
    //   updateInstructions,
    // );

    await sendTransactionWithRetry(
      connection,
      wallet,
      updateInstructions,
      updateSigners,
    );

    notify({
      message: 'Art created on Solana',
      description: (
        <a href={metadataUri} target="_blank" rel="noopener noreferrer">
          Arweave Link
        </a>
      ),
      type: 'success',
    });
  }

  return { metadataAccount };
};

export const prepPayForFilesTxn = async (
  wallet: WalletSigner,
  files: File[],
  metadata: any,
): Promise<{
  instructions: TransactionInstruction[];
  signers: Keypair[];
}> => {
  const memo = programIds().memo;

  const instructions: TransactionInstruction[] = [];
  const signers: Keypair[] = [];

  for (let i = 0; i < files.length; i++) {
    const hashSum = crypto.createHash('sha256');
    hashSum.update(await files[i].text());
    const hex = hashSum.digest('hex');
    instructions.push(
      new TransactionInstruction({
        keys: [],
        programId: memo,
        data: Buffer.from(hex),
      }),
    );
  }

  return {
    instructions,
    signers,
  };
};
