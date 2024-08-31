import React from 'react';
import styled from 'styled-components';
import { Table } from 'rsuite';

const StyledAppTable = styled(Table)`
  & {
    border-top: 1px solid var(--guide-line);
    font-size: 11px;
  }
  .rs-table-row-header {
    border-bottom: 1px solid #222;
  }
  .rs-table-cell-header {
    color: #222;
    font-weight: 700;
    font-size: var(--sm-font-size);
    line-height: var(--sm-font-size);
    .rs-table-cell-content {
      line-height: 20px !important;
    }
  }
  .rs-table-scrollbar-handle {
    background-color: var(--primary-color);
  }
  .rs-table-scrollbar {
    opacity: 1;
  }
  .rs-table-body-info {
    top: 20px;
    border-bottom: 1px solid #e2e2e2;
  }
  //.rs-table-loader {
  //  top: 20px;
  //  border-bottom: 1px solid #e2e2e2;
  //  .rs-table-loader-icon {
  //    padding-top: 5px;
  //  }
  //}
`;

export default StyledAppTable;
