import React from 'react';
import { Form } from 'rsuite';

const AppField = React.forwardRef((props: any, ref: any) => {
  const { name, message, label, accepter, error, style, ...rest } = props;
  return (
    <Form.Group controlId={`${name}-10`} ref={ref} className={error ? 'has-error' : ''} style={style}>
      <Form.Control name={name} accepter={accepter} errorMessage={error} {...rest} />
      <Form.HelpText>{message}</Form.HelpText>
    </Form.Group>
  );
});

export default AppField;
