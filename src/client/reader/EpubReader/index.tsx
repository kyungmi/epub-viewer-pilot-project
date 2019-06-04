/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, {useContext, useEffect, useState} from 'react';
import {uiRefs} from '../../setting';
import {PagingStateContext, SettingStateContext} from '../Context';
import * as SettingUtil from '../SettingUtil';
import Events, { SET_CONTENT } from '../Events';
import ReaderJsHelper from '../ReaderJsHelper';
import * as EpubUtil from '../EpubContentUtil';
import * as styles from './styles';

const EpubReader = () => {
  const contentRef: React.RefObject<HTMLDivElement> = React.createRef();
  const [content, setContent] = useState('');
  const pagingState = useContext(PagingStateContext);
  const settingState = useContext(SettingStateContext);

  const setSpineContent = (spines: Array<String>) => setContent(spines.join(''));

  useEffect(() => {
    uiRefs.contentRoot = contentRef.current;
    ReaderJsHelper.mount(SettingUtil.isScroll(settingState));

    Events.on(SET_CONTENT, setSpineContent);

    return () => {
      Events.off(SET_CONTENT, setSpineContent);
    };
  }, []);

  useEffect(() => {
    const invalidate = () => EpubUtil.invalidate(pagingState, settingState);
    const updateCurrent = () => EpubUtil.updateCurrent(pagingState, settingState);

    window.addEventListener('resize', invalidate);
    window.addEventListener('scroll', updateCurrent);
    return () => {
      window.removeEventListener('resize', invalidate);
      window.removeEventListener('scroll', updateCurrent);
    };
  }, [settingState, pagingState]);

  useEffect(() => {
    ReaderJsHelper.mount(SettingUtil.isScroll(settingState));
    EpubUtil.invalidate(pagingState, settingState)
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
