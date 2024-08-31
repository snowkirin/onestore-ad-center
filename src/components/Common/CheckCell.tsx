import React from 'react';
import AppTable from '../AppTable';
import { CellProps, Checkbox } from 'rsuite';

interface CheckCellProps extends CellProps {
  onChange?: any;
  checkedKeys?: any;
}

const CheckCell: React.FC<CheckCellProps> = ({ rowData, onChange, checkedKeys, dataKey, ...props }) => {
  return (
    <AppTable.Cell {...props} style={{ ...props.style, padding: 0 }}>
      <div style={{ lineHeight: '46px' }}>
        <Checkbox
          value={rowData[dataKey!]}
          style={{ marginLeft: 10, marginBottom: 16 }}
          inline
          onChange={onChange}
          checked={checkedKeys.some((item: any) => item.id === rowData[dataKey!])}
        />
      </div>
    </AppTable.Cell>
  );
};

export default CheckCell;
