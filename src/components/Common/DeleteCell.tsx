import React from 'react';
import AppTypography from '@components/AppTypography';
import AppTable from '@components/AppTable';
import { CellProps } from 'rsuite';

interface DeleteCellProps extends CellProps {
  onDelete: (id: any, title: string) => void;
}

const DeleteCell: React.FC<DeleteCellProps> = ({ rowData, dataKey, onDelete, ...props }) => {
  return (
    <AppTable.Cell {...props}>
      <AppTypography.Link onClick={() => onDelete(rowData['id'], rowData['title'])}>삭제</AppTypography.Link>
    </AppTable.Cell>
  );
};

export default DeleteCell;
