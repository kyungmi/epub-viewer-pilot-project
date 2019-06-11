/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, {useContext, useEffect, useState} from 'react';
import {uiRefs} from '../../setting';
import {PagingContext, SettingContext, StatusContext} from '../Context';
import {columnGap, isScroll} from '../SettingUtil';
import Events, { SET_CONTENT } from '../Events';
import ReaderJsHelper from '../ReaderJsHelper';
import EpubService from '../EpubService';
import * as styles from './styles';

const EpubReader = () => {
  const contentRef: React.RefObject<HTMLDivElement> = React.createRef();
  const [content, setContent] = useState('');
  const pagingState = useContext(PagingContext);
  const settingState = useContext(SettingContext);
  const statusState = useContext(StatusContext);

  const setSpineContent = (spines: Array<String>) => setContent(spines.join(''));

  useEffect(() => {
    uiRefs.contentRoot = contentRef.current;
    ReaderJsHelper.mount(isScroll(settingState));

    Events.on(SET_CONTENT, setSpineContent);

    return () => {
      Events.off(SET_CONTENT, setSpineContent);
    };
  }, []);

  useEffect(() => {
    const invalidate = () => EpubService.invalidate(pagingState.currentPage, isScroll(settingState), columnGap(settingState));
    const updateCurrent = () => {
      if (!statusState.startToRead) return;
      EpubService.updateCurrent(pagingState.pageUnit, isScroll(settingState));
    };

    window.addEventListener('resize', invalidate);
    window.addEventListener('scroll', updateCurrent);
    return () => {
      window.removeEventListener('resize', invalidate);
      window.removeEventListener('scroll', updateCurrent);
    };
  }, [settingState, pagingState, statusState]);

  useEffect(() => {
    ReaderJsHelper.mount(isScroll(settingState));
    EpubService.invalidate(pagingState.currentPage, isScroll(settingState), columnGap(settingState));
  }, [settingState]);

  return (
    <div
      css={styles.wrapper(settingState)}
      ref={contentRef}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default EpubReader;
