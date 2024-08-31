import create from 'zustand';

export const appListStore = create<any>((set: any) => ({
  appList: [],
  setAppList: (data: any) => {
    set(() => ({
      appList: [...data],
    }));
  },
}));
