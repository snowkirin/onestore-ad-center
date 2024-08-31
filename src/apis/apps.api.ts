import { API_WB } from '@apis/request';
import { queryStringify } from '@utils/functions';

/**
 * [앱 소유 인증]{$link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2879684647}
 * @param { Object } payload
 * @param { string } payload.aid
 * @param { string } payload.pkg_name
 * @param { string } payload.license_key
 * */
export const getAppOwnership = (payload: { aid: string; pkg_name?: string; license_key: string }) => {
  return API_WB.post(`/v1/apps/lookup`, payload);
};

/**
 * [앱 생성]{$link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2887188496}
 * @param { Object } queryParams
 * @param { string } queryParams.ad_account_id
 * @param { Object } bodyParams
 * @param { string } bodyParams.title
 * @param { string } bodyParams.description
 *
 * */
export const createApp = (
  queryParams: {
    ad_account_id: string;
  },
  bodyParams: {
    title: string;
    description?: string;
    advertiser_domain: string;
    developer_name: string;
    app: {
      bundle_id: string;
      category: string;
      content_rating: string;
      app_store_url: string;
      postback_integration: {
        mmp: string;
        bundle_id: string;
      };
    };
  }
) => {
  const query = queryStringify(queryParams);
  return API_WB.post(`/v1/apps?${query}`, bodyParams);
};

/**
 * [앱 수정]{$link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2928377857}
 * @param { Object } queryParams
 * @param { string } queryParams.appId
 * @param { Object } bodyParams
 * @param { string } bodyParams.title
 *
 * */
export const updateApp = (
  queryParams: {
    appId: string;
  },
  bodyParams: {
    title: string;
  }
) => {
  return API_WB.patch(`/v1/apps/${queryParams.appId}`, bodyParams);
};

/**
 * [앱 삭제]{$link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2887188504}
 * */
