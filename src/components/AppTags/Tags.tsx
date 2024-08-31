import React, { useCallback } from 'react';
import styled from 'styled-components';
import DeleteIcon from '@assets/images/addIcons/multiplication-gray.svg';
import AppTypography from '@components/AppTypography';
import _ from 'lodash';

interface AppTagsProps {
  selectedData: any[];
  data: any[];
  dataKey: string;
  block?: boolean;
  onRemove?: (dataKey: any, selectedData: any) => void;
  labelKey?: string;
  valueKey?: string;
}

const StyledTags = styled.div<{ block: boolean }>`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  border: 1px solid var(--disabled-color);
  border-radius: 4px;
  gap: 5px;
  padding: 5px;
  margin-top: 7px;
  //overflow-y: auto;
  //max-height: 162px;
  .app-tag {
    background-color: var(--disabled-color);
    display: flex;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    align-items: center;
    padding: 4px 31px 3px 10px;
    ${(props) =>
      props.block &&
      `
      flex: 0 0 100%;
    `}
  }
`;

const AppTags: React.FC<AppTagsProps> = ({
  selectedData,
  data,
  dataKey,
  onRemove,
  block = false,
  labelKey,
  valueKey,
}) => {
  const filteredData = useCallback(() => {
    return _.filter(data, (item) => {
      return _.includes(selectedData, item[valueKey || 'value']);
    });
  }, [data, selectedData, labelKey, valueKey]);
  return (
    <StyledTags block={block}>
      {filteredData().map((item, index) => {
        return (
          <div className={'app-tag'} key={index}>
            <span>
              <AppTypography.Text style={{ lineHeight: '19px' }}>{item[labelKey || 'label']}</AppTypography.Text>
            </span>
            {onRemove && (
              <span
                style={{ marginLeft: 8, cursor: 'pointer' }}
                onClick={() => {
                  onRemove(dataKey, item[valueKey || 'value']);
                }}
              >
                <img
                  src={DeleteIcon}
                  alt=""
                  style={{
                    width: 12,
                    height: 12,
                    position: 'absolute',
                    right: '5px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                />
              </span>
            )}
          </div>
        );
      })}
    </StyledTags>
  );
};

/*const Tags: React.FC<TagsProps> = ({ selectedData, data, block, onRemove }) => {
  const filteredData = useCallback(() => {
    return _.filter(data, (item) => {
      return _.includes(selectedData, item.value);
    }).map((item) => item.label);
  }, [data, selectedData]);
  return (
    <StyledTags block={block}>
      {/!*{data?.map((ele, idx) => {
        return (
          <div className={'app-tag'} key={idx}>
            <span>
              <AppTypography.Text style={{ lineHeight: '19px' }}>{ele}</AppTypography.Text>
            </span>
            {!onRemove && (
              <span
                style={{ marginLeft: 8, cursor: 'pointer' }}
                onClick={() => {
                  // onRemove(idx);
                }}
              >
                <img
                  src={DeleteIcon}
                  alt=""
                  style={{
                    width: 12,
                    height: 12,
                    position: 'absolute',
                    right: '5px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                />
              </span>
            )}
          </div>
        );
      })}*!/}
    </StyledTags>
  );
};*/

export default AppTags;
