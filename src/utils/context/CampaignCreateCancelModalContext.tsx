import React, { createContext, PropsWithChildren, useState } from 'react';

export const CampaignCreateCancelModalContext = createContext<{
  open: boolean;
  setCancelModalOpen: (open: boolean) => void;
  onOk: () => void;
  setOnOk: (onOk: () => () => void) => void;
}>({
  open: false,
  setCancelModalOpen: () => {},
  onOk: () => {},
  setOnOk: () => {},
});

const CampaignCreateCancelModalContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [onOk, setOnOkState] = useState<() => () => void>(() => () => {});
  const setCancelModalOpen = (open: boolean) => setOpen(open);
  const setOnOk = (onOk: () => () => void) => setOnOkState(onOk);

  return (
    <CampaignCreateCancelModalContext.Provider value={{ open, setCancelModalOpen, onOk, setOnOk }}>
      {children}
    </CampaignCreateCancelModalContext.Provider>
  );
};

export default CampaignCreateCancelModalContextProvider;
