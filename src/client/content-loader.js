import axios from 'axios';
import { getRootElement, measure } from './util';
import { renderContext } from './setting';

function getContentRoot() {
  return renderContext.contentRoot;
}

//
// 페이징

export function startPaging() {
  return measure(() => {
    let pageCount = 0;
    if (renderContext.scrollMode) {
      const pageHeightUnit = document.documentElement.clientHeight;
      pageCount = Math.ceil(getContentRoot().scrollHeight / pageHeightUnit);
    } else {
      const pageWidthUnit = document.documentElement.clientWidth + renderContext.columnGap;
      const spines = Array.from(document.getElementsByTagName('article'));
      spines.forEach((spine) => {
        pageCount += Math.ceil(spine.scrollHeight / pageWidthUnit);
      });
    }
    console.log(`pageCount = ${pageCount}`);
  }, 'Paging done');
}

export function appendStyles(data) {
  return measure(() => {
    const element = document.createElement('style');
    element.innerText = data.styles.join(' ');
    document.head.appendChild(element);
    return data;
  }, 'Added Styles');
}


export function prepareFonts(data) {
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

export function waitImagesLoaded() {
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

export function fetchBook(file, contentRoot) {
  renderContext.contentRoot = contentRoot;
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
  const root = getRootElement();
  if (renderContext.scrollMode) {
    root.style = '';
  } else {
    root.style = `-webkit-column-width: ${canvasWidth}px; -webkit-column-gap: ${renderContext.columnGap}px; height: ${canvasHeight}px;`;
  }
}

export function invalidate() {
  updateContentStyle();
  setTimeout(startPaging, 0); // 스타일 갱신 완료를 기다림
}
// content 엘리먼트 스타일 초기화
updateContentStyle();
