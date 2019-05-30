import React from 'react';
import { invalidate, load } from './content-loader';
import { renderContext } from './setting';

export default class Header extends React.Component {
  constructor(props) {
    super(props);
    this.onFileChanged = this.onFileChanged.bind(this);
    this.onSettingChanged = this.onSettingChanged.bind(this);
    this.onFileOpen = this.onFileOpen.bind(this);

    this.state = {
      viewType: '1page',
    };
  }

  onFileChanged() {
    load(document.getElementById('import').files[0]);
  }

  onSettingChanged(viewType) {
    if (viewType === this.state.viewType) return;

    if (viewType === 'scroll') {
      renderContext.scrollMode = true;
      renderContext.columnsInPage = 1;
    } else if (viewType === '1page') {
      renderContext.scrollMode = false;
      renderContext.columnsInPage = 1;
    } else if (viewType === '2page') {
      renderContext.scrollMode = false;
      renderContext.columnsInPage = 2;
    }

    invalidate();
    this.setState({ viewType });
  }

  onFileOpen() {
    document.getElementById('open_file').blur();
    document.getElementById('import').click();
  }

  render() {
    const { viewType } = this.state;
    return (
      <div id="title_bar" className="navbar">
        <span id="title" className="navbar_title" aria-label="Title">Pilot Project</span>
        <div className="title_bar_right_container">
          <button type="button" onClick={() => this.onSettingChanged('scroll')} className={viewType === 'scroll' ? 'active' : ''}>스크롤 보기</button>
          <button type="button" onClick={() => this.onSettingChanged('1page')} className={viewType === '1page' ? 'active' : ''}>1페이지 보기</button>
          <button type="button" onClick={() => this.onSettingChanged('2page')} className={viewType === '2page' ? 'active' : ''}>2페이지 보기</button>
          <button
            id="open_file"
            type="button"
            className="button title_bar_button"
            aria-label="Select File"
            onClick={this.onFileOpen}
          >
            Select file...
          </button>
          <input id="import" type="file" accept=".epub" onChange={this.onFileChanged} />
        </div>
      </div>
    );
  }
}
