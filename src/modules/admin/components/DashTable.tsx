import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
} from '@material-ui/core';
import { IDashBoardItemRow, TableItemRow } from './TableItemRow';
import { useDashTableStyles } from './useDashTableStyles';

export interface IDashTableProps {
  tableDatas: IDashBoardItemRow[];
}

export const DashTable = ({ tableDatas }: IDashTableProps) => {
  const classes = useDashTableStyles();

  return (
    <TableContainer className={classes.tableContainer}>
      <Table>
        <TableHead>
          <TableCell>{'Name'}</TableCell>
          <TableCell>{'Address'}</TableCell>
          <TableCell>{'Activated'}</TableCell>
        </TableHead>
        <TableBody>
          {tableDatas.map(tableData => {
            return <TableItemRow {...tableData} />;
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
