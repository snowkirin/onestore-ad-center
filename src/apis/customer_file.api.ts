import { API_CLOUD, API_WB } from '@apis/request';
import { queryStringify } from '@utils/functions';

/**
 * [고객 파일 가져오기]{@link https://developer.moloco.cloud/reference/dspapi_listcustomersets}
 * */
export const getCustomerFile = (payload: any) => {
  const query = queryStringify(payload);
  return API_CLOUD.get(`/v1/customer-sets?${query}`);
};

// 고객 파일 엑셀 업로드
// export const getUploadUrl = (payload: any, bodyParams: any) => {
//   const query = queryStringify(payload);
//   return API_CLOUD.post(`/v1/creative-assets?${query}`, bodyParams);
// };

/**
 * [고객 파일 업로드]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2858516481}
 * */
export const uploadCustomerFile = (payload: any, bodyParams: any) => {
  return API_WB.post(`/v1/gcs/uploads?upload_url=${payload.uploadUrl}&mime_type=${payload.mimeType}`, bodyParams, {
    headers: { 'Content-Type': 'text/html; charset=UTF-8' },
  });
};

/**
 * [고객 파일 생성]{@link https://developer.moloco.cloud/reference/dspapi_createcustomerset}
 * */
export const createCustomerFile = (payload: any, bodyParams: any) => {
  const query = queryStringify(payload);
  return API_CLOUD.post(`/v1/customer-sets?${query}`, bodyParams);
};

/**
 * [고객 파일 자세히보기]{@link https://developer.moloco.cloud/reference/dspapi_viewcustomerset}
 * */
export const viewCustomerFile = (payload: any) => {
  return API_CLOUD.get(`/v1/customer-sets/${payload.customer_set_id}`);
};

/**
 * [고객 파일 삭제]{@link https://developer.moloco.cloud/reference/dspapi_deletecustomerset}
 * */
export const deleteCustomerFile = (payload: any) => {
  return API_CLOUD.delete(`/v1/customer-sets/${payload.customer_set_id}`);
};

/**
 * [고객 파일 수정]{@link https://developer.moloco.cloud/reference/dspapi_updatecustomerset}
 * */
export const updateCustomerFile = (payload: any, bodyParams: any) => {
  return API_CLOUD.put(`/v1/customer-sets/${payload.customer_set_id}`, bodyParams);
};
