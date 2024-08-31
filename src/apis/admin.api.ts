import { API_WB } from '@apis/request';
import { queryStringify } from '@utils/functions';

/**
 * [관리자 리스트]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2871623681}
 * 관리자 리스트 조회
 * 관리자(ADMIN)
 */

export const getAdminList = async (filter: any, pageParams: any, sortParams: any) => {
  const queryParams = queryStringify(pageParams);
  return await API_WB.get(
    `/v1/admins?filter=${filter}&${queryParams}&sort=${sortParams.sortType},${sortParams.direction}`
  );
};

/**
 * [관리자 상태 변경]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2871623689}
 * 조직/계정 > 관리자 상태 변경 1번 항목
 * 관리자(ADMIN)
 */

export const changeAdminStatus = async (params: any) => {
  return await API_WB.patch(`/v1/admins/enabled?ids=${params.ids}&enabled=${params.enabled}`);
};

/**
 * [관리자 삭제]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2872279041}
 * 조직/계정 > 관리자 삭제 1번 항목, 실제 삭제 되는 건 아니니 테스트 하고 알려주세요
 * 관리자(ADMIN)
 */

export const deleteAdmin = async (params: any) => {
  return await API_WB.patch(`/v1/admins/deleted?ids=${params.ids}`);
};

/**
 * [관리자 생성]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2873196545}
 * 관리자 생성
 * 관리자(ADMIN)
 */

export const createAdmin = async (params: any) => {
  return await API_WB.post(`/v1/admins`, params);
};

/**
 * [관리자 수정]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2873196545}
 * 관리자 수정
 * 관리자(ADMIN), 재무(ADMIN_FINANCE), CS(ADMIN_CS)
 */

export const updateAdmin = async (params: any) => {
  return await API_WB.put(`/v1/admins/${params.adminId}`, params);
};

/**
 * [관리자 조회]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2873196553}
 * 관리자 수정
 * 관리자(ADMIN), 재무(ADMIN_FINANCE), CS(ADMIN_CS)
 */

export const getAdminDetail = async (adminId: any) => {
  return await API_WB.get(`/v1/admins/${adminId}`);
};

/**
 * [로그인 아이디 중복 확인]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2912092161}
 * 로그인 아이디 중복 확인
 * 회원가입 / 관리자 생성
 */

export const checkAdminId = async (adminId: any) => {
  return await API_WB.get(`/v1/accounts/signin-id-available?signin_id=${adminId}`);
};

/**
 * [이메일 중복 확인]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2936832106}
 * 이메일 유효성 검사
 */

export const checkSameEmail = async (params: any) => {
  return await API_WB.post(`/v1/auth/email-availability`, params);
};
