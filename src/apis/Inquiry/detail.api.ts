import { API_WB } from '@apis/request';

export const getInquiryDetail = (id: any) => {
  return API_WB.get(`/v1/questions/${id}`);
};
