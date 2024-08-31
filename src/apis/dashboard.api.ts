import { API_WB } from '@apis/request';

/**
 * [대시보드 매출 현황]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2904981512}
 * 대시보드 > 매출 현황
 * 관리자(ADMIN)
 * 재무 관리자(ADMIN_FINANCE)
 * CS 관리자(ADMIN_CS)
 */

export const getCampaignStatics = async (params: { start_date: string; end_date: string }) => {
  return await API_WB.get(
    `/v1/campaign-statistics/dashboard?start-date=${params.start_date}&end-date=${params.end_date}`
  );
};

/**
 * [대시보드 매출 현황 엑셀 다운로드]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2904981520}
 * 대시보드 > 매출 현황 엑셀 다운로드
 * 관리자(ADMIN)
 * 재무 관리자(ADMIN_FINANCE)
 * CS 관리자(ADMIN_CS)
 */

export const getCampaignStaticsExcel = async (params: { start_date: string; end_date: string }) => {
  return await API_WB.get(
    `/v1/campaign-statistics/dashboard/excel?start-date=${params.start_date}&end-date=${params.end_date}`,
    { responseType: 'arraybuffer' }
  );
};

/**
 * [매출현황 그래프 조회]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2904981528}
 * 대시보드 > 매출현황 그래프 조회
 * 관리자(ADMIN)
 * 재무 관리자(ADMIN_FINANCE)
 * CS 관리자(ADMIN_CS)
 */

export const getCampaignStaticsGraph = async (params: { start_date: string; end_date: string }) => {
  return await API_WB.get(
    `/v1/campaign-statistics/dashboard-graph?start-date=${params.start_date}&end-date=${params.end_date}`
  );
};

/**
 * [CS 문의 현황]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2902458369/CS}
 * 대시보드 > CS 문의 현황
 * 관리자(ADMIN)
 * 재무 관리자(ADMIN_FINANCE)
 * CS 관리자(ADMIN_CS)
 */

export const getCSQuestions = async () => {
  return await API_WB.get(`/v1/questions/dashboard`);
};
/**
 * [어드민유저 광고계정 소유자로 로그인]{@link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2904981505}
 * 대시보드 > 광고계정 현황
 * 관리자(ADMIN)
 * 재무 관리자(ADMIN_FINANCE)
 * CS 관리자(ADMIN_CS)
 */

export const loginAsAdvertiser = async (id: any) => {
  return await API_WB.get(`/v1/auth/login-as-advertiser?ad-account-id=${id}`);
};
