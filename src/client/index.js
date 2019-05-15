import axios from 'axios';

const touchTime = time => new Date().getTime() - time;

function measureSync(run, message, ...optionalParams) {
  const startTime = new Date().getTime();
  run();
  console.log(`${message}`, ...optionalParams, `(${touchTime(startTime)}ms)`);
}

async function measure(promise, message, ...optionalParams) {
  const startTime = new Date().getTime();
  await promise;
  console.log(`${message}`, ...optionalParams, `(${touchTime(startTime)}ms)`);
}

function getRootElement() {
  return document.getElementById('content');
}

function appendSpines(spines) {
  measureSync(() => {
    const fragment = document.createDocumentFragment();
    const element = document.createElement('div');
    element.innerHTML = spines.join(''); // 이렇게 할거면 DocumentFragment는 필요 없는데...?
    fragment.appendChild(element);
    getRootElement().appendChild(fragment);
  }, 'Did finish append spines:');
}

function appendStyles(styles) {
  measureSync(() => {
    const element = document.createElement('style');
    element.innerText = styles.join(' ');
    document.head.append(element);
  }, 'Did finish append styles:');
}

function startPaging() {
  const canvasHeight = document.documentElement.clientHeight;
  let pageCount = 0;
  measure(new Promise((resolve) => {
    pageCount = Math.ceil(getRootElement().scrollHeight / canvasHeight);
    resolve();
  }), `Did finish paging(${pageCount}):`);
}

function loadBook(result) {
  console.log(result.book);

  appendStyles(result.styles);
  appendSpines(result.spines);
  measure(new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 0);
  }), 'Did finish load content:');

  let step = 0;
  new Promise((shouldPaging) => {
    const next = () => {
      step += 1;
      if (step === 2) {
        shouldPaging();
      }
    };

    const totalImageCount = document.images.length;
    measure(new Promise((resolve) => {
      let count = 0;
      const tap = () => {
        count += 1;
        if (count >= totalImageCount) {
          resolve();
          next();
        }
      };
      Array.from(document.images).forEach((image) => {
        if (image.complete) {
          tap();
        } else {
          image.addEventListener('load', () => {
            tap();
          });
          image.addEventListener('error', () => {
            tap();
          });
        }
      });
    }), `Did finish load images(${totalImageCount}):`);

    setTimeout(() => {
      const totalFontCount = document.fonts.size;
      measure(new Promise((resolve) => {
        const poll = () => {
          let count = 0;
          document.fonts.forEach((font) => {
            count += (font.status.indexOf('loading') === -1) ? 1 : 0;
          });
          if (totalFontCount === count) {
            resolve();
            next();
          } else {
            setTimeout(poll, 5);
          }
        };
        poll();
      }), `Did finish load fonts(${totalFontCount}):`);
    }, 0);
  }).then(startPaging);
}

function fetchBook(file) {
  axios.get(`/api/book?filename=${encodeURI(file.name)}`).then((response) => {
    loadBook(response.data);
  }).catch((error) => {
    if (error.response.status === 404) {
      const formData = new FormData();
      formData.append('file', file);
      axios.post('api/book/upload', formData).then((response) => {
        loadBook(response.data);
      });
    } else {
      console.log(error);
    }
  });
}

function selectedFile() {
  getRootElement().innerHTML = '';
  const file = document.getElementById('import').files[0];
  fetchBook(file);
}

function selectFile() {
  document.getElementById('open_file').blur();
  document.getElementById('import').click();
}

window.selectedFile = selectedFile;
window.selectFile = selectFile;

window.addEventListener('resize', () => {
  startPaging();
});
