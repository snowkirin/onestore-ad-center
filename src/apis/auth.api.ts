import { API_WB } from '@apis/request';
import queryString from 'query-string';

/**
 * [로그인]{$link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2818080769}
 * @param { Object } payload
 * @param { string } payload.signin_id
 * @param { string } payload.pw
 * */
export const signIn = async (payload: any) => {
  return await API_WB.post(`/v1/auth/sign-in`, queryString.stringify(payload), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

/**
 * [비밀번호 재확인]{$link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2947711001}
 * @param { Object } payload
 * @param { string } payload.pw
 * */
export const confirmPassword = async (payload: { password: string }) => {
  return await API_WB.post(`/v1/accounts/confirm-password`, payload);
};



/*
 * 몰로코 토큰 조회
 * https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2825814025
 * */
export const getMolocoToken = async () => {
  return await API_WB.get(`/v1/auth/api-token`);
};

/*
 * 로그아웃
 * https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2824470536
 * */
export const signOut = async () => {
  return await API_WB.get(`/v1/auth/sign-out`);
};

/**
 * [아이디 찾기 인증 이메일 발송]{$link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2908127361}
 * @param { Object } payload
 * @param { string } payload.email
 * */
export const findIdByEmail = async (payload: { email: string }) => {
  return await API_WB.post(`/v1/auth/find-id-by-email`, payload);
};

/**
 * [아이디 찾기 이메일 인증 번호 확인]{$link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2907930670}
 * @param { Object } payload
 * @param { string } payload.email
 * @param { string } payload.code
 * */
export const verifyFindIdCode = async (payload: { email: string; code: string }) => {
  return await API_WB.post(`/v1/auth/verify-find-id-code`, payload);
};

/**
 * [아이디 전체 이메일 발송]{$link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2908127308}
 *
 * */
export const fullSigninId = async (queryParams: { [p: string]: any; account_id: string | number | undefined }) => {
  const query = queryString.stringify(queryParams);
  return await API_WB.get(`/v1/auth/full-signin-id?${query}`);
};

/**
 * [내 정보]{$link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2907930738}
 * */
export const getMyInfo = async () => {
  return await API_WB.get(`/v1/me`);
};

/**
 * [비밀번호 찾기 인증 이메일 발송]{$link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2912092169}
 * */
export const findPasswordByEmail = async (payload: { signin_id: string; email: string }) => {
  return await API_WB.post(`/v1/auth/find-password-by-email`, payload);
};

/**
 * [비밀번호 찾기 인증 번호 확인]{$link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2912092169}
 *
 */
export const resetPassword = async (payload: { signin_id: string; email: string; code: string }) => {
  return await API_WB.post(`/v1/auth/reset-password`, payload);
};
