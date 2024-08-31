import { API_CLOUD } from '@apis/request';
import { queryStringify } from '@utils/functions';

/**
 * [소재 그룹 리스트 가져오기]{$link https://developer.moloco.cloud/reference/dspapi_listcreativegroups}
 * @param { Object } payload
 * @param { string } payload.ad_account_id
 * @param { string } payload.product_id
 * @param { string } payload.inquiry_option
 * @param { boolean } payload.show_deleted
 */
export const getCreativeGroupList = async (payload: {
  ad_account_id: string;
  product_id?: string;
  inquiry_option?: 'INQUIRY_ENTITY' | 'INQUIRY_OVERVIEW' | 'INQUIRY_ALL';
  show_deleted?: boolean;
}) => {
  const queryParams = queryStringify({
    ad_account_id: payload.ad_account_id,
    product_id: payload.product_id,
    inquiry_option: payload.inquiry_option,
    show_deleted: payload.show_deleted,
  });
  return await API_CLOUD.get(`/v1/creative-groups?${queryParams}`);
};

/**
 * [소재 그룹 생성]{$link https://developer.moloco.cloud/reference/dspapi_createcreativegroup}
 * @param { Object } query
 * @param { Object } body
 * */
export const postCreativeGroup = async (query: any, body: any) => {
  const queryParams = queryStringify(query);
  return await API_CLOUD.post(`/v1/creative-groups?${queryParams}`, body);
};
// export const postCreativeGroup = async (query: any, body: any) => {
//   const queryParams = queryStringify(query);
//   return await API_CLOUD.post(`/v1/creative-group-with-creatives?${queryParams}`, body);
// };

/**
 * [소재 그룹 자세히 보기]{$link https://developer.moloco.cloud/reference/dspapi_readcreativegroup}
 * @param { string } creative_group_id
 * @param { Object } body
 * @param { string } body.inquiry_option - 선택 (INQUIRY_ENTITY | INQUIRY_OVERVIEW | INQUIRY_ALL)
 * */
export const getCreativeGroupDetail = async (
  creative_group_id: string,
  body: { inquiry_option?: 'INQUIRY_ENTITY' | 'INQUIRY_OVERVIEW' | 'INQUIRY_ALL' }
) => {
  const queryParams = queryStringify(body);
  return await API_CLOUD.get(`/v1/creative-groups/${creative_group_id}?${queryParams}`);
};

/**
 * [소재 그룹 삭제]{$link https://developer.moloco.cloud/reference/dspapi_deletecreativegroup}
 * @param { string } creative_group_id
 * */
export const deleteCreativeGroup = async (creative_group_id: string) => {
  return await API_CLOUD.delete(`/v1/creative-groups/${creative_group_id}`);
};

/**
 * [소재 그룹 수정]{$link https://developer.moloco.cloud/reference/dspapi_updatecreativegroup}
 * @param { string} creative_group_id
 * @param { Object } body
 * */
export const putCreativeGroup = async (creative_group_id: string, body: any) => {
  return await API_CLOUD.put(`/v1/creative-groups/${creative_group_id}`, body);
};
