import { Container } from '@material-ui/core';
import {
  sendTransactions,
  sendTransactionWithRetry,
  SequenceType,
  useConnection,
} from 'npms/oystoer';
import { useWallet } from '@solana/wallet-adapter-react';
import { Keypair, TransactionInstruction } from '@solana/web3.js';
import { WhitelistedCreator } from 'models/metaplex';
import { setWhitelistedCreator } from 'models/metaplex/setWhitelistedCreator';
import { useReactWeb3 } from 'modules/common/hooks/useReactWeb3';
import { Button } from 'modules/uiKit/Button';
import { useState } from 'react';
import { DashTable } from './components/DashTable';
import { useDashBoardStyles } from './useDashBoardStyles';
import { useSelector } from 'react-redux';
import { RootState } from 'store';

export const DashBoard = () => {
  const classes = useDashBoardStyles();
  const storeWhiteCreators = useSelector(
    (state: RootState) => state.user.storeWhiteCreators,
  );
  const _whiteList = storeWhiteCreators.map(e => {
    return {
      name: e.account.info.name ?? '',
      address: e.address,
      activated: true,
    };
  });

  const [whiteList, setWhiteList] = useState(_whiteList || []);

  const { account } = useReactWeb3();
  const connection = useConnection();
  const wallet = useWallet();
  const addNewCreator = () => {
    const tarCreator = prompt('请输入你要增加的白名单');
    if (!tarCreator) return;
    setWhiteList([
      ...whiteList,
      {
        name: tarCreator,
        address: tarCreator,
        activated: true,
      },
    ]);
  };

  const handleSubmit = async () => {
    if (!account) throw new Error('未连接钱包');
    let signers: Array<Keypair[]> = [];
    let instructions: Array<TransactionInstruction[]> = [];
    // let storeSigners: Keypair[] = [];
    // let storeInstructions: TransactionInstruction[] = [];

    // 这里注入 store 的指令
    // await setStore(
    //   isPublic,
    //   wallet.publicKey.toBase58(),
    //   wallet.publicKey.toBase58(),
    //   storeInstructions,
    // );
    // signers.push(storeSigners);
    // instructions.push(storeInstructions);

    whiteList.forEach(async whitelistedCreator => {
      let wcSigners: Keypair[] = [];
      let wcInstructions: TransactionInstruction[] = [];

      const wc = new WhitelistedCreator(whitelistedCreator);
      // 这里循环注入命令
      await setWhitelistedCreator(
        wc.address,
        wc.activated,
        account.toBase58(),
        account.toBase58(),
        wcInstructions,
      );
      signers.push(wcSigners);
      instructions.push(wcInstructions);
    });

    if (!wallet.adapter) return;
    instructions.length === 1
      ? await sendTransactionWithRetry(
          connection,
          wallet.adapter,
          instructions[0],
          signers[0],
          'single',
        )
      : await sendTransactions(
          connection,
          wallet.adapter,
          instructions,
          signers,
          SequenceType.StopOnFailure,
          'single',
        );
  };

  return (
    <Container className={classes.root} maxWidth="xl">
      <DashTable tableDatas={whiteList} />

      <div className={classes.submitBtnWrapper}>
        <Button onClick={addNewCreator}>Add Creater</Button>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <Button onClick={handleSubmit}>Submit</Button>
      </div>
    </Container>
  );
};
