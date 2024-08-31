import { API_WB } from '@apis/request';

export const getAdminHelpCategory = () => {
  return API_WB.get(`/v1/help-categories`);
};

export const saveAdminHelpCategory = (data: any) => {
  return API_WB.post(`/v1/helps`, data);
};

export const getAdminHelpDetail = (id: any) => {
  return API_WB.get(`/v1/helps/${id}`);
};

export const updateAdminHelpContent = (id: any, params: any) => {
  return API_WB.put(`/v1/helps/${id}`, params);
};

export const helpFileUpload = (bodyParams: any) => {
  return API_WB.post(`/v1/helps/attachments`, bodyParams, {
    headers: { 'Content-Type': 'multipart/form-data; charset=UTF-8' },
  });
};
