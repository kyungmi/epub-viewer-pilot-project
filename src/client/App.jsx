import React from 'react';
import EpubReader from './reader/EpubReader';
import Header from './Header';
import Footer from './Footer';

const App = () => (
  <div>
    <Header />
    <EpubReader />
    <Footer />
  </div>
);

export default App;
