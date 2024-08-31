import { API_WB } from '@apis/request';
import { queryStringify } from '@utils/functions';

/**
 * [쿠폰 발급내역]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2856943617}
 * 어드민 쿠폰발급내역 조회, 클라이언트 쿠폰 사용내역 조회
 * 광고주 마스터(ADVERTISER_MASTER)
 * 광고주 User(ADVERTISER_EMPLOYEE)
 * 대행사 User(AGENCY)
 */

export const getCouponList = async (payload: any, sortParams: any) => {
  const queryParams = queryStringify(payload);
  return await API_WB.get(`/v1/coupons?${queryParams}&sort=${sortParams.sortType},${sortParams.direction}`);
};

/**
 * [어드민 쿠폰 목록]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2859401217}
 * 쿠폰관리 리스트
 * 관리자(ADMIN)
 */

export const getCouponManage = async (filter: any, sortParams: any) => {
  return await API_WB.get(`/v1/coupon-policies?filter=${filter}&sort=${sortParams.sortType},${sortParams.direction}`);
};

/**
 * [쿠폰 삭제]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2860384257}
 * 어드민 쿠폰관리 → 쿠폰삭제. 삭제가능 조건 유의 이용가능한 쿠폰이 있을경우 삭제 불가
 * 관리자(ADMIN)
 */

export const deleteCouponManage = async (payload: any) => {
  const queryParams = queryStringify(payload);
  return await API_WB.delete(`/v1/coupon-policies?${queryParams}`);
};

/**
 * [쿠폰 생성]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2861137921}
 * 쿠폰생성
 * 관리자(ADMIN)
 */

export const createCoupon = async (bodyParams: any) => {
  return await API_WB.post(`/v1/coupon-policies`, bodyParams);
};

/**
 * [쿠폰 생성]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2861006849}
 * 쿠폰생성
 * 관리자(ADMIN)
 */

export const getCouponDetail = async (id: any) => {
  return await API_WB.get(`/v1/coupon-policies/${id}`);
};

/**
 * [쿠폰 발급 대상 검색]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2866839553}
 * 쿠폰 발급 대상 검색
 * 관리자(ADMIN)
 */

export const getCouponAdAccountList = async (payload: any) => {
  return await API_WB.get(`/v1/coupon-policies/ad-accounts?currency=${payload.currency}&policy-id=${payload.policyId}`);
};

/**
 * [쿠폰 수정]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2861137928}
 * 쿠폰 수정
 * 관리자(ADMIN)
 */

export const updateCoupon = async (id: any, payload: any) => {
  return await API_WB.put(`/v1/coupon-policies/${id}`, payload);
};

/**
 * [쿠폰 소진 내역]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2859696129}
 * 쿠폰 소진 내역
 * 관리자(ADMIN)
 */

export const getCouponHistory = async (id: any, payload: any) => {
  const queryParams = queryStringify(payload);
  return await API_WB.get(`/v1/coupon-histories/${id}?${queryParams}`);
};

/**
 * [쿠폰 발급 내역 엑셀 다운로드]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2861006856}
 * 쿠폰 발급 내역 엑셀 다운로드
 * 관리자(ADMIN)
 */

export const getCouponExcel = async (payload: any) => {
  const queryParams = queryStringify(payload);
  return await API_WB.get(`/v1/coupons/excel?${queryParams}`, { responseType: 'arraybuffer' });
};
