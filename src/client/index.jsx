import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { getRootElement } from './util';
import { renderContext } from './setting';
import { invalidate } from './content-loader';

//
// 스크롤 보기 설정

function onScrollModeSettingChange() {
  const old = renderContext.scrollMode;
  setTimeout(() => {
    renderContext.scrollMode = !old;
    invalidate();
  }, 100); // Checkbox 갱신을 기다림
}

function selectFile() {
  document.getElementById('open_file').blur();
  document.getElementById('import').click();
}

//
// HTML에서 바로 접근할 수 있도록

window.onScrollModeSettingChange = onScrollModeSettingChange;
window.selectFile = selectFile;

//
// 리사이즈 이벤트 처리

window.addEventListener('resize', invalidate);

ReactDOM.render(<App />, getRootElement());
