import React, {RefObject} from 'react';
import { invalidate, updateCurrent } from '../content-loader';
import { uiRefs } from '../setting';
import Events, { SET_CONTENT } from './Events';
import ReaderJsHelper from './ReaderJsHelper';

export interface EpubReaderState {
  content: string,
}

export default class EpubReader extends React.Component {
  contentRef: RefObject<HTMLDivElement> = React.createRef();
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
        ref={this.contentRef}
        dangerouslySetInnerHTML={{ __html: this.state.content }}
      />
    );
  }
}
