import { API_CLOUD } from '@apis/request';
import { queryStringify } from '@utils/functions';

/**
 * [광고그룹 리스트 가져오기]{$link https://developer.moloco.cloud/reference/dspapi_listadgroups-1}
 * */

export const getAdGroupList = async (queryParams: { [p: string]: string }) => {
  const query = queryStringify(queryParams);
  return await API_CLOUD.get(`/v1/ad-groups?${query}`);
};

/**
 * [광고그룹 생성]{$link https://developer.moloco.cloud/reference/dspapi_createadgroup-1}
 * */
export const createAdGroup = async (payload: {
  queryParams: {
    ad_account_id: string;
    product_id: string;
    campaign_id: string;
  };
  bodyParams: any;
}) => {
  const query = queryStringify(payload.queryParams);
  return await API_CLOUD.post(`/v1/ad-groups?${query}`, payload.bodyParams);
};

/**
 * [광고그룹 자세히 가져오기]{$link https://developer.moloco.cloud/reference/dspapi_readadgroup-1}
 * */
export const getAdGroupDetail = async (payload: {
  ad_group_id: string;
  queryParams: {
    ad_account_id?: string;
    product_id?: string;
    campaign_id: string;
  };
}) => {
  const query = queryStringify(payload.queryParams);
  return await API_CLOUD.get(`/v1/ad-groups/${payload.ad_group_id}?${query}`);
};

/**
 * [광고그룹 업데이트]{$link https://developer.moloco.cloud/reference/dspapi_updateadgroup-1}
 * */
export const updateAdGroup = async (payload: {
  ad_group_id: string;
  queryParams: {
    ad_account_id?: string;
    product_id?: string;
    campaign_id: string;
  };
  bodyParams: any;
}) => {
  const query = queryStringify(payload.queryParams);
  return await API_CLOUD.put(`/v1/ad-groups/${payload.ad_group_id}?${query}`, payload.bodyParams);
};

/**
 * [광고그룹 삭제]{$link https://developer.moloco.cloud/reference/dspapi_deleteadgroup-1}
 *
 * */

export const deleteAdGroup = async (campaign_id: string, ad_group_id: string) => {
  return await API_CLOUD.delete(`/v1/ad-groups/${ad_group_id}?campaign_id=${campaign_id}`);
};
