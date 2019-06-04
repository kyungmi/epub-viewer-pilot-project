export interface UiRefs {
  topBar?: HTMLElement | null,
  contentRoot ?: HTMLElement | null,
}

export interface Status {
  startToRead: boolean,
}

export const uiRefs: UiRefs = {
  topBar: null,
  contentRoot: null,
};

export const status: Status = {
  startToRead: false,
};
