import { API_CLOUD, API_WB } from '@apis/request';
import { queryStringify } from '@utils/functions';

/*
 * 소재 리스트 가져오기
 * https://developer.moloco.cloud/reference/dspapi_listcreatives
 * */

/**
 * [소재 리스트 가져오기]{@link https://developer.moloco.cloud/reference/dspapi_listcreatives}
 * @param { Object } payload - 필수
 * @param { string } payload.ad_account_id - 필수
 * @param { string } payload.product_id - 선택
 * @param { boolean } payload.show_deleted - 선택 (true | false)
 * @param { string } payload.inquiry_option - 선택 (INQUIRY_ENTITY | INQUIRY_OVERVIEW | INQUIRY_ALL)
 * */
export const getCreativeList = async (payload: {
  ad_account_id: string;
  product_id?: string;
  show_deleted?: boolean;
  inquiry_option?: 'INQUIRY_ENTITY' | 'INQUIRY_OVERVIEW' | 'INQUIRY_ALL';
}) => {
  const queryParams = queryStringify(payload);
  return await API_CLOUD.get(`/v1/creatives?${queryParams}`);
};

/*
 * 소재 정보 가져오기
 * https://developer.moloco.cloud/reference/dspapi_readcreative
 * */

export const getCreativeDetail = async (creativeID: string) => {
  return await API_CLOUD.get(`/v1/creatives/${creativeID}`);
};

/*
 * 소재 삭제
 * https://developer.moloco.cloud/reference/dspapi_deletecreative
 * */

export const deleteCreative = async (creativeID: string) => {
  return await API_CLOUD.delete(`/v1/creatives/${creativeID}`);
};

/*
 * 소재 수정 하기
 * https://developer.moloco.cloud/reference/dspapi_updatecreative
 * */

export const updateCreative = async ({ creativeID, payload }: { creativeID: string; payload: any }) => {
  return await API_CLOUD.put(`/v1/creatives/${creativeID}`, payload);
};

/**
 * [새로운 에셋 업로드]{@link https://developer.moloco.cloud/reference/dspapi_createassetuploadsession}
 * */
export const uploadCreativeAssets = (payload: any, bodyParams: any) => {
  const query = queryStringify(payload);
  return API_CLOUD.post(`/v1/creative-assets?${query}`, bodyParams);
};

/**
 * [소재 생성]{@link https://developer.moloco.cloud/reference/dspapi_createcreative-1}
 * */
export const createCreative = async (payload: {
  queryParams: {
    ad_account_id: string;
    product_id: string;
  };
  bodyParams: any;
}) => {
  const query = queryStringify(payload.queryParams);
  return await API_CLOUD.post(`/v1/creatives?${query}`, payload.bodyParams);
};

/**
 * [소재 생성 - bulk]{@link https://developer.moloco.cloud/reference/dspapi_createcreatives}
 * 요청 URL: https://api.moloco.cloud/cm/v1/creatives-bulk?ad_account_id=cg6oh4mGS1hi1hKa&product_id=CHfzZZ8lsoNIKG0k
 * */
export const createCreativeBulk = async (payload: {
  queryParams: {
    ad_account_id: string;
    product_id: string;
  };
  bodyParams: any;
}) => {
  const query = queryStringify(payload.queryParams);
  return await API_CLOUD.post(`/v1/creatives-bulk?${query}`, payload.bodyParams);
  // {
  //   "creatives": [
  //   {
  //     "title": "320x50.png",
  //     "type": "IMAGE",
  //     "original_filename": "320x50.png",
  //     "image": {
  //       "image_url": "https://cdn-f.adsmoloco.com/cg6oh4mGS1hi1hKa/creative/l9ly4jt4_tzuzdxq_tddvl9lixh7a3r4c.png",
  //       "width": 320,
  //       "height": 50,
  //       "size_in_bytes": 1696,
  //       "auto_generated": false
  //     },
  //     "size_in_bytes": 1696
  //   }
  // ]
  // }
};

export const getCreativeVideoInfo = async (payload: any) => {
  return API_WB.post(`/v1/videoinfo`, payload, {
    headers: { 'Content-Type': 'multipart/form-data; boundary=boundary' },
  });
};
