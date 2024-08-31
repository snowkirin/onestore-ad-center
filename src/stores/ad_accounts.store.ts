import create from 'zustand';

interface adAccountState {
  isEmpty: boolean;
  isCalled: boolean;
  adAccountList: any[];
  initAdAccount: () => void;
  setAdAccountList: (adAccountList: any[]) => void;
  setIsEmpty: (isEmpty: boolean) => void;
}

const initState = {
  isEmpty: false,
  isCalled: false,
  adAccountList: [],
};

export const useAdAccountStore = create<adAccountState>((set, get) => ({
  isEmpty: initState.isEmpty,
  isCalled: initState.isCalled,
  adAccountList: initState.adAccountList,
  setAdAccountList: (value: any[]) => {
    set((state) => ({
      ...state,
      adAccountList: value,
    }));
  },
  setIsEmpty: (value: boolean) => {
    set((state) => ({
      ...state,
      isEmpty: value,
    }));
  },
  initAdAccount: () => {
    set(() => ({
      ...initState,
    }));
  },
}));
