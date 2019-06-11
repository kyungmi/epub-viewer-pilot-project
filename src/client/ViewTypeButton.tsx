import React, {useContext} from 'react';
import {SettingContext, SettingDispatchContext, SettingActionType, ViewType} from './reader/Context';

interface ViewTypeButtonProperty {
  viewType: ViewType,
}

const ViewTypeButton: React.FunctionComponent<ViewTypeButtonProperty> = ({ viewType }) => {
  const settingState = useContext(SettingContext);
  const settingDispatch = useContext(SettingDispatchContext);

  const getLabel = (viewType: ViewType): string => {
    if (viewType === ViewType.SCROLL) return '스크롤 보기';
    if (viewType === ViewType.PAGE1) return '1페이지 보기';
    if (viewType === ViewType.PAGE12) return '2페이지 보기';
    if (viewType === ViewType.PAGE23) return '2페이지 보기';
    return '보기 방식 없음';
  };

  return (
    <button
      type="button"
      onClick={() => settingDispatch({ type: SettingActionType.UPDATE_SETTING, setting: { viewType } })}
      className={settingState.viewType === viewType ? 'active' : ''}
    >
      {getLabel(viewType)}
    </button>
  );
};

export default ViewTypeButton;
