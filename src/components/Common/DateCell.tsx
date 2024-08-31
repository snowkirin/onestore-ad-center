import React from 'react';
import { CellProps } from 'rsuite';
import AppTable from '../AppTable';
import dayjs from 'dayjs';

interface DateCellProps extends CellProps {
  dataKey: string;
  format?: string;
}

const DateCell: React.FC<DateCellProps> = ({ rowData, dataKey, format = 'YYYY-MM-DD HH:mm:ss', ...props }) => {
  return <AppTable.Cell {...props}>{dayjs(rowData[dataKey!]).format(format)}</AppTable.Cell>;
};

export default DateCell;
