import { useConnection } from '@oyster/common';
import { loadAccounts } from 'contexts/meta/loadAccounts';
import { useReactWeb3 } from 'modules/common/hooks/useReactWeb3';
import { useEffect } from 'react';
import { useState } from 'react';

export const TabOwned: React.FC<{
  isOther?: boolean;
  address?: string;
  reload?: () => void;
}> = function ({ isOther = false, address: artAddress, reload }) {
  const { address } = useReactWeb3();
  const connection = useConnection();
  console.log('---address---', address);
  interface item {
    img: string;
  }
  const all = true;
  const [list, setList] = useState<item[]>([]);
  useEffect(() => {
    const init = async () => {
      console.log('-----> Query started');

      const nextState = await loadAccounts(connection, all);

      console.log(nextState);
      console.log('------->Query finished');
    };
    if (address) {
      init();
      // getProgramAccounts(connection, METADATA_PROGRAM_ID).then(
      //   forEach(processMetaData),
      // );

      // getProgramAccounts({ userAddress: address }).then(data => {
      //   console.log('---data---');
      //   console.log(data);
      // });
    }
  }, [connection, address]);

  return (
    <>
      {list.map(e => {
        return <div>..</div>;
      })}
    </>
  );
};
