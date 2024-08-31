import React from 'react';
import AppTable from '@components/AppTable';
import { get as _get } from 'lodash';
import { StyledContentWrapper } from './Styled';
import { CellProps } from 'rsuite';

interface VideoCellProps extends CellProps {}

const VideoCell: React.FC<VideoCellProps> = ({ rowData, dataKey, ...props }) => {
  const dataKeyObject = _get(rowData, dataKey!);
  return (
    <AppTable.Cell {...props}>
      {dataKeyObject && (
        <StyledContentWrapper>
          <video style={{ height: '100%' }} controls>
            <source src={dataKeyObject} type={'video/mp4'} />
          </video>
        </StyledContentWrapper>
      )}
    </AppTable.Cell>
  );
};

export default VideoCell;
