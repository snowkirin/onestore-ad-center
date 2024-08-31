import { API_WB } from '@apis/request';
import { queryStringify } from '@utils/functions';

/**
 * 광고계정 리스트 가져오기
 * https://developer.moloco.cloud/reference/dspapi_listadaccounts
 */
export const getAdAccounts = async () => {
  return API_WB.get('/v1/assigned-ad-accounts');
};

/**
 * [광고 계정 리스트]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2875129917}
 * 광고 계정 리스트 조회
 * 관리자(ADMIN), 관리자_재무(ADMIN_FINANCE), 관리자_CS(ADMIN_CS)
 */

export const getAdAccountList = async (filter: any, pageParams: any, sortParams: any) => {
  const queryParams = queryStringify(pageParams);
  return await API_WB.get(
    `/v1/ad-accounts?filter=${filter}&${queryParams}&sort=${sortParams.sortType},${sortParams.direction}`
  );
};

/**
 * [광고 계정 조회]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2875129925}
 * 광고 계정 조회
 * 어드민(ADMIN)
 */

export const getAdAccountDetail = async (id: any) => {
  return await API_WB.get(`/v1/ad-accounts/${id}`);
};

/**
 * [광고계정 수정]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2874441794}
 * 광고계정 수정
 * 어드민(ADMIN), 재무(ADMIN_FINANCE), CS(ADMIN_CS), 광고주 마스터(ADVERTISER_MASTER), 광고주 User(ADVERTISER_EMPLOYEE), 대행사 User(AGENCY)
 */

export const updateAdAccount = async (params: any) => {
  return await API_WB.put(`/v1/ad-accounts/${params.id}`, params);
};

/**
 * [광고계정 생성]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2873196545}
 * 광고계정 생성
 * 관리자(ADMIN), 광고주 마스터(ADVERTISER_MASTER)
 */

export const createAdAccount = async (params: any) => {
  return await API_WB.post(`/v1/ad-accounts`, params);
};

/**
 * [광고계정 삭제 가능 확인]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2914418689}
 * 광고계정 삭제 가능 확인
 * 어드민(ADMIN), 어드민 재무(ADMIN_FINANCE), 어드민 CS(ADMIN_CS)
 */

export const ckhAccountDeleteAble = async (params: any) => {
  return await API_WB.get(`/v1/ad-accounts/delete-able?ids=${params.ids}`);
};

/**
 * [광고계정 삭제]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2913894414}
 * 광고계정 삭제
 * 어드민(ADMIN), 어드민 재무(ADMIN_FINANCE), 어드민 CS(ADMIN_CS)
 */

export const deleteAdAccount = async (params: any) => {
  return await API_WB.delete(`/v1/ad-accounts?ids=${params.ids}`);
};
