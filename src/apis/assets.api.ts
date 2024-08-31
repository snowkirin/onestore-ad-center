import queryString from 'query-string';
import { API_CLOUD } from '@apis/request';
import axios from 'axios';

// 앱 리스트
export const getApp = (payload: any) => {
  const query = queryString.stringify(payload, {
    skipEmptyString: true,
    skipNull: true,
  });
  return API_CLOUD.get(`/v1/products?${query}`);
};

// 앱 뷰
export const viewApp = (payload: any) => {
  return API_CLOUD.get(`/v1/products/${payload.product_id}`);
};

// 앱 생성
export const createApp = (payload: any, bodyParams: any) => {
  const query = queryString.stringify(payload, {
    skipEmptyString: true,
    skipNull: true,
  });
  return API_CLOUD.post(`/v1/products?${query}`, bodyParams);
};

// 앱 수정
export const updateApp = (payload: any, bodyParams: any) => {
  return API_CLOUD.put(`/v1/products/${payload.product_id}`, bodyParams);
};

// 트래킹 링크 product 목록
export const getProduct = (payload: any) => {
  const query = queryString.stringify(payload, {
    skipEmptyString: true,
    skipNull: true,
  });
  return API_CLOUD.get(`/v1/products?${query}`);
};

// 트래킹 링크 생성
export const createTrackingLink = (payload: any, bodyParams: any) => {
  const query = queryString.stringify(payload, {
    skipEmptyString: true,
    skipNull: true,
  });
  return API_CLOUD.post(`/v1/tracking-links?${query}`, bodyParams);
};

// 트래킹 링크 수정
export const updateTrackingLink = (payload: any, bodyParams: any) => {
  return API_CLOUD.put(`/v1/tracking-links/${payload.tracking_link_id}`, bodyParams);
};

// 트래킹 링크 삭제
export const deleteTrackingLink = (payload: any) => {
  return API_CLOUD.delete(`/v1/tracking-links/${payload.tracking_link_id}`);
};

// 트래킹 링크 뷰
export const viewTrackingLink = (payload: any) => {
  return API_CLOUD.get(`/v1/tracking-links/${payload.tracking_link_id}`);
};

// 고객 파일 리스트
export const getCustomerFile = (payload: any) => {
  const query = queryString.stringify(payload, {
    skipEmptyString: true,
    skipNull: true,
  });
  return API_CLOUD.get(`/v1/customer-sets?${query}`);
};

// 고객 파일 생성
export const createCustomerFile = (payload: any, bodyParams: any) => {
  const query = queryString.stringify(payload, {
    skipEmptyString: true,
    skipNull: true,
  });
  return API_CLOUD.post(`/v1/customer-sets?${query}`, bodyParams);
};

// 고객 파일 엑셀 업로드
export const uploadExcelFile = (payload: any, bodyParams: any) => {
  const query = queryString.stringify(payload, {
    skipEmptyString: true,
    skipNull: true,
  });
  return API_CLOUD.post(`/v1/creative-assets?${query}`, bodyParams);
};

// 고객 파일 구글 업로드1
export const uploadExcelFileToGoogle = (url: any) => {
  return axios
    .create({
      timeout: 6000,
      headers: { 'Content-Type': 'text/csv', 'x-goog-resumable': 'start' },
    })
    .post(url);
};

// 고객 파일 뷰
export const viewCustomerFile = (payload: any) => {
  return API_CLOUD.get(`/v1/customer-sets/${payload.customer_set_id}`);
};

// 고객 파일 삭제
export const deleteCustomerFile = (payload: any) => {
  return API_CLOUD.delete(`/v1/customer-sets/${payload.customer_set_id}`);
};

// 고객 파일 수정
export const updateCustomerFile = (payload: any, bodyParams: any) => {
  return API_CLOUD.put(`/v1/customer-sets/${payload.customer_set_id}`, bodyParams);
};
