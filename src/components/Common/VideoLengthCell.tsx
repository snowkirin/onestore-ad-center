import React from 'react';
import AppTable from '@components/AppTable';
import { get as _get } from 'lodash';
import { CellProps } from 'rsuite';

interface VideoLengthCellProps extends CellProps {}

const VideoLengthCell: React.FC<VideoLengthCellProps> = ({ rowData, dataKey, ...props }) => {
  const dataKeyObject = _get(rowData, dataKey!);
  return <AppTable.Cell {...props}>{`${dataKeyObject}s`}</AppTable.Cell>;
};

export default VideoLengthCell;
