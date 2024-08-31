import React, { useEffect } from 'react';
import { API_GRAPHQL } from '@apis/request';
import AppTypography from '@components/AppTypography';
import DeleteIcon from '@assets/images/addIcons/multiplication-gray.svg';
import styled from 'styled-components';

interface LocationTagsProps {
  data: any[];
  dataKey: string;
  onRemove?: (dataKey: any, selectedData: any) => void;
}

const StyledAudienceTarget = styled.div`
  .row {
    display: flex;
    & + .row {
      margin-top: 10px;
    }
    .col {
      .text {
        line-height: 32px;
      }
      &.col-label {
        width: 120px;
      }
      &.col-input {
        width: 640px;
        .inner {
          & + .inner {
            margin-top: 30px;
          }
        }
      }
      &.col-extra {
      }
    }
  }
`;
const StyledItems = styled.div<{
  isMultiple?: boolean;
}>`
  margin-top: 10px;
  width: 640px;
  .item {
    padding: 15px 20px;
    border-radius: 4px;

    .cell {
      margin-bottom: 15px;

      .custom-audience__btn {
        position: absolute;
        right: 15px;
        cursor: pointer;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }

    &.item--depth1 {
      ${(props) =>
        props.isMultiple &&
        `
      &:first-child {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      } 
      &:last-child {
        margin-top: -1px;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
      }
   `}
      border: 1px solid var(--disable-line);
    }

    &.item--depth2 {
      border: 1px solid var(--border-line);
      margin-left: 20px;
      position: relative;

      & + .item--depth2 {
        margin-top: 20px;
      }
    }
  }
`;
const StyledChainRadio = styled.div`
  position: relative;
  border: 1px solid var(--border-line);
  border-radius: 4px;
  margin-left: -10px;
  margin-top: 10px;
  margin-bottom: 10px;
  display: inline-block;
  padding: 6px 20px 6px 15px;
  background-color: var(--w000);

  &:before,
  &:after {
    content: '';
    position: absolute;
    display: block;
    height: 75px;
    width: 12px;
    background-color: transparent;
    left: 18px;
  }

  &:before {
    border-left: 1px solid var(--border-line);
    border-top: 1px solid var(--border-line);
    top: -75px;
  }

  &:after {
    border-left: 1px solid var(--border-line);
    border-bottom: 1px solid var(--border-line);
    bottom: -75px;
  }
`;

const StyledLocationTags = styled.div`
  .parent + .parent {
    margin-top: 10px;
  }
  .children {
    margin-top: 5px;
  }
  border: 1px solid var(--disabled-color);
  border-radius: 4px;
  gap: 5px;
  padding: 5px;
  margin-top: 7px;
  .app-tag {
    background-color: var(--disabled-color);
    display: flex;
    flex: 0 0 100%;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    align-items: center;
    padding: 4px 31px 3px 10px;
  }
`;

const LocationTags: React.FC<LocationTagsProps> = ({ data, dataKey, onRemove }) => {
  const [locationCodes, setLocationCodes] = React.useState<any>([]);
  useEffect(() => {
    API_GRAPHQL.post('', {
      query:
        '\n  query LocationsByCountry($request: LocationsByCountryRequest!) {\n    locationsByCountry(request: $request) {\n      locationsByCountry {\n        locationCode\n        locationName\n        children {\n          locationCode\n          locationName\n          division\n        }\n      }\n    }\n  }\n',
      variables: {
        request: {
          locationCodes: data,
        },
      },
    })
      .then((res) => {
        setLocationCodes(res.data.data.locationsByCountry.locationsByCountry);
      })
      .catch((err) => {
        setLocationCodes([]);
      });
  }, [data]);

  return (
    <StyledLocationTags>
      {locationCodes.map((item: any, idx: number) => {
        return (
          <div className={'parent'} key={idx}>
            <AppTypography.SubTitle level={2}>{item.locationName}</AppTypography.SubTitle>
            {item.children.map((child: any, childIdx: number) => {
              return (
                <div key={childIdx} className={'app-tag children'}>
                  <span>
                    <AppTypography.Text>{child.locationName}</AppTypography.Text>
                  </span>
                  {onRemove && (
                    <span
                      style={{ marginLeft: 8, cursor: 'pointer' }}
                      onClick={() => {
                        onRemove(dataKey, child.locationCode);
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
          </div>
        );
      })}
    </StyledLocationTags>
  );
};

export { StyledAudienceTarget, StyledItems, StyledChainRadio, LocationTags };
