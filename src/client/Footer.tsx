import React, {ChangeEvent, KeyboardEvent, useContext, useEffect, useState} from 'react';
import {SettingContext, PagingContext} from './reader/Context';
import { isScroll } from './reader/SettingUtil';
import EpubService from './reader/EpubService';

const isKeyboardEvent = (e: KeyboardEvent | ChangeEvent): e is KeyboardEvent => !!(e as KeyboardEvent).key;
const isHtmlInputElement = (target: any): target is HTMLInputElement => !!(target as HTMLInputElement).value;

const Footer: React.FunctionComponent = () => {
  // 전역 context
  const pagingState = useContext(PagingContext);
  const settingState = useContext(SettingContext);

  // 로컬에서만 유지되는 값
  const [currentPage, setCurrentPage] = useState(pagingState.currentPage);


  const onInputCurrentPage = (e: KeyboardEvent<HTMLInputElement> | ChangeEvent<HTMLInputElement>) => {
    if (isKeyboardEvent(e) && e.key === 'Enter') {
      EpubService.goToPage(currentPage, pagingState.pageUnit, isScroll(settingState));
    } else if (isHtmlInputElement(e.target)) {
      setCurrentPage(parseInt(e.target.value || '1', 10));
    }
  };

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
