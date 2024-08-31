import React from 'react';
import AppTable from '@components/AppTable';
import { CellProps } from 'rsuite';
import { get as _get } from 'lodash';

interface ImageSizeCellProps extends CellProps {
  dataKey: string;
}

const ImageSizeCell: React.FC<ImageSizeCellProps> = ({ rowData, dataKey, ...props }) => {
  const dataKeySplitComma = dataKey!.split(',').map((item: string) => {
    return item.trim();
  });
  const [width, height] = dataKeySplitComma;
  const widthSize = _get(rowData, width);
  const heightSize = _get(rowData, height);

  return <AppTable.Cell {...props}>{`${widthSize} x ${heightSize}`}</AppTable.Cell>;
};

export default ImageSizeCell;