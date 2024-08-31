import { API_WB } from '@apis/request';

export const getHelpList = (first: any, second: any, search: any) => {
  return API_WB.get(`/v1/helps-by-category?first_category=${first}&second_category=${second}&filter=${search}`);
};
