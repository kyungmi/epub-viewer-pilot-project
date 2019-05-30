/** @jsx jsx */
import { jsx } from '@emotion/core';
import * as React from 'react';
import { invalidate, updateCurrent } from '../../content-loader';
import { uiRefs } from '../../setting';
import Events, { SET_CONTENT } from '../Events';
import ReaderJsHelper from '../ReaderJsHelper';
import * as styles from './styles';

export interface EpubReaderState {
  content: string,
}

export default class EpubReader extends React.Component {
  contentRef: React.RefObject<HTMLDivElement> = React.createRef();
  state: Readonly<EpubReaderState> = {
    content: '',
  };

  constructor(props: any) {
    super(props);

    this.onContentSet = this.onContentSet.bind(this);
  }

  componentDidMount() {
    uiRefs.contentRoot = this.contentRef.current;
    ReaderJsHelper.mount();

    invalidate();

    window.addEventListener('resize', invalidate);
    window.addEventListener('scroll', updateCurrent);
    Events.on(SET_CONTENT, this.onContentSet);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', invalidate);
  }

  onContentSet(spines: Array<string>) {
    this.setState({ content: spines.join('') });
  }

  render() {
    return (
      <div
        css={styles.wrapper}
        ref={this.contentRef}
        dangerouslySetInnerHTML={{ __html: this.state.content }}
      />
    );
  }
}
