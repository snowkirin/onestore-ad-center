import { API_WB } from '@apis/request';

export const createInquiryAnswer = (id: any, bodyParams: any) => {
  return API_WB.put(`/v1/questions/${id}/answer`, bodyParams);
};

export const getAdminHelpList = (queryParams: any, sortParams: any, sortDirection: any, page: any, size: any) => {
  return API_WB.get(`/v1/helps?filter=${queryParams}&sort=${sortParams},${sortDirection}&page=${page}&size=${size}`);
};
