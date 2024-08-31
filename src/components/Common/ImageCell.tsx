import React from 'react';
import { StyledContentWrapper } from '@components/Common';
import AppTable from '@components/AppTable';
import { CellProps } from 'rsuite';
import { get as _get } from 'lodash';

interface ImageCellProps extends CellProps {}

const ImageCell: React.FC<ImageCellProps> = ({ rowData, dataKey, ...props }) => {
  const dataKeyObject = _get(rowData, dataKey!);
  return (
    <AppTable.Cell {...props}>
      <StyledContentWrapper>
        <img src={dataKeyObject} alt={dataKeyObject} style={{ height: '100%' }} />
      </StyledContentWrapper>
    </AppTable.Cell>
  );
};

export default ImageCell;
