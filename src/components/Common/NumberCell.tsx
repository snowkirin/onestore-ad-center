import AppTable from '@components/AppTable';
import React, { useMemo } from 'react';
import { CellProps } from 'rsuite';
import EllipsisPopup from '@components/EllipsisPopup';
import { numberWithCommas } from '@/utils';
import _ from 'lodash';
import { CurrencyUnit } from '@utils/variables';

interface SpendCellProps extends CellProps {
  currencyKey?: string;
}
const SpendCell: React.FC<SpendCellProps> = ({ rowData, dataKey, currencyKey, ...props }) => {
  const value = useMemo(() => {
    const currency = currencyKey ? `${CurrencyUnit[_.get(rowData, currencyKey)]} ` : '₩ ';
    const spendValue = _.get(rowData, dataKey!);
    return `${currency}${numberWithCommas(_.ceil(spendValue))}`;
  }, [rowData, dataKey, currencyKey]);
  return (
    <AppTable.Cell {...props}>
      <EllipsisPopup text={value} />
    </AppTable.Cell>
  );
};

interface CostCellProps extends CellProps {
  currencyKey?: string;
  firstKey: string;
  secondKey: string;
  decimalNumber?: number;
  multiplyNumber?: number;
}
/* CPC, CPI, CPA, CPConv */
const CostCell: React.FC<CostCellProps> = ({
  rowData,
  dataKey,
  currencyKey,
  firstKey,
  secondKey,
  decimalNumber = 2,
  multiplyNumber = 1,
  ...props
}) => {
  const value = useMemo(() => {
    const currency = currencyKey ? `${CurrencyUnit[_.get(rowData, currencyKey)]} ` : '₩ ';
    const firstValue =
      typeof _.get(rowData, firstKey) === 'string' ? parseFloat(_.get(rowData, firstKey)) : _.get(rowData, firstKey);
    const secondValue =
      typeof _.get(rowData, secondKey) === 'string' ? parseFloat(_.get(rowData, secondKey)) : _.get(rowData, secondKey);
    return `${currency}${numberWithCommas(
      secondValue === 0 ? 0 : _.round((firstValue * multiplyNumber) / secondValue, decimalNumber)
    )}`;
  }, [rowData, dataKey, currencyKey, firstKey, secondKey, decimalNumber, multiplyNumber]);
  return (
    <AppTable.Cell {...props}>
      <EllipsisPopup text={value} />
    </AppTable.Cell>
  );
};

interface CtrCellProps extends CellProps {
  firstKey: string;
  secondKey: string;
}

/* Only CTR */
const CtrCell: React.FC<CtrCellProps> = ({ rowData, dataKey, firstKey, secondKey, ...props }) => {
  const value = useMemo(() => {
    const firstValue =
      typeof _.get(rowData, firstKey) === 'string' ? parseFloat(_.get(rowData, firstKey)) : _.get(rowData, firstKey);
    const secondValue =
      typeof _.get(rowData, secondKey) === 'string' ? parseFloat(_.get(rowData, secondKey)) : _.get(rowData, secondKey);
    return `${numberWithCommas(secondValue === 0 ? 0 : _.round((firstValue * 100) / secondValue, 2))}%`;
  }, [rowData, firstKey, secondKey]);
  return (
    <AppTable.Cell {...props}>
      <EllipsisPopup text={value} />
    </AppTable.Cell>
  );
};

interface IpmCellProps extends CellProps {
  firstKey: string;
  secondKey: string;
}
const IpmCell: React.FC<IpmCellProps> = ({ rowData, dataKey, firstKey, secondKey, ...props }) => {
  const value = useMemo(() => {
    const firstValue =
      typeof _.get(rowData, firstKey) === 'string' ? parseFloat(_.get(rowData, firstKey)) : _.get(rowData, firstKey);
    const secondValue =
      typeof _.get(rowData, secondKey) === 'string' ? parseFloat(_.get(rowData, secondKey)) : _.get(rowData, secondKey);
    return `${numberWithCommas(secondValue === 0 ? 0 : _.round((firstValue * 1000) / secondValue, 2))}`;
  }, [rowData, firstKey, secondKey]);
  return (
    <AppTable.Cell {...props}>
      <EllipsisPopup text={value} />
    </AppTable.Cell>
  );
};

const CommaCell = ({ rowData, dataKey, ...props }: CellProps) => {
  const value = useMemo(() => {
    const dataValue = _.get(rowData, dataKey!);
    return numberWithCommas(dataValue);
  }, [rowData, dataKey]);
  return (
    <AppTable.Cell {...props}>
      <EllipsisPopup text={value} />
    </AppTable.Cell>
  );
};

export { SpendCell, CostCell, CtrCell, IpmCell, CommaCell };
