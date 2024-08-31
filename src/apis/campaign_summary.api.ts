import { queryStringify } from '@utils/functions';
import { API_CLOUD } from '@apis/request';

interface GetCampaignSummaryListParams {
  ad_account_id: string;
  timezone?: string;
  'date_range.start'?: string;
  'date_range.end'?: string;
  'filter.product_id'?: string;
  'filter.app_id'?: string;
  'filter.site_id'?: string;
  'filter.campaign_id'?: string;
  'filter.action_events'?: string[];
  group_by?: string[];
  order_by?: string[];
  limit?: string | number;
}

/**
 * [Campaign Summary List 가져오기]{$link https://developer.moloco.cloud/reference/dspapi_readcampaignsummary}
 * */
export const getCampaignSummaryList = async (queryParams: GetCampaignSummaryListParams) => {
  const query = queryStringify(queryParams);
  return await API_CLOUD.get(`/v1/campaign-summary?${query}`);
};
