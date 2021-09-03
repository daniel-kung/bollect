import { Box, Dialog, IconButton, Typography } from '@material-ui/core';
import { CloseIcon } from 'modules/common/components/Icons/CloseIcon';
// import { t } from 'modules/i18n/utils/intl';
import { useWalletModalStyles } from './useWalletModalStyles';
import WalletItem from './WalletItem';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-wallets';
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionSignature,
} from '@solana/web3.js';
import { useState } from 'react';
import BigNumber from 'bignumber.js';
import bs58 from 'bs58';

export interface IBurnFormValues {
  royaltyRate: string;
}

interface IBurnTokenDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal = ({ isOpen, onClose }: IBurnTokenDialogProps) => {
  const classes = useWalletModalStyles();
  const { connection } = useConnection();
  const { wallet, select, adapter, signTransaction, signMessage } = useWallet();
  const [publicKey, setPublicKey] = useState<PublicKey | null>();

  const handelConnect = (name: WalletName) => {
    try {
      select(name);
    } catch (error) {
      console.log(error);
    }
  };

  const handleQueryStatus = () => {
    adapter && console.log('当前钱包状态', adapter.connected);
    adapter && console.log('链接钱包', wallet);
  };

  const handleConnect = () => {
    adapter &&
      adapter
        .connect()
        .then(() => {
          alert('链接成功');
          setPublicKey(adapter?.publicKey || null);
        })
        .catch(() => {});
  };

  const handleDisConnect = () => {
    adapter &&
      adapter
        .disconnect()
        .then(() => {
          alert('断开连接');
          setPublicKey(null);
        })
        .catch(() => {});
  };

  const handleSendTransfer = async () => {
    if (!publicKey) {
      alert('error: 未连接钱包');
      return;
    }

    let signature: TransactionSignature = '';
    console.log('publicKey', publicKey.toString());
    console.log('Keypair', Keypair.generate().publicKey.toString());
    try {
      const transaction = new Transaction({
        recentBlockhash: (await connection.getRecentBlockhash()).blockhash,
        feePayer: publicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: Keypair.generate().publicKey,
          lamports: new BigNumber(0.1).multipliedBy(1e9).toNumber(),
        }),
      );
      // const message = transaction.compileMessage();
      // console.log(message)
      const signTrans = await signTransaction(transaction);
      const rawTransaction = signTrans.serialize();
      signature = await connection.sendRawTransaction(rawTransaction);
      console.log('signature', signature);
      await connection.confirmTransaction(signature, 'processed');
    } catch (error: any) {
      console.error(error);
      return;
    }
  };

  const handleQueryInfo = () => {
    if (!publicKey) {
      alert('error: 未连接钱包');
      return;
    }

    console.log(connection);
    connection.getBlockTime(78420178).then(res => {
      console.log('getBlockTime', res);
    });
    connection.getBalance(publicKey, 'confirmed').then(res => {
      console.log('getBalance', res);
    });

    connection.getRecentBlockhash('confirmed').then(res => {
      console.log('getRecentBlockhash', res);
    });
    // https://solana-labs.github.io/solana-web3.js/classes/Connection.html#constructor
  };

  const handleGetToken = async () => {
    if (!publicKey) {
      alert('error: 未连接钱包');
      return;
    }

    const signature = await connection.requestAirdrop(
      publicKey,
      LAMPORTS_PER_SOL,
    );
    await connection
      .confirmTransaction(signature)
      .then(res => {
        console.log(res);
        alert('获取成功');
      })
      .catch(err => {
        console.error(err);
      });
  };

  const handleGetUserSign = async () => {
    if (!publicKey) {
      alert('error: 未连接钱包');
      return;
    }

    try {
      const message = new TextEncoder().encode('Hello, world!');

      const signature = await signMessage(message);
      alert(`Message signature: ${bs58.encode(signature)}`);
    } catch (error: any) {
      alert(`Signing failed! ${error?.message}`);
      return;
    }
  };

  return (
    <Dialog
      open={isOpen}
      maxWidth={'md'}
      className={classes.root}
      PaperProps={{
        elevation: 0,
      }}
    >
      <Typography variant="h2" className={classes.title}>
        {'Connect Wallet'}
      </Typography>

      <Box>
        <WalletItem
          name="切换为 Phantom 钱包"
          onConnect={() => {
            handelConnect(WalletName.Phantom);
          }}
        />
        <WalletItem
          name="切换为 Sollet 钱包"
          onConnect={() => {
            handelConnect(WalletName.Sollet);
          }}
        />
        <WalletItem name="-查询连接状态-" onConnect={handleQueryStatus} />
        <WalletItem
          name="-查询当前公钥-"
          onConnect={() => {
            adapter && alert(adapter.publicKey);
          }}
        />
        <WalletItem name="-链接当前选中的钱包-" onConnect={handleConnect} />
        <WalletItem name="-断开钱包链接-" onConnect={handleDisConnect} />
        <WalletItem name="查询链上信息" onConnect={handleQueryInfo} />
        <WalletItem
          name="发起 0.1 SOL 随机转账交易"
          onConnect={handleSendTransfer}
        />
        <WalletItem name="获取开发链 1 SOL 空投" onConnect={handleGetToken} />
        <WalletItem name="获取用户签名" onConnect={handleGetUserSign} />
      </Box>

      <IconButton onClick={onClose} className={classes.close}>
        <CloseIcon fontSize="large" />
      </IconButton>
    </Dialog>
  );
};
