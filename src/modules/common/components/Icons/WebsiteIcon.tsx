import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  root: {
    width: 30,
    height: 30,
  },
});

export const WebsiteIcon = (props: SvgIconProps) => {
  const styles = useStyles();

  return (
    <SvgIcon className={styles.root} {...props} viewBox="6.5 6.5 30.5 30.5">
      <defs>
        <style type="text/css"></style>
      </defs>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22 33.1429C22.1412 33.1429 22.4311 33.084 22.8641 32.6567C23.3051 32.2213 23.7875 31.4995 24.2326 30.4608C24.6852 29.4048 25.0615 28.1096 25.3217 26.6429H18.6783C18.9385 28.1096 19.3148 29.4048 19.7674 30.4608C20.2125 31.4995 20.6949 32.2213 21.1359 32.6567C21.5689 33.084 21.8588 33.1429 22 33.1429ZM18.4226 24.7857C18.3336 23.898 18.2857 22.9655 18.2857 22C18.2857 21.0345 18.3336 20.102 18.4226 19.2143H25.5774C25.6664 20.102 25.7143 21.0345 25.7143 22C25.7143 22.9655 25.6664 23.898 25.5774 24.7857H18.4226ZM27.2056 26.6429C26.8024 29.1028 26.0881 31.2038 25.175 32.684C28.2708 31.7654 30.8038 29.538 32.1326 26.6429H27.2056ZM32.7919 24.7857H27.4433C27.5272 23.8883 27.5714 22.9562 27.5714 22C27.5714 21.0438 27.5272 20.1117 27.4433 19.2143H32.7919C33.021 20.1047 33.1429 21.0381 33.1429 22C33.1429 22.9619 33.021 23.8953 32.7919 24.7857ZM16.5568 24.7857H11.2082C10.979 23.8953 10.8571 22.9619 10.8571 22C10.8571 21.0381 10.979 20.1047 11.2082 19.2143H16.5568C16.4728 20.1117 16.4286 21.0438 16.4286 22C16.4286 22.9562 16.4728 23.8883 16.5568 24.7857ZM11.8675 26.6429H16.7944C17.1976 29.1028 17.9119 31.2038 18.825 32.684C15.7292 31.7654 13.1962 29.538 11.8675 26.6429ZM18.6783 17.3571H25.3217C25.0615 15.8904 24.6852 14.5952 24.2326 13.5392C23.7875 12.5005 23.3051 11.7787 22.8641 11.3434C22.4311 10.9161 22.1412 10.8571 22 10.8571C21.8588 10.8571 21.5689 10.9161 21.1359 11.3434C20.6949 11.7787 20.2125 12.5005 19.7674 13.5392C19.3148 14.5952 18.9385 15.8904 18.6783 17.3571ZM27.2056 17.3571H32.1326C30.8038 14.4621 28.2708 12.2346 25.175 11.316C26.0881 12.7961 26.8024 14.8972 27.2056 17.3571ZM18.825 11.316C17.9119 12.7961 17.1976 14.8972 16.7944 17.3571H11.8675C13.1962 14.4621 15.7292 12.2346 18.825 11.316ZM22 9C29.1797 9 35 14.8203 35 22C35 29.1797 29.1797 35 22 35C14.8203 35 9 29.1797 9 22C9 14.8203 14.8203 9 22 9Z"
        fill="currentColor"
      />
    </SvgIcon>
  );
};
