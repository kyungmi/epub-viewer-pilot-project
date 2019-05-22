import React from 'react';
import { appendStyles, invalidate, prepareFonts, startPaging, waitImagesLoaded } from '../content-loader';
import { uiRefs } from '../setting';
import Events, { SET_CONTENT_METADATA } from './Events';

export default class EpubReader extends React.Component {
  contentRef = React.createRef();

  constructor(props) {
    super(props);

    this.state = {
      content: null,
    };

    this.onContentMetadataSet = this.onContentMetadataSet.bind(this);
  }

  componentDidMount() {
    uiRefs.contentRoot = this.contentRef.current;
    invalidate();
    window.addEventListener('resize', invalidate);
    // ReaderJsHelper.mount(this.contentRef.current, renderContext.scrollMode);

    Events.on(SET_CONTENT_METADATA, this.onContentMetadataSet);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', invalidate);
  }

  onContentMetadataSet(metadata) {
    // style 붙이기 -> 폰트 preload -> spine 붙이기 -> 이미지 로드 대기 -> 페이지 계산
    appendStyles(metadata)
      .then(() => prepareFonts(metadata))
      .then(() => this.setState({ content: metadata.spines.join('') }))
      .then(waitImagesLoaded)
      // .then(() => ReaderJsHelper.reviseImages())
      .then(startPaging)
      .catch(e => console.error(e));
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
