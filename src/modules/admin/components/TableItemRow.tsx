import { TableCell, TableRow } from '@material-ui/core';

export interface IDashBoardItemRow {
  name: string;
  address: string;
  activated: boolean;
}

export const TableItemRow = ({
  name,
  address,
  activated,
}: IDashBoardItemRow) => {
  return (
    <TableRow>
      <TableCell>{name}</TableCell>
      <TableCell>{address}</TableCell>
      <TableCell>{String(activated)}</TableCell>
    </TableRow>
  );
};
