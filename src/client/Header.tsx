import React, {RefObject} from 'react';
import {invalidate, load} from './content-loader';
import {ViewType} from './setting';
import ViewTypeButton from "./ViewTypeButton";

interface HeaderState {
  viewType: ViewType,
}

export default class Header extends React.Component {
  fileInputRef: RefObject<HTMLInputElement> = React.createRef();
  fileOpenButtonRef: RefObject<HTMLButtonElement> = React.createRef();

  state: HeaderState = {
    viewType: ViewType.PAGE1,
  };

  constructor(props: any) {
    super(props);
    this.onFileChanged = this.onFileChanged.bind(this);
    this.onSettingChanged = this.onSettingChanged.bind(this);
    this.onFileOpen = this.onFileOpen.bind(this);
  }

  onFileChanged() {
    const { current: fileInput } = this.fileInputRef;
    if (fileInput && fileInput.files) {
      load(fileInput.files[0]);
    }
  }

  onSettingChanged(viewType: ViewType) {
    if (viewType === this.state.viewType) return;
    this.setState({ viewType });
    invalidate();
  }

  onFileOpen() {
    const { current: fileInput } = this.fileInputRef;
    const { current: fileOpenButton } = this.fileOpenButtonRef;
    if (fileOpenButton) fileOpenButton.blur();
    if (fileInput) fileInput.click();
  }

  render() {
    const { viewType } = this.state;
    return (
      <div id="title_bar" className="navbar">
        <span id="title" className="navbar_title" aria-label="Title">Pilot Project</span>
        <div className="title_bar_right_container">
          <ViewTypeButton viewType={ViewType.SCROLL} onSelect={this.onSettingChanged} className={viewType === ViewType.SCROLL ? 'active' : ''} />
          <ViewTypeButton viewType={ViewType.PAGE1} onSelect={this.onSettingChanged} className={viewType === ViewType.PAGE1 ? 'active' : ''} />
          <ViewTypeButton viewType={ViewType.PAGE12} onSelect={this.onSettingChanged} className={viewType === ViewType.PAGE12 ? 'active' : ''} />
          <button
            ref={this.fileOpenButtonRef}
            type="button"
            className="button title_bar_button"
            aria-label="Select File"
            onClick={this.onFileOpen}
          >
            Select file...
          </button>
          <input ref={this.fileInputRef} type="file" accept=".epub" onChange={this.onFileChanged} />
        </div>
      </div>
    );
  }
}
