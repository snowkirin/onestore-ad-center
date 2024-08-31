import { API_CLOUD } from '@apis/request';
import { queryStringify } from '@utils/functions';

interface GetCampaignListParams {
  ad_account_id: string;
  product_id?: string;
  states?: ('SUBMITTED' | 'READY' | 'UPCOMING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED')[];
  show_deleted?: boolean;
}

interface CreateCampaignParams {
  queryParams: {
    ad_account_id: string;
    product_id: string;
  };
  bodyParams: any;
}

/**
 * [Campaign List 가져오기]{$link https://developer.moloco.cloud/reference/dspapi_listcampaigns}
 * @param { Object } queryParams
 * @param { string } queryParams.ad_account_id
 * @param { string } queryParams.product_id
 * @param { Array } queryParams.states
 * @param { boolean } queryParams.show_deleted
 * */
export const getCampaignList = async (queryParams: GetCampaignListParams) => {
  const query = queryStringify(queryParams);
  return await API_CLOUD.get(`/v1/campaigns?${query}`);
};

/**
 * [Campaign 수정]{$link https://developer.moloco.cloud/reference/dspapi_updatecampaign}
 * */
export const updateCampaign = async (payload: {
  campaign_id: string;
  queryParams?: {
    ad_account_id: string;
    product_id: string;
  };
  bodyParams: any;
}) => {
  const query = queryStringify(payload.queryParams);
  return await API_CLOUD.put(`/v1/campaigns/${payload.campaign_id}?${query}`, payload.bodyParams);
};

/**
 * [Campaign 생성]{$link https://developer.moloco.cloud/reference/dspapi_createcampaign}
 *
 * */

export const createCampaign = async (
  queryParams: {
    ad_account_id: string;
    product_id: string;
  },
  bodyParams: any
) => {
  const query = queryStringify(queryParams);
  return await API_CLOUD.post(`/v1/campaigns?${query}`, bodyParams);
};

/**
 * [Campaign 자세히 보기]{$link https://developer.moloco.cloud/reference/dspapi_readcampaign-1}
 * */
export const getCampaignDetail = async (payload: {
  campaign_id: string;
  queryParams?: {
    ad_account_id: string;
    product_id: string;
  };
}) => {
  const query = queryStringify(payload.queryParams);
  return await API_CLOUD.get(`/v1/campaigns/${payload.campaign_id}?${query}`);
};

/**
 * [Campaign 삭제]{$link https://developer.moloco.cloud/reference/dspapi_deletecampaign-1}
 *
 * */

export const deleteCampaign = async (campaign_id: string) => {
  return await API_CLOUD.delete(`/v1/campaigns/${campaign_id}`);
};
