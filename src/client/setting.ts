export interface RenderContext {
  columnGap: number,
  columnsInPage: number,
  scrollMode: boolean,
}

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

export const renderContext: RenderContext = {
  columnGap: 10,
  columnsInPage: 1,
  scrollMode: false,
};

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
