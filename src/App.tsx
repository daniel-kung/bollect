import { NoSsr } from '@material-ui/core';
import { ScrollToTop } from 'modules/common/components/ScrollToTop';
import { FANGIBLE_STORE } from 'modules/common/conts';
import { Update } from 'modules/layout/components/Update/update';
import { StoreProvider } from 'npms/oystoer';
import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from 'store';
import { QueryLoadingAbsolute } from './modules/common/components/QueryLoading/QueryLoading';
import { AppBase } from './modules/layout/components/AppBase/AppBase';
import { Notifications } from './modules/notification/components/Notifications';
import { Routes } from './Routes';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<QueryLoadingAbsolute />} persistor={persistor}>
        <StoreProvider storeAddress={FANGIBLE_STORE}>
          <AppBase>
            <Update>
              <ScrollToTop />
              <Routes />
              <NoSsr>
                <Notifications />
              </NoSsr>
            </Update>
          </AppBase>
        </StoreProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
