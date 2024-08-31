import React from 'react';
import { CellProps } from 'rsuite';
import AppTable from '../AppTable';
import EllipsisPopup from '@components/EllipsisPopup';

interface TextCellProps extends CellProps {
  text?: React.ReactElement | string;
  showHyphen?: boolean;
}

const TextCell = ({ rowData, dataKey, text, showHyphen = true, ...props }: TextCellProps) => {
  const dataKeys = (dataKey as string)?.split('.') || [];
  const value = dataKeys.reduce((acc: any, key: string) => (acc ? acc[key] : rowData[key]), undefined);

  return (
    <AppTable.Cell {...props}>
      <EllipsisPopup text={text ? text : value ? value : showHyphen ? '-' : ''} />
    </AppTable.Cell>
  );
};

export default TextCell;
