import { API_CLOUD } from '@apis/request';
import { queryStringify } from '@utils/functions';

interface GetProductListParams {
  ad_account_id: string;
  show_deleted?: boolean;
}

interface GetAppEventSummaryQueryParams {
  'condition.attribution'?: 'UNKNOWN_ATTRIBUTION' | 'ATTRIBUTION_ALL' | 'ATTRIBUTED' | 'UNATTRIBUTED';
  'condition.revenue'?: 'UNKNOWN_REVENUE' | 'REVENUE_ALL' | 'REVENUE_TRUE' | 'REVENUE_FALSE';
  'condition.time_window'?:
    | 'UNKNOWN_TIME_WINDOW'
    | 'TIME_WINDOW_D30'
    | 'D30'
    | 'TIME_WINDOW_D90'
    | 'D90'
    | 'TIME_WINDOW_TODAY';
}

/**
 * [Product List 가져오기]{$link https://developer.moloco.cloud/reference/dspapi_listproducts}
 * @param { Object } payload
 * @param { string } payload.ad_account_id
 * @param { boolean } payload.show_deleted
 * */
export const getProductList = async (payload: GetProductListParams) => {
  const queryParams = queryStringify(payload);
  return await API_CLOUD.get(`/v1/products?${queryParams}`);
};

/**
 * [Product 자세히보기]{$link https://developer.moloco.cloud/reference/dspapi_readproduct-1}
 * @param { string } productID
 * */
export const getProductDetail = async (productID: any) => {
  return await API_CLOUD.get(`/v1/products/${productID}`);
};

/**
 * [Product 생성]{$link https://developer.moloco.cloud/reference/dspapi_createproduct}
 * @param { Object } queryParams
 * @param { string } queryParams.ad_account_id
 * @param { Object } bodyParams
 * */
export const createProduct = (queryParams: any, bodyParams: any) => {
  const query = queryStringify(queryParams);
  return API_CLOUD.post(`/v1/products?${query}`, bodyParams);
};

/**
 * [Product 수정]{$link https://developer.moloco.cloud/reference/dspapi_updateproduct}
 * */
export const updateProduct = (
  payload: {
    product_id: string;
  },
  bodyParams: any
) => {
  return API_CLOUD.put(`/v1/products/${payload.product_id}`, bodyParams);
};

/**
 * [Product 의 App Event 리스트 가져오기]{$link https://developer.moloco.cloud/reference/dspapi_readproductappeventsummary-1}
 * @param { string } productID
 * @param { Object } queryParams
 * */

export const getAppEventSummary = (productID: string, queryParams: GetAppEventSummaryQueryParams) => {
  const query = queryStringify(queryParams);
  return API_CLOUD.get(`/v1/products/${productID}/app-event-summary?${query}`);
};
