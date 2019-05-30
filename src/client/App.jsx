import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Loading from './reader/Loading';
import EpubReader from './reader/EpubReader';

const App = () => (
  <div>
    <Header />
    <EpubReader />
    <Footer />
    <Loading />
  </div>
);

export default App;
