import {
  ParsedAccount,
  SafetyDepositBox,
  VaultKey,
  decodeSafetyDeposit,
  decodeVault,
  Vault,
  VAULT_ID,
} from 'npms/oystoer';
import { AccountInfo } from '@solana/web3.js';
import { ProcessAccountsFunc } from './types';

export const processVaultData: ProcessAccountsFunc = (
  { account, pubkey },
  setter,
) => {
  if (!isVaultAccount(account)) return;

  try {
    if (isSafetyDepositBoxV1Account(account)) {
      const safetyDeposit = decodeSafetyDeposit(account.data);
      const parsedAccount: ParsedAccount<SafetyDepositBox> = {
        pubkey,
        account: account,
        info: safetyDeposit,
      };
      setter(
        'safetyDepositBoxesByVaultAndIndex',
        safetyDeposit.vault + '-' + safetyDeposit.order,
        parsedAccount,
      );
    }
    if (isVaultV1Account(account)) {
      const vault = decodeVault(account.data);
      const parsedAccount: ParsedAccount<Vault> = {
        pubkey,
        account: account,
        info: vault,
      };

      setter('vaults', pubkey, parsedAccount);
    }
  } catch {
    // ignore errors
    // add type as first byte for easier deserialization
  }
};

const isVaultAccount = (account: AccountInfo<Buffer>) =>
  (account.owner as unknown as any) === VAULT_ID;

const isSafetyDepositBoxV1Account = (account: AccountInfo<Buffer>) =>
  account.data[0] === VaultKey.SafetyDepositBoxV1;

const isVaultV1Account = (account: AccountInfo<Buffer>) =>
  account.data[0] === VaultKey.VaultV1;
