import create from 'zustand';

export const titleStore = create<any>((set: any) => ({
  title: '',
  setTitle: (data: string) => {
    set(() => ({
      title: data,
    }));
  },
}));

export const descriptionStore = create<any>((set: any) => ({
  description: '',
  setDescription: (data: string) => {
    set(() => ({
      description: data,
    }));
  },
}));

export const domainStore = create<any>((set: any) => ({
  domain: '',
  setDomain: (data: string) => {
    set(() => ({
      domain: data,
    }));
  },
}));

export const appUrlStore = create<any>((set: any) => ({
  appUrl: '',
  setAppUrl: (data: string) => {
    set(() => ({
      appUrl: data,
    }));
  },
}));

export const bundleIdStore = create<any>((set: any) => ({
  bundleId: '',
  setBundleId: (data: string) => {
    set(() => ({
      bundleId: data,
    }));
  },
}));

export const developerStore = create<any>((set: any) => ({
  developer: '',
  setDeveloper: (data: string) => {
    set(() => ({
      developer: data,
    }));
  },
}));

export const categoryStore = create<any>((set: any) => ({
  category: '',
  setCategory: (data: string) => {
    set(() => ({
      category: data,
    }));
  },
}));

export const ratingStore = create<any>((set: any) => ({
  rating: '',
  setRating: (data: string) => {
    set(() => ({
      rating: data,
    }));
  },
}));

export const mmpStore = create<any>((set: any) => ({
  mmp: '',
  setMmp: (data: string) => {
    set(() => ({
      mmp: data,
    }));
  },
}));

export const mmpBundleIdStore = create<any>((set: any) => ({
  mmpBundleId: '',
  setMmpBundleId: (data: string) => {
    set(() => ({
      mmpBundleId: data,
    }));
  },
}));

export const licenseKeyStore = create<any>((set: any) => ({
  licenseKey: '',
  setLicenseKey: (data: string) => {
    set(() => ({
      licenseKey: data,
    }));
  },
}));
