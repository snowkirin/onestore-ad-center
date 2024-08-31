import React from 'react';
import styled from 'styled-components';

interface CreativeTooltipProps {
  type: string;
}

const StyledTooltipTable = styled.table`
  width: 300px;
  border: 1px solid #222;

  th {
    background-color: #e3e3e3;
    border-bottom: 1px solid #222;

    &:first-child {
      width: 100px;
    }
  }

  th,
  td {
    height: 30px;
    color: #222;

    &:first-child {
      border-right: 1px solid #222;
    }
  }

  td {
    padding-left: 10px;
    padding-right: 10px;
    border-top: 1px solid #e1e1e1;
  }
`;

const CreativeTooltip: React.FC<CreativeTooltipProps> = ({ type }) => {
  if (type === 'image > image') {
    return (
      <>
        <StyledTooltipTable>
          <thead>
            <tr>
              <th>용어</th>
              <th>설명</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>포맷</td>
              <td>JPEG, JPG, PNG, GIF</td>
            </tr>
            <tr>
              <td>최대 용량</td>
              <td>500KB(GIF일 경우 1MB)</td>
            </tr>
          </tbody>
        </StyledTooltipTable>
        <StyledTooltipTable style={{ marginTop: 10 }}>
          <thead>
            <tr>
              <th>이미지 타입</th>
              <th>크기</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Banner</td>
              <td>320x50, 320x100, 640x100, 640x200</td>
            </tr>
            <tr>
              <td>Medium</td>
              <td>300x250, 600x500</td>
            </tr>
            <tr>
              <td>Full screen</td>
              <td>320x480, 320x568, 360x592, 360x640, 375x667, 414x736, 480x320, 640x960</td>
            </tr>
            <tr>
              <td>Tablet</td>
              <td>728x90, 768x1024, 1024x768, 1456x180, 1536x2048</td>
            </tr>
          </tbody>
        </StyledTooltipTable>
      </>
    );
  }
  /* 네이티브, 네이티브 유형: 이미지 > 아이콘 */
  if (type === 'native > image > icon') {
    return (
      <StyledTooltipTable>
        <thead>
          <tr>
            <th>용어</th>
            <th>설명</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>포맷</td>
            <td>PNG(권장), JPEG, JPG, GIF</td>
          </tr>
          <tr>
            <td>크기</td>
            <td>256x256 또는 그 이상의 1:1 비율</td>
          </tr>
          <tr>
            <td>최대 용량</td>
            <td>500KB(GIF일 경우 1MB)</td>
          </tr>
        </tbody>
      </StyledTooltipTable>
    );
  }
  /* 네이티브, 네이티브 유형: 이미지 > 이미지 */
  if (type === 'native > image > image') {
    return (
      <StyledTooltipTable>
        <thead>
          <tr>
            <th>용어</th>
            <th>설명</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>포맷</td>
            <td>JPEG, JPG, PNG, GIF</td>
          </tr>
          <tr>
            <td>크기</td>
            <td>1200x600, 1200x628</td>
          </tr>
          <tr>
            <td>최대 용량</td>
            <td>500KB(GIF일 경우 1MB)</td>
          </tr>
        </tbody>
      </StyledTooltipTable>
    );
  }
  /* 네이티브, 네이티브 유형: 비디오 > 아이콘 */
  if (type === 'native > video > icon') {
    return (
      <StyledTooltipTable>
        <thead>
          <tr>
            <th>용어</th>
            <th>설명</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>포맷</td>
            <td>PNG(권장), JPEG, JPG, GIF</td>
          </tr>
          <tr>
            <td>크기</td>
            <td>256x256 또는 그 이상의 1:1 비율</td>
          </tr>
          <tr>
            <td>최대 용량</td>
            <td>500KB(GIF일 경우 1MB)</td>
          </tr>
        </tbody>
      </StyledTooltipTable>
    );
  }
  /* 네이티브, 네이티브 유형: 비디오 > 비디오 */
  if (type === 'native > video > video') {
    return (
      <StyledTooltipTable>
        <thead>
          <tr>
            <th>용어</th>
            <th>설명</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>포맷</td>
            <td>MP4</td>
          </tr>
          <tr>
            <td>크기</td>
            <td>16:9, 9:16, 1:1</td>
          </tr>
          <tr>
            <td>최소 가로(세로)</td>
            <td>640px</td>
          </tr>
          <tr>
            <td>최대 용량</td>
            <td>10MB</td>
          </tr>
          <tr>
            <td>동영상 길이</td>
            <td>6~100초</td>
          </tr>
          <tr>
            <td>프레임</td>
            <td>24 FPS+</td>
          </tr>
        </tbody>
      </StyledTooltipTable>
    );
  }
  /* 네이티브, 네이티브 유형: 비디오 > 종료 배너 */
  if (type === 'native > video > end_card') {
    return (
      <StyledTooltipTable>
        <thead>
          <tr>
            <th>용어</th>
            <th>설명</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>포맷</td>
            <td>JPEG, JPG, PNG, GIF</td>
          </tr>
          <tr>
            <td>크기</td>
            <td>360x480, 360x640, 480x360, 480x480, 640x360, 720x1280 or 1280x720</td>
          </tr>
          <tr>
            <td>최대 용량</td>
            <td>500KB(GIF일 경우 1MB)</td>
          </tr>
        </tbody>
      </StyledTooltipTable>
    );
  }
  /* 비디오 > 비디오 */
  if (type === 'video > video') {
    return (
      <StyledTooltipTable>
        <thead>
          <tr>
            <th>용어</th>
            <th>설명</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>포맷</td>
            <td>MP4</td>
          </tr>
          <tr>
            <td>크기</td>
            <td>16:9, 9:16, 1:1</td>
          </tr>
          <tr>
            <td>최소 가로(세로)</td>
            <td>640px</td>
          </tr>
          <tr>
            <td>최대 용량</td>
            <td>10MB</td>
          </tr>
        </tbody>
      </StyledTooltipTable>
    );
  }
  /* 비디오 > 종료 배너 */
  if (type === 'video > end_card') {
    return (
      <StyledTooltipTable>
        <thead>
          <tr>
            <th>용어</th>
            <th>설명</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>포맷</td>
            <td>JPEG, JPG, PNG, GIF</td>
          </tr>
          <tr>
            <td>크기</td>
            <td>비디오와 같은 크기</td>
          </tr>
          <tr>
            <td>최소 가로(세로)</td>
            <td>320px</td>
          </tr>
          <tr>
            <td>최대 용량</td>
            <td>500KB(GIF일 경우 1MB)</td>
          </tr>
        </tbody>
      </StyledTooltipTable>
    );
  }
  return <>잘못된 타입지정입니다.</>;
};

export default CreativeTooltip;
