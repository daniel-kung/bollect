import { createSlice, PayloadAction } from '@reduxjs/toolkit';
type colorValueType = number;
type userColorMapType = { [key in string]: number };

export interface IUserState {
  colors: userColorMapType;
  showWalletLogin: boolean;
  address: string;
}

const initialState: IUserState = {
  colors: {},
  showWalletLogin: false,
  address: '',
};

interface IColor {
  userName: string;
  randomColor: colorValueType;
}

export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    updateUserColorMap: (state, action: PayloadAction<IColor>) => {
      const colorInfo = action.payload;
      state.colors[colorInfo.userName] = colorInfo.randomColor;
      state.colors = {
        ...state.colors,
        [colorInfo.userName]: colorInfo.randomColor,
      };
    },
    updateShowWalletLogin: (state, action: PayloadAction<boolean>) => {
      state.showWalletLogin = action.payload;
    },
    updateAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
    },
  },
});

export const { updateUserColorMap, updateShowWalletLogin, updateAddress } =
  userSlice.actions;

export const addUserColorDataAsync =
  (color: IColor) => async (dispatch: any) => {
    dispatch(updateUserColorMap(color));
  };
