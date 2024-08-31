import styled from 'styled-components';

const StyledItems = styled.div<{
  multiple?: boolean;
}>`
  .item {
    border: 1px solid var(--disable-line);
    border-radius: 4px;
    ${({ multiple }) => multiple ? `
  &:first-child {
    border-radius: 4px 4px 0 0;
    padding-top: 20px;
    padding-bottom: 30px;
    padding-left: 20px;
    padding-right: 20px;
  }
  &:last-child {
    margin-top: -1px;
    border-radius: 0 0 4px 4px;
    padding-top: 30px;
    padding-bottom: 20px;
    padding-left: 20px;
    padding-right: 20px;
  }
  ` : `
  padding: 20px;`
    }
`;

const StyledDescription = styled.div<{
  inline?: boolean;
}>`

  ${({ inline }) => inline ? `
  display: flex;
  .title {
  flex: 0 0 100px;
  ` : `
  margin-top: 20px;
  padding: 0 15px;
  .title {
    margin-bottom: 10px;
  }
  .desc {
    padding-left: 15px;
  }
  `}



`;

export { StyledItems, StyledDescription };