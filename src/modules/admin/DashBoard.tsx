import { Container } from '@material-ui/core';
import { Button } from 'modules/uiKit/Button';
import { DashTable } from './components/DashTable';
import { IDashBoardItemRow } from './components/TableItemRow';
import { useDashBoardStyles } from './useDashBoardStyles';

const mockData: IDashBoardItemRow[] = [
  {
    name: 'Homie_Store',
    address: '8ChvDwTCPsEvFbduVmTw19qQjfhZtyR968MBknzTm3vB',
    isActivited: true,
  },
  {
    name: 'Homie_Store',
    address: '8ChvDwTCPsEvFbduVmTw19qQjfhZtyR968MBknzTm3vB',
    isActivited: true,
  },
];

export const DashBoard = () => {
  const classes = useDashBoardStyles();

  return (
    <Container className={classes.root} maxWidth="xl">
      <DashTable tableDatas={mockData} />

      <div className={classes.submitBtnWrapper}>
        <Button>Submit</Button>
      </div>
    </Container>
  );
};
