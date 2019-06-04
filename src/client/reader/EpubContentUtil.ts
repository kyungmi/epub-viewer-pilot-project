import axios from 'axios';
import {getClientHeight, getClientWidth, getScrollHeight, getScrollWidth, measure} from '../util';
import {status} from '../setting';
import Events, {SET_CONTENT, SET_READY_TO_READ, PAGING_UPDATED} from './Events';
import ReaderJsHelper from './ReaderJsHelper';
import {PagingState, SettingState} from "./Context";
import * as SettingUtil from './SettingUtil';

interface FontData {
  href: string,
}

interface EpubParsedData {
  fonts?: Array<FontData>,
  styles?: Array<String>,
  spines?: Array<String>,
  unzipPath: string,
}

// todo reducer
const setStartToRead = async (startToRead: boolean) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      status.startToRead = startToRead;
      Events.emit(SET_READY_TO_READ, startToRead);
      console.log(`startToRead => ${startToRead}`);
      resolve();
    }, 0);
  });
};

// todo reducer
const inLoadingState = async (run: () => any) => {
  await setStartToRead(false);
  const result = await run();
  await setStartToRead(true);
  return result;
};

export const parseBook = async (file: File): Promise<EpubParsedData> => {
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
};

export const appendStyles = async (metadata: EpubParsedData): Promise<void> => {
  return measure(() => {
    if (!metadata.styles) return;
    const element = document.createElement('style');
    element.innerText = metadata.styles.join(' ');
    document.head.appendChild(element);
  }, 'Added Styles');
};

export const waitImagesLoaded = async (): Promise<void> => {
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
};

export const startPaging = async (setting: SettingState): Promise<Partial<PagingState>> => {
  return measure(() => {
    const paging: Partial<PagingState> = { totalPage: 0 };
    if (SettingUtil.isScroll(setting)) {
      paging.pageUnit = getClientHeight();
      paging.fullHeight = getScrollHeight();
      // 어차피 스크롤보기에서 마지막 페이지에 도달하는 것은 불가능하므로, Math.floor로 계산
      paging.totalPage = Math.floor(paging.fullHeight / paging.pageUnit);
    } else {
      paging.pageUnit = getClientWidth() + SettingUtil.columnGap(setting);
      paging.fullWidth = getScrollWidth();
      paging.totalPage = Math.ceil(paging.fullWidth / paging.pageUnit);
    }

    Events.emit(PAGING_UPDATED, paging);
    console.log('paging =>', paging);
    return paging;
  }, 'Paging done');
};

export const prepareFonts = async (metadata: EpubParsedData): Promise<void> => {
  if (!metadata.fonts) return Promise.resolve();
  const fontFaces = metadata.fonts.map(font => font.href).map((href) => {
    const name = href.split('/').slice(-1)[0].replace(/\./g, '_');
    return new FontFace(name, `url(${metadata.unzipPath}/${href})`);
  });

  return measure(() => Promise.all(fontFaces.map(fontFace => fontFace.load())).then(() => {
    fontFaces.forEach(f => (document as any).fonts.add(f));
  }), `${metadata.fonts.length} fonts loaded`);
};

export const goToPage = async (page: number, paging: PagingState, setting: SettingState): Promise<void> => {
  return measure(async () => {
    const { pageUnit } = paging;
    if (SettingUtil.isScroll(setting)) {
      document.documentElement.scrollLeft = 0;
      document.documentElement.scrollTop = (page - 1) * pageUnit;
    } else {
      document.documentElement.scrollTop = 0;
      document.documentElement.scrollLeft = (page - 1) * pageUnit;
    }
    Events.emit(PAGING_UPDATED, { currentPage: page });
  }, `Go to page => ${page} (${(page - 1) * paging.pageUnit})`);
};


export const restoreCurrent = async (paging: PagingState, setting: SettingState): Promise<void> => {
  const { currentPage } = paging;
  return measure(() => goToPage(currentPage, paging, setting), `Restore current page => ${currentPage}`);
};

export const invalidate = async (pagingPrev: PagingState, setting: SettingState): Promise<void> => {
  return inLoadingState(async () => {
    try {
      await waitImagesLoaded();
      await ReaderJsHelper.reviseImages();
      // 여기서 paging을 새로 받지 않으면 invalidate 함수의 인자로 받은 paging은 예전 context임
      const paging = await startPaging(setting);
      // 흠.. 좋지 않다. context update(dispatch)를 위해선 반드시 컴포넌트 안에 있어야 하는데...
      await restoreCurrent({ ...pagingPrev, ...paging }, setting);
    } catch (e) {
      console.error(e);
    }
  });
};

export const load = async (file: File, paging: PagingState, setting: SettingState): Promise<void> => {
  return inLoadingState(async () => {
    try {
      const metadata = await parseBook(file);
      await appendStyles(metadata);
      await prepareFonts(metadata);
      Events.emit(SET_CONTENT, metadata.spines);
      await invalidate(paging, setting);
    } catch (e) {
      console.error(e);
    }
  });
};

export const updateCurrent = async (paging: PagingState, setting: SettingState) => {
  if (!status.startToRead) return null;
  return measure(() => {
    const { pageUnit } = paging;
    if (SettingUtil.isScroll(setting)) {
      const { scrollTop } = document.documentElement;
      Events.emit(PAGING_UPDATED, { currentPage: Math.floor(scrollTop / pageUnit) + 1 });
    } else {
      const { scrollLeft } = document.documentElement;
      Events.emit(PAGING_UPDATED, { currentPage: Math.floor(scrollLeft / pageUnit) + 1 });
    }
  }, 'update current page');
};
