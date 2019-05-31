import {getClientHeight, getClientWidth} from "./util";

export interface UiRefs {
  topBar?: HTMLElement | null,
  contentRoot ?: HTMLElement | null,
}

export interface PagingContext {
  totalPage: number,
  currentPage: number,
  fullHeight: number,
  fullWidth: number,
  pageUnit: number,
}

export interface Status {
  startToRead: boolean,
}

export enum ViewType {
  SCROLL, PAGE1, PAGE12, PAGE23,
}

export class EpubSetting {
  viewType: ViewType = ViewType.SCROLL;

  fontSizeInEm: number = 1;        // em (0.1em ~ 5.0em)
  lineHeightInEm: number = 1.67;   // em (1.0 ~ 3.0)

  contentPaddingInPercent: number = 12; // % (0 ~ 25%)

  columnGapInPercent: number = 5;  // % (1% ~ 20%)

  maxWidth: number = 700;
  containerHorizontalMargin: number = 30;
  containerVerticalMargin: number = 35;

  get isScroll(): boolean {
    return this.viewType === ViewType.SCROLL;
  }

  get columnsInPage(): number {
    if (this.viewType === ViewType.PAGE12 || this.viewType === ViewType.PAGE23) {
      return 2;
    }
    return 1;
  }

  get columnGap(): number {
    return Math.ceil(getClientWidth() * (this.columnGapInPercent / 100));
  }

  get containerWidth(): number {
    const clientWidth = getClientWidth();
    const containerWidth = clientWidth - (this.containerHorizontalMargin * 2);
    const extendedMargin = Math.ceil(clientWidth * (this.contentPaddingInPercent / 100));
    return containerWidth - (extendedMargin * 2);
  }

  get containerHeight(): number {
    const clientHeight = getClientHeight();
    return clientHeight - (this.containerVerticalMargin * 2);
  }
}

export class ImageSetting {
  viewType: ViewType = ViewType.PAGE12;

  contentWidthInPercent: number = 100;  // % (50% ~ 100%)
  maxWidth: number = 700;
  containerHorizontalMargin: number = 30;
  containerVerticalMargin: number = 35;
}

export const epubSetting = new EpubSetting();
export const imageSetting = new ImageSetting();

export const uiRefs: UiRefs = {
  topBar: null,
  contentRoot: null,
};

export const paging: PagingContext = {
  totalPage: 0,
  currentPage: 20,
  fullHeight: 0,
  fullWidth: 0,
  pageUnit: 0,
};

export const status: Status = {
  startToRead: false,
};
