import axios from 'axios';
import {getClientHeight, getClientWidth, getScrollHeight, getScrollWidth, measure} from './util';
import { paging, epubSetting, status, uiRefs } from './setting';
import ReaderJsHelper from './reader/ReaderJsHelper';
import Events, { SET_CONTENT, SET_READY_TO_READ, UPDATE_PAGE } from './reader/Events';

//
function setStartToRead(startToRead: boolean) {
  return new Promise((resolve) => {
    setTimeout(() => {
      status.startToRead = startToRead;
      Events.emit(SET_READY_TO_READ, startToRead);
      console.log(`startToRead => ${startToRead}`);
      resolve();
    }, 0);
  });
}

async function inLoadingState(run: () => any) {
  await setStartToRead(false);
  const result = await run();
  await setStartToRead(true);
  return result;
}

// 페이징
function startPaging() {
  return measure(() => {
    paging.totalPage = 0;
    if (epubSetting.isScroll) {
      paging.pageUnit = getClientHeight();
      paging.fullHeight = getScrollHeight();
      // 어차피 스크롤보기에서 마지막 페이지에 도달하는 것은 불가능하므로, Math.floor로 계산
      paging.totalPage = Math.floor(paging.fullHeight / paging.pageUnit);
    } else {
      paging.pageUnit = getClientWidth() + epubSetting.columnGap;
      paging.fullWidth = getScrollWidth();
      paging.totalPage = Math.ceil(paging.fullWidth / paging.pageUnit);
    }
    Events.emit(UPDATE_PAGE, paging);
    console.log('paging =>', paging);
  }, 'Paging done');
}


function appendStyles(data: any) {
  return measure(() => {
    const element = document.createElement('style');
    element.innerText = data.styles.join(' ');
    document.head.appendChild(element);
    return data;
  }, 'Added Styles');
}


interface FontData {
  href: string,
}

interface BookParsedData {
  fonts?: Array<FontData>,
  unzipPath: string,
}

function prepareFonts(data: BookParsedData): Promise<BookParsedData> {
  if (!data.fonts) return Promise.resolve(data);
  const fontFaces = data.fonts.map(font => font.href).map((href) => {
    const name = href.split('/').slice(-1)[0].replace(/\./g, '_');
    return new FontFace(name, `url(${data.unzipPath}/${href})`);
  });

  return measure(() => Promise.all(fontFaces.map(fontFace => fontFace.load())).then(() => {
    fontFaces.forEach(f => (document as any).fonts.add(f));
    return data;
  }), `${data.fonts.length} fonts loaded`);
}

function waitImagesLoaded() {
  const imageCount = document.images.length;
  return measure(() => new Promise((onImagesLoaded) => {
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

function parseBook(file: File) {
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
  return new Promise((resolve) => {
    const navigationBarHeight = document.getElementsByClassName('navbar')[0].clientHeight;
    const canvasWidth = document.documentElement.clientWidth;
    const canvasHeight = document.documentElement.clientHeight - navigationBarHeight;
    const { contentRoot } = uiRefs;
    if (epubSetting.isScroll) {
      if (contentRoot) contentRoot.removeAttribute('style');
    } else {
      const { columnGap, columnsInPage } = epubSetting;
      if (contentRoot) contentRoot.setAttribute('style', `
        -webkit-column-width: ${(canvasWidth - (columnGap * (columnsInPage - 1))) / columnsInPage}px;
        -webkit-column-gap: ${columnGap}px;
        height: ${canvasHeight}px;
      `);
    }
    setTimeout(resolve, 0); // 스타일 갱신 완료를 기다림
  });
}
function restoreCurrent() {
  const { currentPage } = paging;
  return measure(() => goToPage(currentPage), `Restore current page => ${currentPage}`);
}

export function invalidate() {
  return inLoadingState(() => updateContentStyle()
    .then(waitImagesLoaded)
    .then(() => ReaderJsHelper.reviseImages())
    .then(startPaging)
    .then(restoreCurrent))
    .catch((e: any) => console.error(e));
}

export function load(file: File) {
  return parseBook(file).then((metadata) => {
    // style 붙이기 -> 폰트 preload -> spine 붙이기 -> 이미지 로드 대기 -> 페이지 계산
    return appendStyles(metadata)
      .then(() => prepareFonts(metadata))
      .then(() => Events.emit(SET_CONTENT, metadata.spines))
      .then(() => invalidate())
      .catch((e: any) => console.error(e));
  });
}

export function goToPage(page: number) {
  return inLoadingState(() => measure(() => {
    const { pageUnit } = paging;
    if (epubSetting.isScroll) {
      document.documentElement.scrollLeft = 0;
      document.documentElement.scrollTop = (page - 1) * pageUnit;
    } else {
      document.documentElement.scrollTop = 0;
      document.documentElement.scrollLeft = (page - 1) * pageUnit;
    }
    paging.currentPage = page;
    Events.emit(UPDATE_PAGE, paging);
  }, `Go to page => ${page} (${(page - 1) * paging.pageUnit})`));
}

export function updateCurrent() {
  if (!status.startToRead) return null;
  return measure(() => {
    const { pageUnit } = paging;
    if (epubSetting.isScroll) {
      const { scrollTop } = document.documentElement;
      paging.currentPage = Math.floor(scrollTop / pageUnit) + 1;
    } else {
      const { scrollLeft } = document.documentElement;
      paging.currentPage = Math.floor(scrollLeft / pageUnit) + 1;
    }
    Events.emit(UPDATE_PAGE, paging);
  }, 'update current page');
}
