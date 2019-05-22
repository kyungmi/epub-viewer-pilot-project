import React from 'react';
import { fetchBook } from './content-loader';
import EpubReader from './reader/EpubReader';
import Events, { SET_CONTENT_METADATA } from './reader/Events';

export default class App extends React.Component {

  constructor(props) {
    super(props);

    this.onFileChanged = this.onFileChanged.bind(this);
  }

  componentDidMount() {
    document.getElementById('import').addEventListener('change', this.onFileChanged);
  }

  componentWillUnmount() {
    document.getElementById('import').removeEventListener('change', this.onFileChanged);
  }

  onFileChanged() {
    const file = document.getElementById('import').files[0];
    fetchBook(file).then(metadata => Events.emit(SET_CONTENT_METADATA, metadata));
  }

  render() {
    return (
      <div>
        <EpubReader />
      </div>
    );
  }
}
