import { ComparatorsTypes, OperatorTypes } from '@utils/filter/dynamicFilterTypes';
export const getComparatorsString = (
  comparator: ComparatorsTypes,
  field: string,
  value?: string[] | number[] | string | number
) => {
  const isUndefined = (value: (string | number)[] | string | number | undefined) => {
    return value === undefined;
  };
  const isAllString = (value: (string | number)[]) => {
    return value.every((v) => typeof v === 'string');
  };
  const isAllNumber = (value: (string | number)[]) => {
    return value.every((v) => typeof v === 'number');
  };
  const isString = (value: (string | number)[] | string | number) => {
    return typeof value === 'string';
  };
  const isArray = (value: (string | number)[] | string | number | undefined) => {
    return Array.isArray(value);
  };

  //const isArray = Array.isArray(value);
  let result = '';
  if (isUndefined(value)) {
    // * field: status, comparator: is null, value: undefined
    // status is null
    result = `${field} ${comparator}`;
  } else if (!isArray(value)) {
    if (isString(value!)) {
      // * field: status, comparator: ~, value: admin
      // status ~ 'admin'
      result = `${field} ${comparator} '${value}'`;
    } else {
      // * field: status, comparator: ~, value: 1
      // status ~ 1
      result = `${field} ${comparator} ${value}`;
    }
  } else if (isArray(value) && comparator === 'in') {
    if (isAllString(value as (string | number)[])) {
      // * field: status, comparator: in, value: ['initialized', 'active']
      // status in ('initialized', 'active')
      result = `${field} ${comparator} ('${(value as []).join("','")}')`;
    } else if (isAllNumber(value as (string | number)[])) {
      // * field: status, comparator: in, value: [1,2]
      // status in (1,2)
      result = `${field} ${comparator} (${(value as []).join(',')})`;
    }
  }
  return result;
};
export const getOperatorsString = (operator: OperatorTypes, expressions: string[] | string) => {
  const isArray = (value: (string | number)[] | string | number | undefined) => {
    return Array.isArray(value);
  };
  let result = '';
  if (operator === 'not') {
    // * operator: not, expressions: "adName ~ 'member'"
    // not (adName  ~ 'member')
    result = `${operator} (${expressions})`;
  } else if (isArray(expressions)) {
    // * operator: and, expressions: ['admin','member']
    // admin and member
    result = (expressions as []).join(` ${operator} `);
  }
  return result;
};
