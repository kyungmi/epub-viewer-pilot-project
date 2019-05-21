import axios from 'axios';
import { getRootElement, measure, measureSync } from './util';
import { renderContext } from './setting';

function getContentRoot() {
  return renderContext.contentRoot;
}

//
// 페이징

function startPaging() {
  measureSync(() => {
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

function appendStyles(styles) {
  measureSync(() => {
    const element = document.createElement('style');
    element.innerText = styles.join(' ');
    document.head.appendChild(element);
  }, 'Added Styles');
}

//
// parser가 넘겨준 스파인과 스타일을 DOM에 추가

function appendSpines(spines) {
  measureSync(() => {
    const fragment = document.createDocumentFragment();
    const element = document.createElement('div');
    element.innerHTML = spines.join(''); // 이렇게 할거면 DocumentFragment는 필요 없는데...?
    fragment.appendChild(element);
    getContentRoot().appendChild(fragment);
  }, 'Added Spines');
}


function prepareFonts(fonts, unzipPath, completion) {
  const fontSet = fonts.map(font => font.href).map((href) => {
    const name = href.split('/').slice(-1)[0].replace(/\./g, '_');
    return {
      name,
      url: `${unzipPath}/${href}`,
    };
  });

  const fontFaces = fontSet.map(({ name, url }) => new FontFace(name, `url(${url})`));

  measure(Promise.all(fontFaces.map(fontFace => fontFace.load())).then(() => {
    fontFaces.forEach(f => document.fonts.add(f));
    setTimeout(completion, 0);
  }), `${fonts.length} fonts loaded`);
}

//
// 파싱 요청과 로드

function loadBook(result, fontPrepared) {
  console.log(result.book); // 파싱된 전체 메타데이터
  appendStyles(result.styles);
  prepareFonts(result.fonts, result.unzipPath, () => {
    fontPrepared(result.spines);
    measure(new Promise((onDomLoaded) => {
      setTimeout(() => {
        onDomLoaded();

        const imageCount = document.images.length;
        measure(new Promise((onImagesLoaded) => {
          let count = 0;
          const tap = () => {
            count += 1;
            if (count === imageCount) {
              onImagesLoaded();
              setTimeout(startPaging, 0); // 특별한 의미가 있는 timeout은 아니고, 로그 순서를 맞추기 위함
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
      }, 0); // DOM 갱신 완료를 기다림
    }), 'DOM loaded');
  });
}

export function fetchBook(file, contentRoot, fontPrepared) {
  renderContext.contentRoot = contentRoot;
  axios.get(`/api/book?filename=${encodeURI(file.name)}`).then((response) => {
    loadBook(response.data, fontPrepared);
  }).catch((error) => {
    if (error.response.status === 404) {
      const formData = new FormData();
      formData.append('file', file);
      axios.post('api/book/upload', formData)
        .then(response => loadBook(response.data));
    } else {
      console.log(error);
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
