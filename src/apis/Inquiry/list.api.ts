import { API_WB } from '@apis/request';

export const getInquiryList = (queryParams: any, sortParams: any, sortDirection: any, page: any, size: any) => {
  return API_WB.get(
    `/v1/questions?filter=${queryParams}&sort=${sortParams},${sortDirection}&page=${page}&size=${size}`
  );
};
