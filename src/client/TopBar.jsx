import React from 'react';
import { fetchBook, invalidate } from './content-loader';
import Events, { SET_CONTENT_METADATA } from './reader/Events';
import { renderContext } from './setting';

export default class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.onFileChanged = this.onFileChanged.bind(this);
    this.onScrollModeSettingChange = this.onScrollModeSettingChange.bind(this);
    this.onFileOpen = this.onFileOpen.bind(this);
  }

  onFileChanged() {
    const file = document.getElementById('import').files[0];
    fetchBook(file).then(metadata => Events.emit(SET_CONTENT_METADATA, metadata));
  }

  onScrollModeSettingChange() {
    const old = renderContext.scrollMode;
    setTimeout(() => {
      renderContext.scrollMode = !old;
      invalidate();
    }, 100); // Checkbox 갱신을 기다림
  }

  onFileOpen() {
    document.getElementById('open_file').blur();
    document.getElementById('import').click();
  }

  render() {
    return (
      <div id="title_bar" className="navbar">
        <span id="title" className="navbar_title" aria-label="Title">Pilot Project</span>
        <div className="title_bar_right_container">
          <input id="scroll_mode_setting" type="checkbox" onChange={this.onScrollModeSettingChange} />
          <span className="scroll_mode_setting_label">Scroll Mode</span>
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
