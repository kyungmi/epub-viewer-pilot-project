import {PagingContextProvider, PagingDispatchContext} from './PagingContext';
import {StatusContextProvider, StatusDispatchContext} from './StatusContext';
import {SettingContextProvider, SettingDispatchContext} from './SettingContext';
import React, { useContext } from 'react';
import EpubService from '../EpubService';

const EpubContextInitializer: React.FunctionComponent<{ children: React.ReactNode }> = ({ children }) => {
  const dispatchSetting = useContext(SettingDispatchContext);
  const dispatchStatus = useContext(StatusDispatchContext);
  const dispatchPaging = useContext(PagingDispatchContext);

  EpubService.init(dispatchSetting, dispatchStatus, dispatchPaging);

  return <>{children}</>;
};

const EpubContextProvider: React.FunctionComponent<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SettingContextProvider>
      <PagingContextProvider>
        <StatusContextProvider>
          <EpubContextInitializer>
            { children }
          </EpubContextInitializer>
        </StatusContextProvider>
      </PagingContextProvider>
    </SettingContextProvider>
  );
};


export default EpubContextProvider;
