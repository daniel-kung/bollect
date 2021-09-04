import { Button } from 'modules/uiKit/Button';
import React from 'react';

export default function WalletItem({
  name,
  onConnect,
}: {
  name: string;
  onConnect: () => void;
}) {
  return <Button onClick={onConnect}>{name}</Button>;
}
