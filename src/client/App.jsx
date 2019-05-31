import React from 'react';
import Footer from './Footer';
import Loading from './reader/Loading';
import Header from './Header';
import EpubReader from './reader/EpubReader';

const App = () => (
  <>
    <Header />
    <EpubReader />
    <Footer />
    <Loading />
  </>
);

export default App;
