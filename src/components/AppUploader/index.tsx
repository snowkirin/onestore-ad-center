import React, { ForwardedRef } from 'react';
import { Uploader, UploaderProps } from 'rsuite';
import styled from 'styled-components';
import InfoMessage from '@components/AppTypography/InfoMessage';

interface AppUploaderProps extends UploaderProps {
  info?: string | React.ReactNode;
}

const StyledAppUploader = styled.div`
  .rs-uploader-file-items {
    width: 100%;
  }
`;

const AppUploader = React.forwardRef((props: AppUploaderProps, ref: ForwardedRef<any>) => {
  return (
    <AppUploaderContainer {...props}>
      <Uploader {...props} className={'app-uploader'} ref={ref} />
    </AppUploaderContainer>
  );
});

export default AppUploader;

const AppUploaderContainer: React.FC<AppUploaderProps> = (props) => (
  <StyledAppUploader>
    {props.info && <InfoMessage style={{ marginBottom: 5 }}>{props.info}</InfoMessage>}
    {props.children}
  </StyledAppUploader>
);
