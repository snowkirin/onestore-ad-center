import { API_CLOUD, API_WB } from '@apis/request';
import { queryStringify } from '@utils/functions';

/**
 * [Report List 가져오기]{$link https://developer.moloco.cloud/reference/dspapi_listreports-1}
 *
 * */
export const getReportList = (payload: any) => {
  const query = queryStringify(payload);
  return API_CLOUD.get(`/v1/reports?${query}`);
};

/**
 * [Report 생성]{$link https://developer.moloco.cloud/reference/dspapi_createreport-1}
 * @param payload
 * @param bodyParams
 */
export const createReport = (payload: any, bodyParams: any) => {
  const query = queryStringify(payload);
  return API_CLOUD.post(`/v1/reports?${query}`, bodyParams);
};

/**
 * [Report 상태 가져오기]{$link https://developer.moloco.cloud/reference/dspapi_readreportstatus-1}
 * @param id
 */
export const checkReportStatus = (id: any) => {
  return API_CLOUD.get(`/v1/reports/${id}/status`);
};

/**
 * [Report 삭제]{$link https://developer.moloco.cloud/reference/dspapi_deletereport-1}
 * @param id
 */
export const deleteExistingReport = (id: any) => {
  return API_CLOUD.delete(`/v1/reports/${id}`);
};

export const getReportResult = (id: any) => {
  return API_WB.get(`/v1/reports/${id}`);
};

export const getMetaData = (id: any) => {
  return API_WB.get(`/v1/reports/${id}/meta-data`);
};

export const getGraphData = (id: any, params: any) => {
  return API_WB.get(
    `/v1/reports/${id}/graph?criteria=${params.criteria}&metric=${params.metric}&filter-id=${params.filterId}`
  );
};
