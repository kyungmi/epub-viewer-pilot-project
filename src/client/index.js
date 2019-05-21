import axios from 'axios';

const renderContext = {
  columnGap: 10,
  scrollMode: false,
};

//
// 실행 시간 로깅용

function measureSync(run, message, ...optionalParams) {
  const startTime = new Date().getTime();
  run();
  console.log(`${message}`, ...optionalParams, `- (${(new Date().getTime() - startTime)}ms)`);
}

async function measure(promise, message, ...optionalParams) {
  const startTime = new Date().getTime();
  await promise;
  console.log(`${message}`, ...optionalParams, `- (${(new Date().getTime() - startTime)}ms)`);
}

//
// 모든 스파인을 가지고 있는 엘리먼트(id=content) 관련 함수

function getRootElement() {
  return document.getElementById('content');
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
// parser가 넘겨준 스파인과 스타일을 DOM에 추가

function appendSpines(spines) {
  measureSync(() => {
    const fragment = document.createDocumentFragment();
    const element = document.createElement('div');
    element.innerHTML = spines.join(''); // 이렇게 할거면 DocumentFragment는 필요 없는데...?
    fragment.appendChild(element);
    getRootElement().appendChild(fragment);
  }, 'Added Spines');
}

function appendStyles(styles) {
  measureSync(() => {
    const element = document.createElement('style');
    element.innerText = styles.join(' ');
    document.head.appendChild(element);
  }, 'Added Styles');
}

//
// 페이징

function startPaging() {
  measureSync(() => {
    let pageCount = 0;
    if (renderContext.scrollMode) {
      const pageHeightUnit = document.documentElement.clientHeight;
      pageCount = Math.ceil(getRootElement().scrollHeight / pageHeightUnit);
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

//
// 파싱 요청과 로드

function loadBook(result) {
  console.log(result.book); // 파싱된 전체 메타데이터
  appendStyles(result.styles);
  prepareFonts(result.fonts, result.unzipPath, () => {
    appendSpines(result.spines);
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

function fetchBook(file) {
  axios.get(`/api/book?filename=${encodeURI(file.name)}`).then((response) => {
    loadBook(response.data);
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

//
// 스크롤 보기 설정

function onScrollModeSettingChange() {
  const old = renderContext.scrollMode;
  setTimeout(() => {
    measure(new Promise((resolve) => {
      renderContext.scrollMode = !old;
      updateContentStyle();
      setTimeout(() => {
        resolve();
        setTimeout(startPaging, 0); // 특별한 의미가 있는 timeout은 아니고, 로그 순서를 맞추기 위함
      }, 0);
    }), `Mode Setting Changed (scrollMode: ${old} -> ${!old})`);
  }, 100); // Checkbox 갱신을 기다림
}

//
// 파인더에서 파일 선택하기

function selectedFile() {
  getRootElement().innerHTML = '';
  const file = document.getElementById('import').files[0];
  fetchBook(file);
}

function selectFile() {
  document.getElementById('open_file').blur();
  document.getElementById('import').click();
}

//
// HTML에서 바로 접근할 수 있도록

window.onScrollModeSettingChange = onScrollModeSettingChange;
window.selectedFile = selectedFile;
window.selectFile = selectFile;

//
// 리사이즈 이벤트 처리

window.addEventListener('resize', () => {
  updateContentStyle();
  setTimeout(startPaging, 0); // 스타일 갱신 완료를 기다림
});

updateContentStyle(); // content 엘리먼트 스타일 초기화
