import * as React from 'react';
import Footer from './Footer';
import Loading from './reader/Loading';
import Header from './Header';
import EpubReader from './reader/EpubReader';
import { SettingContextProvider, PagingContextProvider } from './reader/Context';

const App: React.FunctionComponent = () => (
  <SettingContextProvider>
    <PagingContextProvider>
      <Header />
      <EpubReader />
      <Footer />
      <Loading />
    </PagingContextProvider>
  </SettingContextProvider>
);

export default App;
