import * as React from 'react';
import Footer from './Footer';
import Loading from './reader/Loading';
import Header from './Header';
import EpubReader from './reader/EpubReader';
import { EpubContextProvider } from './reader/Context';

const App: React.FunctionComponent = () => (
  <EpubContextProvider>
    <Header />
    <EpubReader />
    <Footer />
    <Loading />
  </EpubContextProvider>
);

export default App;
