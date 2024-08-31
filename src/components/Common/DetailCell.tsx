import React from 'react';
import AppTypography from '@components/AppTypography';
import AppTable from '@components/AppTable';
import { CellProps } from 'rsuite';
import EllipsisPopup from '@components/EllipsisPopup';

interface DetailCellProps extends CellProps {
  onDetail: (id: any) => void;
}

const DetailCell: React.FC<DetailCellProps> = ({ rowData, dataKey, onDetail, ...props }) => {
  return (
    <AppTable.Cell {...props}>
      {/* 페이지 이동 */}
      <EllipsisPopup
        text={
          <AppTypography.Link
            onClick={() => {
              onDetail(`${rowData['id']}`);
            }}
          >
            {rowData[dataKey!]}
          </AppTypography.Link>
        }
      />
    </AppTable.Cell>
  );
};

export default DetailCell;
