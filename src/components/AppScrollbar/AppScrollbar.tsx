import styled from 'styled-components';

const StyledScrollbar = styled.div`
  width: 200px;
  height: 200px;
  overflow-y: scroll;

  ::-webkit-scrollbar {
    width: 10px; /* 스크롤바의 너비 */
  }

  ::-webkit-scrollbar-thumb {
    height: 30%; /* 스크롤바의 길이 */
    background-color: var(--primary-color);
    border-radius: 10px;
  }

  ::-webkit-scrollbar-track {
    background-color: var(--disable-color);
  }
`;

const AppScrollbar = () => {
  return (
    <>
      <StyledScrollbar>
        스크롤바 디자인 맞추기
        <br />
        스크롤바 디자인 맞추기
        <br />
        스크롤바 디자인 맞추기
        <br />
        스크롤바 디자인 맞추기
        <br />
        스크롤바 디자인 맞추기
        <br />
        스크롤바 디자인 맞추기
        <br />
        스크롤바 디자인 맞추기
        <br />
        스크롤바 디자인 맞추기
        <br />
        스크롤바 디자인 맞추기
        <br />
        스크롤바 디자인 맞추기
        <br />
        스크롤바 디자인 맞추기
        <br />
        스크롤바 디자인 맞추기
        <br />
        스크롤바 디자인 맞추기
        <br />
        스크롤바 디자인 맞추기
        <br />
        스크롤바 디자인 맞추기
        <br />
        스크롤바 디자인 맞추기
        <br />
        스크롤바 디자인 맞추기
        <br />
      </StyledScrollbar>
    </>
  );
};

export default AppScrollbar;
