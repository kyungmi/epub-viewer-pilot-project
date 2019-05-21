import React from 'react';
import { appendStyles, fetchBook, prepareFonts, startPaging, waitImagesLoaded } from './content-loader';

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
    // style 붙이기 -> 폰트 preload -> spine 붙이기 -> 이미지 로드 대기 -> 페이지 계산
    fetchBook(file, this.contentRef.current)
      .then(appendStyles)
      .then(prepareFonts)
      .then(this.onSpineLoaded)
      .then(waitImagesLoaded)
      .then(startPaging)
      .catch(e => console.error(e));
  }

  onSpineLoaded(data) {
    this.setState({ content: data.spines.join('') });
    return data;
  }

  render() {
    return (
      <div
        ref={this.contentRef}
        dangerouslySetInnerHTML={{ __html: this.state.content }}
      />
    );
  }
}
