import React from 'react';
import { fetchBook } from './content-loader';

export default class App extends React.Component {
  contentRef = React.createRef();

  constructor(props) {
    super(props);

    this.state = {
      content: null,
    };

    this.onFileChanged = this.onFileChanged.bind(this);
    this.onSpineLoaded = this.onSpineLoaded.bind(this);
  }

  componentDidMount() {
    document.getElementById('import').addEventListener('change', this.onFileChanged);
  }

  componentWillUnmount() {
    document.getElementById('import').removeEventListener('change', this.onFileChanged);
  }

  onFileChanged() {
    const file = document.getElementById('import').files[0];
    fetchBook(file, this.contentRef.current, this.onSpineLoaded);
  }

  onSpineLoaded(spines) {
    this.setState({ content: spines.join('') });
  }

  render() {
    return (<div ref={this.contentRef} dangerouslySetInnerHTML={{ __html: this.state.content }} />);
  }
}
