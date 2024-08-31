import { API_WB } from '@apis/request';

export const getSalesExcel = (queryParams: any, searchParams: any, page: any, size: any) => {
  return API_WB.get(
    `/v1/campaign-statistics/excel?start_date=${queryParams.start_date}&end_date=${queryParams.end_date}&date_level=${queryParams.date_level}&level=${queryParams.level}&main=${queryParams.main}&page=${page}&size=${size}${searchParams}`,
    { responseType: 'arraybuffer' }
  );
};
