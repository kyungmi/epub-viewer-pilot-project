import React from 'react';
import {ViewType} from './setting';

interface ViewTypeButtonProperty {
  viewType: ViewType,
  onSelect: (viewType: ViewType) => void,
  className: string,
}

const ViewTypeButton: React.FunctionComponent<ViewTypeButtonProperty> = ({ viewType, onSelect, className }) => {
  const getLabel = (viewType: ViewType): string => {
    if (viewType === ViewType.SCROLL) return '스크롤 보기';
    if (viewType === ViewType.PAGE1) return '1페이지 보기';
    if (viewType === ViewType.PAGE12) return '2페이지 보기';
    if (viewType === ViewType.PAGE23) return '2페이지 보기';
    return '보기 방식 없음';
  };

  return (<button type="button" onClick={() => onSelect(viewType)} className={className}>{getLabel(viewType)}</button>);
};

export default ViewTypeButton;
