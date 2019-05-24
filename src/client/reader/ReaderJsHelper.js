import { Context, Reader, Util } from '@ridi/reader.js/web';
import { isExist } from './Util';
import { measure } from '../util';
import { renderContext, uiRefs } from '../setting';

const DETECTION_TYPE = 'top'; // bottom or top
const EMPTY_READ_LOCATION = '-1#-1';

class ReaderJsHelper {
  _readerJs = null;


  get readerJs() {
    return this._readerJs;
  }

  get sel() {
    return this._readerJs.sel;
  }

  get content() {
    return this._readerJs.content;
  }

  get context() {
    return this._readerJs.context;
  }

  _setDebugMode(debugMode = false) {
    this._readerJs.debugNodeLocation = debugMode;
  }

  _createContext(node, isScrollMode, maxSelectionLength = 1000) {
    const columnGap = Util.getStylePropertyIntValue(node, 'column-gap');
    const width = window.innerWidth - columnGap;
    const height = window.innerHeight;
    return new Context(width, height, columnGap, false, isScrollMode, maxSelectionLength);
  }

  mount() {
    if (this._readerJs) {
      this.unmount();
    }
    this._readerJs = new Reader(uiRefs.contentRoot, this._createContext(uiRefs.contentRoot, renderContext.scrollMode));
    this._setDebugMode(process.env.NODE_ENV === 'development');
  }

  unmount() {
    try {
      this._readerJs.unmount();
    } catch (e) {
      /* ignore */
    }
    this._readerJs = null;
  }

  reviseImages() {
    return measure(new Promise((resolve) => {
      try {
        this._readerJs.content.reviseImages(resolve);
      } catch (e) { /* ignore */
        console.warn(e);
        resolve();
      }
    }), 'revise images');
  }

  getOffsetFromNodeLocation(location) {
    if (isExist(location) && location !== EMPTY_READ_LOCATION) {
      return this.readerJs.getOffsetFromNodeLocation(location, DETECTION_TYPE);
    }
    return null;
  }

  getNodeLocationOfCurrentPage() {
    return this.readerJs.getNodeLocationOfCurrentPage(DETECTION_TYPE);
  }

  getRectsFromSerializedRange(serializedRange) {
    return this.readerJs.getRectsFromSerializedRange(serializedRange);
  }

  getOffsetFromSerializedRange(serializedRange) {
    return this.readerJs.getOffsetFromSerializedRange(serializedRange);
  }

  getOffsetFromAnchor(anchor) {
    return this.readerJs.getOffsetFromAnchor(anchor);
  }
}

export default new ReaderJsHelper();
