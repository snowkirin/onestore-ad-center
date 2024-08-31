import React, { useEffect, useState } from 'react';
import { loginAsAdvertiser } from '@apis/dashboard.api';
import queryString from 'query-string';
import { Outlet } from 'react-router-dom';
import { getMyInfo } from '@apis/auth.api';

interface CampaignBridgeProps {}

const CampaignBridge: React.FC<CampaignBridgeProps> = () => {
  // const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';
  const URLParams = queryString.parse(location.search);
  const [isFlag, setIsFlag] = useState(false);

  useEffect(() => {
    if (URLParams.id) {
      loginAsAdvertiser(URLParams.id).then((res) => {
        if (res.status === 200) {
          setIsFlag(true);
          if (typeof URLParams.id === 'string' && URLParams.id) {
            localStorage.setItem('selectedAdAccount', URLParams.id);
          }
          getMyInfo().then((res) => {
            if (res.status === 200) {
              if (res.data) {
                Object.keys(res.data).forEach((key) => {
                  sessionStorage.setItem(key, res.data[key]);
                });
                document.location.href = '/campaigns/campaign';
              }
            }
          });
        }
      });
    } else {
      setIsFlag(true);
    }
  }, []);

  return <>{isFlag ? <Outlet /> : ''}</>;
};

export default CampaignBridge;
