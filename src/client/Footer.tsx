import React, {ChangeEvent, KeyboardEvent, useContext, useEffect, useState} from 'react';
import Events, { PAGING_UPDATED } from './reader/Events';
import * as EpubUtil from './reader/EpubContentUtil';
import {SettingStateContext, PagingStateContext, PagingDispatchContext, PagingActionType} from './reader/Context';

const isKeyboardEvent = (e: KeyboardEvent | ChangeEvent): e is KeyboardEvent => !!(e as KeyboardEvent).key;
const isHtmlInputElement = (target: any): target is HTMLInputElement => !!(target as HTMLInputElement).value;

const Footer: React.FunctionComponent = () => {
  // 전역 context
  const pagingState = useContext(PagingStateContext);
  const pagingDispatcher = useContext(PagingDispatchContext);
  const settingState = useContext(SettingStateContext);

  // 로컬에서만 유지되는 값
  const [currentPage, setCurrentPage] = useState(pagingState.currentPage);

  const onPagingUpdated = (paging: any) => {
    pagingDispatcher({ type: PagingActionType.UPDATE_PAGING, paging });
  };

  const onInputCurrentPage = (e: KeyboardEvent<HTMLInputElement> | ChangeEvent<HTMLInputElement>) => {
    if (isKeyboardEvent(e) && e.key === 'Enter') {
      EpubUtil.goToPage(currentPage, pagingState, settingState);
    } else if (isHtmlInputElement(e.target)) {
      setCurrentPage(parseInt(e.target.value || '1', 10));
    }
  };

  useEffect(() => {
    Events.on(PAGING_UPDATED, onPagingUpdated);
    return () => {
      Events.off(PAGING_UPDATED, onPagingUpdated);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(pagingState.currentPage);
  }, [pagingState]);

  return (
    <div id="footer" className="footer_area">
      <div className="footer_paging_status">
        <input
          type="number"
          value={currentPage}
          onKeyUp={onInputCurrentPage}
          onChange={onInputCurrentPage}
        />
        / {pagingState.totalPage}
      </div>
    </div>
  );
};

export default Footer;
