import { queryStringify } from '@utils/functions';
import { API_CLOUD } from '@apis/request';

/**
 * [맞춤타겟 리스트]{$link https://developer.moloco.cloud/reference/dspapi_listaudiencetargets}
 * */
export const getAudienceTargetList = (queryParams: {
  ad_account_id: string;
  inquiry_option?: string;
  show_deleted?: boolean;
}) => {
  const query = queryStringify(queryParams);
  return API_CLOUD.get(`/v1/audience-targets?${query}`);
};

/**
 * [맞춤타겟 상세]{$link https://developer.moloco.cloud/reference/dspapi_readaudiencetarget-1}
 * */
export const getAudienceTargetDetail = (payload: {
  audience_target_id: string;
  queryParams: {
    ad_account_id: string;
    inquiry_option?: string;
  };
}) => {
  const query = queryStringify(payload.queryParams);
  return API_CLOUD.get(`/v1/audience-targets/${payload.audience_target_id}?${query}`);
};

/**
 * [맞춤타겟 생성]
 * */
export const createAudienceTarget = (payload: {
  queryParams: {
    ad_account_id: string;
  };
  payload: any;
}) => {
  const query = queryStringify(payload.queryParams);
  return API_CLOUD.post(`/v1/audience-targets?${query}`, payload.payload);
};

/**
 * [맞춤타겟 수정]
 * */
export const updateAudienceTarget = (payload: {
  pathParams: {
    audience_target_id: string;
  };
  queryParams: {
    ad_account_id: string;
  };
  bodyParams: any;
}) => {
  const query = queryStringify(payload.queryParams);
  return API_CLOUD.put(`/v1/audience-targets/${payload.pathParams.audience_target_id}?${query}`, payload.bodyParams);
};

/**
 * [맞춤타겟 삭제]
 * */
export const deleteAudienceTarget = (payload: {
  pathParams: { audience_target_id: string };
  queryParams: { ad_account_id: string };
}) => {
  const query = queryStringify(payload.queryParams);
  return API_CLOUD.delete(`/v1/audience-targets/${payload.pathParams.audience_target_id}?${query}`);
};
