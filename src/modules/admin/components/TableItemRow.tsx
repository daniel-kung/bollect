import { TableCell, TableRow } from '@material-ui/core';

export interface IDashBoardItemRow {
  name: string;
  address: string;
  isActivited: boolean;
}

export const TableItemRow = ({
  name,
  address,
  isActivited,
}: IDashBoardItemRow) => {
  return (
    <TableRow>
      <TableCell>{name}</TableCell>
      <TableCell>{address}</TableCell>
      <TableCell>{String(isActivited)}</TableCell>
    </TableRow>
  );
};
