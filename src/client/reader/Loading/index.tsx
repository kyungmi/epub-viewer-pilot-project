/** @jsx jsx */
import React, {useContext} from 'react';
import { jsx } from '@emotion/core';
import { StatusContext } from '../Context';
import * as styles from './styles';

const Loading: React.FunctionComponent = () => {
  const statusContext = useContext(StatusContext);

  console.log(`startToRead: ${statusContext.startToRead}`);

  if (statusContext.startToRead) return null;
  return (
    <div css={styles.wrapper}>Loading...</div>
  );
};


export default Loading;
