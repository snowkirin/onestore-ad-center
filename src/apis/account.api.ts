import { API_WB } from '@apis/request';
import { queryStringify } from '@utils/functions';

/**
 * [광고주 리스트]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2866839562}
 * 광고주 리스트 조회
 * 관리자(ADMIN)
 */
export const getAdvertiserList = async (filter: any, pageParams: any, sortParams: any) => {
  const queryParams = queryStringify(pageParams);
  return await API_WB.get(
    `/v1/advertisers?filter=${filter}&${queryParams}&sort=${sortParams.sortType},${sortParams.direction}`
  );
};

/**
 * [광고주 상세]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2867200035}
 * 광고주 상세 - 보안요건 때문에 상세페이지는 주소 mask 처리, 수정페이지는 그대로 표시위해 mask false 처리
 * 관리자(ADMIN)
 */
export const getAdvertiserDetail = async (id: any) => {
  if (document.location.pathname.startsWith('/account/advertiser/update/')) {
    return await API_WB.get(`/v1/advertisers/${id}`, {headers: {'mask': 'false'}});
  } else {
    return await API_WB.get(`/v1/advertisers/${id}`);
  }
};

/**
 * [광고주 검수]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2866839569}
 * 광고주 검수
 * 관리자(ADMIN)
 */
export const reviewAdvertiserId = async (id: any, form: any) => {
  return await API_WB.put(`/v1/advertisers/${id}/review`, form, {
    headers: { 'Content-Type': 'multipart/form-data;' },
  });
};

/**
 * [사업자 등록증 업로드]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2866839577}
 * 사업자 등록증 업로드
 * 관리자(ADMIN)
 */
export const uploadBusinessLicense = async (file: any) => {
  return API_WB.post(`/v1/advertisers/upload-business-license`, file, {
    headers: { 'Content-Type': 'multipart/form-data; boundary=boundary' },
  });
};

/**
 * [광고주 수정]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2867200056}
 * 광고주 수정
 * 관리자(ADMIN)
 */
export const updateAdvertiserDetail = async (id: any, file: any) => {
  return await API_WB.put(`/v1/advertisers/${id}`, file, {
    headers: { 'Content-Type': 'multipart/form-data;' },
  });
};

/**
 * [광고주 비활성 가능 확인]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2866839584}
 * 광고주 비활성 토글 클릭시 비활성 가능여부 체크
 * 관리자(ADMIN)
 */
export const chkAdvertiserDisabled = async (id: any, params: any) => {
  const queryParams = queryStringify(params);
  return await API_WB.get(`/v1/advertisers/${id}/validation/enabled?${queryParams}`);
};
