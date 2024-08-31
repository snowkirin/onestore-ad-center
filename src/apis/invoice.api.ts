import { API_WB } from '@apis/request';
import { queryStringify } from '@utils/functions';

/**
 * [정산 리스트]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2928377865}
 * 정산 > 정산 내역
 * 관리자(ADMIN)
 * 재무(ADMIN_FINANCE)
 * 광고주 마스터(ADVERTISER_MASTER)
 * 광고주 User(ADVERTISER_EMPLOYEE)
 * 대행사 User(AGENCY)
 */
export const getInvoiceList = (params: any, searchParams: any, sortParams: any, page: any, size: any) => {
  const queryParams = queryStringify(params);
  return API_WB.get(
    `/v1/invoices?${queryParams}&sort=${sortParams.sortType},${sortParams.direction}&page=${page}&size=${size}${searchParams}`
  );
};

/**
 * [정산 엑셀 다운로드]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2944008223}
 * 정산 > 정산 내역
 * 관리자(ADMIN)
 * 재무(ADMIN_FINANCE)
 * 광고주 마스터(ADVERTISER_MASTER)
 * 광고주 User(ADVERTISER_EMPLOYEE)
 * 대행사 User(AGENCY)
 */
export const getInvoiceExcel = async (params: any, searchParams: any, sortParams: any) => {
  const queryParams = queryStringify(params);
  return await API_WB.get(
    `/v1/invoices/excel?${queryParams}&sort=${sortParams.sortType},${sortParams.direction}${searchParams}`,
    {
      responseType: 'arraybuffer',
    }
  );
};

/**
 * [정산 상세]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2947710977}
 * 정산 > 정산 상세
 * 관리자(ADMIN)
 * 재무(ADMIN_FINANCE)
 * 광고주 마스터(ADVERTISER_MASTER)
 * 광고주 User(ADVERTISER_EMPLOYEE)
 * 대행사 User(AGENCY)
 */
export const getInvoiceDetail = async (id: any) => {
  return await API_WB.get(`/v1/invoices/${id}`);
};

/**
 * [정산 저장/확정]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2947710993}
 * 정산 > 정산 상세
 * 관리자(ADMIN)
 * 재무(ADMIN_FINANCE)
 */
export const updateInvoice = async (id: any, payload: any) => {
  return await API_WB.put(`/v1/invoices/${id}`, payload);
};

/**
 * [정산 확정(리스트)]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2952003585}
 * 정산 > 정산 리스트 >  정산확정
 * 관리자(ADMIN)
 * 재무(ADMIN_FINANCE)
 */
export const updateInvoiceList = async (payload: any) => {
  const query = queryStringify(payload);
  return await API_WB.patch(`/v1/invoices/confirm?${query}`);
};
