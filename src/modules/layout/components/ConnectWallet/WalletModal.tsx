import { Box, Dialog, IconButton, Typography } from '@material-ui/core';
import { CloseIcon } from 'modules/common/components/Icons/CloseIcon';
import { useWalletModalStyles } from './useWalletModalStyles';
import WalletItem from './WalletItem';
import { WalletName } from '@solana/wallet-adapter-wallets';
import bs58 from 'bs58';
import { useReactWeb3 } from 'modules/common/hooks/useReactWeb3';
import { mobileWallets, wallets } from './wallets';
import { setJWTToken } from 'modules/common/utils/localStorage';
import { useIsXLUp } from 'modules/themes/useTheme';

export interface IBurnFormValues {
  royaltyRate: string;
}

interface IBurnTokenDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal = ({ isOpen, onClose }: IBurnTokenDialogProps) => {
  const classes = useWalletModalStyles();
  const { connect } = useReactWeb3();
  const isXLUp = useIsXLUp();

  const handelConnect = (walletName: WalletName) => {
    connect(walletName)?.then(async () => {
      const message = `Bollect`;
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await (window as any)?.solana?.signMessage(
        encodedMessage,
        'utf8',
      );
      const signature = bs58.encode(signedMessage.signature);
      setJWTToken(signature);
      onClose();
    });
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
        {(isXLUp ? wallets : mobileWallets).map(wallet => (
          <WalletItem
            key={wallet.walletLabel}
            name={wallet.walletLabel}
            onClick={() => handelConnect(wallet.walletLabel)}
            startIcon={wallet.startIcon}
          />
        ))}
      </Box>

      <IconButton onClick={onClose} className={classes.close}>
        <CloseIcon fontSize="large" />
      </IconButton>
    </Dialog>
  );
};
