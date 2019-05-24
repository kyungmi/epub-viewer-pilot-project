import axios from 'axios';
import { getRootElement, measure } from './util';
import { paging, renderContext, status, uiRefs } from './setting';
import ReaderJsHelper from './reader/ReaderJsHelper';
import Events, { SET_CONTENT, UPDATE_PAGE } from './reader/Events';

//
// 페이징
function startPaging() {
  return measure(() => {
    paging.totalPage = 0;
    if (renderContext.scrollMode) {
      paging.pageUnit = document.documentElement.clientHeight;
      paging.fullHeight = getRootElement().scrollHeight;
      // 어차피 스크롤보기에서 마지막 페이지에 도달하는 것은 불가능하므로, Math.floor로 계산
      paging.totalPage = Math.floor(paging.fullHeight / paging.pageUnit);
    } else {
      paging.pageUnit = document.documentElement.clientWidth + renderContext.columnGap;
      paging.fullWidth = getRootElement().scrollWidth;
      paging.totalPage = Math.ceil(getRootElement().scrollWidth / paging.pageUnit);
    }
    Events.emit(UPDATE_PAGE, paging);
    console.log('paging =>', paging);
  }, 'Paging done');
}

function appendStyles(data) {
  return measure(() => {
    const element = document.createElement('style');
    element.innerText = data.styles.join(' ');
    document.head.appendChild(element);
    return data;
  }, 'Added Styles');
}


function prepareFonts(data) {
  const fontSet = data.fonts.map(font => font.href).map((href) => {
    const name = href.split('/').slice(-1)[0].replace(/\./g, '_');
    return {
      name,
      url: `${data.unzipPath}/${href}`,
    };
  });

  const fontFaces = fontSet.map(({ name, url }) => new FontFace(name, `url(${url})`));

  return measure(Promise.all(fontFaces.map(fontFace => fontFace.load())).then(() => {
    fontFaces.forEach(f => document.fonts.add(f));
    return data;
  }), `${data.fonts.length} fonts loaded`);
}

function waitImagesLoaded() {
  const imageCount = document.images.length;
  return measure(new Promise((onImagesLoaded) => {
    let count = 0;
    const tap = () => {
      count += 1;
      if (count === imageCount) {
        onImagesLoaded();
      }
    };
    Array.from(document.images).forEach((image) => {
      if (image.complete) {
        tap();
      } else {
        image.addEventListener('load', tap);
        image.addEventListener('error', tap);
      }
    });
  }), `${imageCount} images loaded`);
}

function parseBook(file) {
  return axios.get(`/api/book?filename=${encodeURI(file.name)}`).then((response) => {
    return response.data;
  }).catch((error) => {
    if (error.response.status === 404) {
      const formData = new FormData();
      formData.append('file', file);
      axios.post('api/book/upload', formData).then(response => response.data);
    } else {
      console.error(error);
    }
  });
}

function updateContentStyle() {
  const navigationBarHeight = document.getElementsByClassName('navbar')[0].clientHeight;
  const canvasWidth = document.documentElement.clientWidth;
  const canvasHeight = document.documentElement.clientHeight - navigationBarHeight;
  const { contentRoot } = uiRefs;
  if (renderContext.scrollMode) {
    contentRoot.style = '';
  } else {
    const { columnGap, columnsInPage } = renderContext;
    contentRoot.style = `
      -webkit-column-width: ${(canvasWidth - (columnGap * (columnsInPage - 1))) / columnsInPage}px;
      -webkit-column-gap: ${columnGap}px;
      height: ${canvasHeight}px;
    `;
  }
}

export function goToPage(page) {
  const { pageUnit } = paging;
  return measure(() => {
    if (renderContext.scrollMode) {
      document.documentElement.scrollTop = (page - 1) * pageUnit;
    } else {
      document.documentElement.scrollLeft = (page - 1) * pageUnit;
    }
    paging.currentPage = page;
  }, `Go to page => ${page}`);
}

function restoreCurrent() {
  const { currentPage } = paging;
  return measure(() => goToPage(currentPage), `Restore current page => ${currentPage}`);
}

function setRestoring(restoring) {
  status.restoring = restoring;
  console.log(`restoring => ${restoring}`);
}

export function invalidate() {
  setRestoring(true);
  updateContentStyle();
  setTimeout(() => {
    startPaging()
      .then(restoreCurrent)
      .then(() => setRestoring(false));
  }, 0); // 스타일 갱신 완료를 기다림
}

export function load(file) {
  return parseBook(file).then((metadata) => {
    // style 붙이기 -> 폰트 preload -> spine 붙이기 -> 이미지 로드 대기 -> 페이지 계산
    return appendStyles(metadata)
      .then(() => prepareFonts(metadata))
      .then(() => Events.emit(SET_CONTENT, metadata.spines))
      .then(waitImagesLoaded)
      .then(() => ReaderJsHelper.reviseImages())
      .then(() => setRestoring(true))
      .then(startPaging)
      .then(restoreCurrent)
      .then(() => setRestoring(false))
      .catch(e => console.error(e));
  });
}

export function updateCurrent() {
  if (status.restoring) return null;
  return measure(() => {
    if (renderContext.scrollMode) {
      const { scrollTop } = document.documentElement;
      paging.currentPage = Math.floor((scrollTop / paging.fullHeight) * paging.totalPage) + 1;
    } else {
      const { scrollLeft } = document.documentElement;
      paging.currentPage = Math.floor((scrollLeft / paging.fullWidth) * paging.totalPage) + 1;
    }
    Events.emit(UPDATE_PAGE, paging);
  }, 'update current page');
}
