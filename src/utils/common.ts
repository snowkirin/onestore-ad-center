const numberWithCommas = (x: any) => {
  if (x === null || x === undefined) return '';
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export default numberWithCommas;

export const getByteLengthInUTF8 = (s: string) => {
  let b, i, c;
  for (b = i = 0; (c = s.charCodeAt(i++)); b += c >> 11 ? 3 : c >> 7 ? 2 : 1);
  return b;
};

export const selectStyles = {
  option: (provided: any, state: any) => ({
    ...provided,
    color: state.isFocused ? 'var(--primary-color)' : 'var(--text-color)',
    backgroundColor: state.isFocused ? 'var(--disabled-input-background)' : 'white',
  }),
  control: (provided: any) => ({
    ...provided,
    minHeight: 32,
    cursor: 'pointer',
  }),
  dropdownIndicator: (provided: any) => ({
    ...provided,
    padding: 5,
  }),
  multiValue: (base: any, state: any) => {
    return state.data.isFixed || state.data.disabled ? { ...base, backgroundColor: 'gray' } : base;
  },
  multiValueLabel: (base: any, state: any) => {
    return state.data.isFixed || state.data.disabled
      ? { ...base, fontWeight: 'bold', color: 'white', paddingRight: 6 }
      : base;
  },
  multiValueRemove: (base: any, state: any) => {
    return state.data.isFixed || state.data.disabled ? { ...base, display: 'none' } : base;
  },
};
