import React from 'react';
import { invalidate, updateCurrent } from '../content-loader';
import { uiRefs } from '../setting';
import Events, { SET_CONTENT } from './Events';
import ReaderJsHelper from './ReaderJsHelper';

export default class EpubReader extends React.Component {
  contentRef = React.createRef();

  constructor(props) {
    super(props);

    this.state = {
      content: null,
    };

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

  onContentSet(spines) {
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
