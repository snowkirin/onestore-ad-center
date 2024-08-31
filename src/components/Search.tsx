import React, { useCallback } from 'react';
import styled from 'styled-components';
import SearchIcon from '@rsuite/icons/Search';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import { AppInput, AppInputGroup } from '@components/AppInput';
import { SelectPickerProps } from 'rsuite';

export const StyledSelectPicker = styled(AppSelectPicker)`
  .rs-btn.rs-btn-default.rs-picker-toggle {
    border: solid 1px var(--border-line);
    border-right: none;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
`;
export const StyledInputGroup = styled(AppInputGroup)`
  &.rs-input-group {
    border: solid 1px var(--border-line);
  }
  &.rs-input-group,
  .rs-input {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
`;

interface SearchProps extends SelectPickerProps<any> {
  searchKey?: string | number;
  searchValue?: string | number;
  onSearchKeyChange?: (value: any, event: any) => void;
  onSearchValueChange?: (value: any, event: any) => void;
  onSearch?: (searchKey: any, searchValue: any) => void;
  maxLength?: number;
  placeholder?: string;
}

const Search: React.FC<SearchProps> = (props: SearchProps) => {
  const {
    data,
    searchKey,
    searchValue,
    disabled,
    onSearchKeyChange,
    onSearchValueChange,
    onSearch,
    placeholder,
    maxLength,
  } = props;

  const handleSearch = useCallback(() => {
    if (onSearch) onSearch(searchKey, searchValue);
  }, [onSearch, searchKey, searchValue]);

  return (
    <div>
      <StyledSelectPicker
        data={data}
        style={{ minWidth: 100 }}
        searchable={false}
        cleanable={false}
        value={searchKey}
        disabled={disabled}
        onChange={onSearchKeyChange}
      />
      <StyledInputGroup
        inside
        style={{ display: 'inline-block', width: 170, verticalAlign: 'middle' }}
        disabled={disabled}
      >
        <AppInput
          size={'md'}
          placeholder={placeholder || '검색'}
          onChange={onSearchValueChange}
          value={searchValue}
          onPressEnter={handleSearch}
          maxLength={maxLength ? maxLength : undefined}
        />
        <AppInputGroup.Button onClick={handleSearch}>
          <SearchIcon />
        </AppInputGroup.Button>
      </StyledInputGroup>
    </div>
  );
};

export default Search;
