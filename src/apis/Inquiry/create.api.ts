import { API_WB } from '@apis/request';

export const createInquiryData = (bodyParams: any) => {
  return API_WB.post(`/v1/questions`, bodyParams);
};

export const inquiryFileUpload = (bodyParams: any) => {
  return API_WB.post(`/v1/question-attachments`, bodyParams, {
    headers: { 'Content-Type': 'multipart/form-data; charset=UTF-8' },
  });
};
