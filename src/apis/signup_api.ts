import { API_WB } from '@apis/request';
import { queryStringify } from '@utils/functions';

/**
 * [사업자 번호 중복 확인]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2884337672}
 * */
export const existsBusinessNumber = async (payload: {
  queryParams: {
    business_license_number: string;
  };
}) => {
  const query = queryStringify(payload.queryParams);
  return await API_WB.get(`/v1/advertisers/business-number-exists?${query}`);
};

/**
 * [가입 인증 이메일 발송]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2885812255}
 * */
export const sendJoinEmail = async (payload: {
  bodyParams: {
    email: string;
  };
}) => {
  return await API_WB.post(`/v1/auth/join-email`, payload.bodyParams);
};

/**
 * [가입 인증 번호 확인]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2885779507}
 * */
export const verifyJoinEmail = async (payload: {
  bodyParams: {
    email: string;
    code: string;
  };
}) => {
  return await API_WB.post(`/v1/auth/verify-join-email`, payload.bodyParams);
};

/**
 * [회원 가입]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2884337665}
 * */

export const signUp = async (payload: { bodyParams: any }) => {
  return await API_WB.post(`/v1/sign-up`, payload.bodyParams);
};
