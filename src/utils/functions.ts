import queryString from 'query-string';
import _ from 'lodash';
import { map, mapWithIndex, range, replicate } from 'fp-ts/lib/Array';
import { pipe } from 'fp-ts/lib/pipeable';
import { WeekConverter } from '@utils/variables';

export type TargetSchedule = {
  mo: number[];
  tu: number[];
  we: number[];
  th: number[];
  fr: number[];
  sa: number[];
  su: number[];
};

export type DaysType = 'mo' | 'tu' | 'we' | 'th' | 'fr' | 'sa' | 'su';

// queryString 에서 stringify() 공통 옵션 적용
export const queryStringify = (
  obj: any,
  options = {
    skipNull: true,
    skipEmptyString: true,
  }
) => {
  return queryString.stringify(obj, options);
};

// image to base64
export const imageToBase64 = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

export const toTargetSchedule = (value: boolean[][]) => {
  /**
   *   [[true, false, true], [...],... [true,false,ture]]
   to
   {mo: [1,2,3], TU:[0,12]...,SU:[0,1,..]}
   */

  const getTimeArr = (boolArr: boolean[]) =>
    boolArr.reduce((acc: number[], time: boolean, index: number) => {
      return time ? [...acc, index] : acc;
    }, []);

  return {
    mo: getTimeArr(value[0]),
    tu: getTimeArr(value[1]),
    we: getTimeArr(value[2]),
    th: getTimeArr(value[3]),
    fr: getTimeArr(value[4]),
    sa: getTimeArr(value[5]),
    su: getTimeArr(value[6]),
  };
};

export const toScheduleValue = (schedule: TargetSchedule) => {
  /**
   {mo: [1,2,3], TU:[0,12]...,SU:[0,1,..]}
   to
   * [[true, false, true], [...],... [true,false,ture]]
   */

  const dayOrder: DaysType[] = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'];
  const defaultValue = pipe(
    range(0, 23),
    map(() => false),
    (arr) => replicate(7, arr)
  );
  return mapWithIndex((index, value: boolean[]) => {
    const day = dayOrder[index];
    return mapWithIndex((time) => !!schedule[day]?.includes(time))(value);
  })(defaultValue);
};

/**
 * 소재를 소재타입별로 나누는 함수
 * @param { Object } creativeData -  소재데이터
 * @typedef { Object } returnData
 * @property { Object } IMAGE
 * @property { Object } VIDEO
 * @property { Object } NATIVE
 * @return { returnData }
 * */
export const creativeByType = (creativeData: any) => {
  return creativeData.reduce((result: any, value: any) => {
    (result[value.type] || (result[value.type] = [])).push(value);
    return result;
  }, {});
};

/**
 * 몰로코 스케줄을 우리가 쓰는 컴포넌트 형식의 값으로 바꾸는 함수
 * @param { Array } molocoValue - 몰로코 스케줄 값
 * */
export const toComponentScheduleValue = (molocoValue: any) => {
  return molocoValue.reduce((acc: any, cur: any) => {
    const targetKey = cur.days[0];
    const convertKey = WeekConverter[targetKey];

    if (acc.hasOwnProperty(convertKey)) {
      return {
        ...acc,
        [convertKey]: [
          ...acc[convertKey],
          ...(cur.hour_range.start
            ? range(cur.hour_range.start, cur.hour_range.end - 1)
            : range(0, cur.hour_range.end - 1)),
        ],
      };
    } else {
      return {
        ...acc,
        [convertKey]: [
          ...(cur.hour_range.start
            ? range(cur.hour_range.start, cur.hour_range.end - 1)
            : range(0, cur.hour_range.end - 1)),
        ],
      };
    }
  }, {});
};

/**
 * [1,2,3,4,8,9] 형식으로 되어있는 배열을 [ { start: 1, end : 5 }, { start: 8, end: 10 } ] 형식으로 바꾸는 함수
 * 몰로코에서 받는 값이 이런식으로 되어있음
 * @param { Array } arr - 배열
 * */
export const getContinuousNumber = (arr: number[]) => {
  if (arr.length === 0) {
    return [];
  }
  const result = [];
  let start = arr[0];
  let end = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] - arr[i - 1] === 1) {
      end = arr[i];
    } else {
      result.push({
        start: start,
        end: end + 1,
      });
      start = arr[i];
      end = arr[i];
    }
  }
  result.push({ start: start, end: end + 1 });
  return result;
};

export const isEmptyArr = (arr: any[]) => {
  return Array.isArray(arr) && arr.length === 0;
};

// 빈 string 값인지 검사
export const isEmptyString = (data: string) => {
  return data === '';
};

// 빈 값이 아닐경우 배열에 넣기
export const pushToArray = (data: string, array: any) => {
  if (!isEmptyString(data)) {
    array.push(data);
  }
};

export const calculateMetric = () => {};

export const calcMetric = (
  data: any,
  firstKey: string,
  secondKey: string,
  roundNumber: number = 2,
  multiplyNumber: number = 1
) => {
  let firstValue = parseInt(_.get(data, firstKey)) || 0;
  let secondValue = parseInt(_.get(data, secondKey)) || 0;

  return _.isNaN(firstValue / secondValue) || secondValue === 0
    ? 0
    : _.round((firstValue * multiplyNumber) / secondValue, roundNumber);
};

// role 값 구분
export const getRoleType = (role: string | null) => {
  if (role === 'ADMIN' || role === 'ADMIN_FINANCE' || role === 'ADMIN_CS') {
    return 'isAdmin';
  } else if (role === 'ADVERTISER_MASTER') {
    return 'isMaster';
  } else if (role === 'ADVERTISER_EMPLOYEE') {
    return 'isEmployee';
  } else if (role === 'AGENCY') {
    return 'isAgency';
  } else if (role === 'REPORT_VIEWER') {
    return 'isViewer';
  }
};

// Ratio Calculator
export const calcRatio = (width: number, height: number) => {
  function mdc(w: number, h: number) {
    let resto;
    do {
      resto = w % h;
      w = h;
      h = resto;
    } while (resto != 0);
    return w;
  }
  let calc = mdc(width, height);
  let widthRatio = width / calc;
  let heightRatio = height / calc;

  return `${widthRatio}:${heightRatio}`;
};

// 세션 init
export const initSessionStorage = () => {
  sessionStorage.clear();
};

// 대소문자 구분없이 정렬하기
export const sortByCaseInsensitive = (data: any[] | undefined, key: string, sortType: 'asc' | 'desc'): any[] => {
  if (data === undefined) {
    return [];
  }
  return _.orderBy(data, [(item) => item[key].toLowerCase()], [sortType]);
};
