import { API_CLOUD } from '@apis/request';
import { queryStringify } from '@utils/functions';

/**
 * [트래킹 링크 리스트 가져오기]{@link https://developer.moloco.cloud/reference/dspapi_listtrackinglinks-1}
 * @param { Object } payload - 필수
 * @param { string } payload.ad_account_id - 필수
 * @param { string } payload.product_id - 선택
 * @param { string } payload.inquiry_option - 선택 (INQUIRY_ENTITY | INQUIRY_OVERVIEW | INQUIRY_ALL)
 * @param { boolean } payload.show_deleted - 선택 (true | false)
 */
export const getTrackingLinkList = (payload: {
  ad_account_id: string;
  product_id?: string;
  inquiry_option?: string;
  show_deleted?: boolean;
}) => {
  const queryParams = queryStringify(payload);
  return API_CLOUD.get(`/v1/tracking-links?${queryParams}`);
};

/**
 * [트래킹 링크 생성하기] {@link https://developer.moloco.cloud/reference/dspapi_createtrackinglink-1}
 * */
export const createTrackingLink = (
  queryParams: {
    ad_account_id: string;
    product_id: string;
  },
  bodyParams: {
    title: string;
    device_os: string;
    click_through_link: string;
    description?: string;
    tracking_company: string;
    view_through_link?: string;
  }
) => {
  const query = queryStringify(queryParams);
  return API_CLOUD.post(`/v1/tracking-links?${query}`, bodyParams);
};

/**
 * [트래킹 링크 수정] {@link https://developer.moloco.cloud/reference/dspapi_updatetrackinglink-1}
 * */
export const updateTrackingLink = (id: any, payload: any, bodyParams: any) => {
  const query = queryStringify(payload);
  return API_CLOUD.put(`/v1/tracking-links/${id}?${query}`, bodyParams);
};

/**
 * [트래킹 링크 삭제] {@link https://developer.moloco.cloud/reference/dspapi_deletetrackinglink-1}
 * */
export const deleteTrackingLink = (payload: any) => {
  return API_CLOUD.delete(`/v1/tracking-links/${payload.tracking_link_id}`);
};

/**
 * [트래킹 링크 자세히보기] {@link https://developer.moloco.cloud/reference/dspapi_viewtrackinglink-1}
 * */
export const viewTrackingLink = (payload: any) => {
  return API_CLOUD.get(`/v1/tracking-links/${payload.tracking_link_id}`);
};
