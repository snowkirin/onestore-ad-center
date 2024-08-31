import { API_WB } from '@apis/request';
import { queryStringify } from '@utils/functions';

/**
 * [사용자 리스트]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2875129925}
 * 조직/계정 > 사용자
 * 관리자(ADMIN), 관리자_재무(ADMIN_FINANCE), 관리자_CS(ADMIN_CS)
 */

export const getUserList = async (filter: any, pageParams: any, sortParams: any) => {
  const queryParams = queryStringify(pageParams);
  if (document.location.pathname === '/admin/account/ad-account/create') { //관리자가 광고계정 생성시 대상 사용자는 마스킹을 제외해야 하여 헤더 추가
    return await API_WB.get(`/v1/accounts?filter=${filter}&${queryParams}${sortParams}`, { headers: { 'mask': 'false' }});
  } else {
    return await API_WB.get(`/v1/accounts?filter=${filter}&${queryParams}${sortParams}`);
  }
};

/**
 * [사용자 상태 변경]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2871623689}
 * 조직/계정 > 사용자 상태 변경 1번 항목
 * 관리자(ADMIN)
 * 광고주 마스터(ADVERTISER_MASTER)
 * 광고주 User(ADVERTISER_EMPLOYEE)
 */

export const changeUserStatus = async (params: any) => {
  return await API_WB.patch(`/v1/accounts/enabled?ids=${params.ids}&enabled=${params.enabled}`);
};

/**
 * [패스워드 초기화 메일 발송]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2916909064}
 * 조직/계정 > 사용자 수정 > 임시 비밀번호 발송
 * 관리자(ADMIN)
 * 재무관리자 (ADMIN_FINANCE)
 * 관리자 CS (ADMIN_CS)
 */

export const deleteUser = async (params: any) => {
  const queryParams = queryStringify(params);
  return await API_WB.patch(`/v1/accounts/deleted?${queryParams}`);
};

/**
 * [사용자 생성]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2925985837}
 * 조직/계정 > 사용자 > 생성
 * 광고주 마스터(ADVERTISER_MASTER)
 * 광고주 User(ADVERTISER_EMPLOYEE)
 * 대행사 User(AGENCY)
 */

export const createUser = async (params: any) => {
  return await API_WB.post(`/v1/accounts`, params);
};

/**
 * [패스워드 초기화 메일 발송]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2916909064}
 * 조직/계정 > 사용자 수정 > 임시 비밀번호 발송
 * 관리자(ADMIN)
 * 재무관리자 (ADMIN_FINANCE)
 * 관리자 CS (ADMIN_CS)
 */

export const sendTempPwdEmail = async (id: any) => {
  return await API_WB.post(`/v1/accounts/${id}/reset-password`);
};

/**
 * [사용자 조회]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2919071753}
 * 조직/계정 > 사용자 > 조회/수정
 * 관리자(ADMIN)
 * 관리자_재무(ADMIN_FINANCE)
 * 관리자_CS(ADMIN_CS)
 */

export const getUserDetail = async (id: any) => await API_WB.get(`/v1/accounts/${id}`);

/**
 * [몰로코 계정 토큰 생성]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2919071745}
 * 조직/계정 > 사용자 > 조회/수정
 * 관리자(ADMIN)
 * 관리자_재무(ADMIN_FINANCE)
 * 관리자_CS(ADMIN_CS)
 */

export const makeMolocoToken = async (id: any) => {
  return await API_WB.post(`/v1/accounts/${id}/api-token`);
};

/**
 * [사용자 수정]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2922119189}
 * 조직/계정 > 사용자 > 조회/수정
 * 관리자(ADMIN)
 * 관리자_재무(ADMIN_FINANCE)
 * 관리자_CS(ADMIN_CS)
 * 광고주 마스터(ADVERTISER_MASTER)
 * 광고주 User(ADVERTISER_EMPLOYEE)
 */

export const updateUser = async (id: any, params: any) => {
  return await API_WB.put(`/v1/accounts/${id}`, params);
};

/**
 * [이메일 변경 인증 코드 이메일 발송]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2923823105}
 * 조직 계정 > 조회/수정
 */

export const sendEmailChangeCode = async (params: any) => {
  return await API_WB.post(`/v1/accounts/${params.accountId}/send-email-change-code`, params);
};

/**
 * [이메일 변경 인증번호 확인]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2924511233}
 * 조직 계정 > 조회/수정
 */

export const chkEmailChangeCode = async (params: any) => {
  return await API_WB.post(`/v1/accounts/${params.accountId}/change-email`, params);
};

/**
 * [비밀번호 변경]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2956001281}
 * 조직 계정 > 사용자 조회
 */

export const myAccountPwdChange = async (id: any, params: any) => {
  return await API_WB.put(`/v1/accounts/change-password?account-id=${id}`, params);
};
