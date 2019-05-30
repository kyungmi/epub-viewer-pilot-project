import React from 'react';
import EpubReader from './reader/EpubReader';
import Header from './Header';
import Footer from './Footer';
import Loading from './reader/Loading';

const App = () => (
  <div>
    <Header />
    <EpubReader />
    <Footer />
    <Loading />
  </div>
);

export default App;
