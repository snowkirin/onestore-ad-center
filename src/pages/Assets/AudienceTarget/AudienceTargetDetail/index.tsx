import React, { useEffect, useMemo, useState } from 'react';
import AppPageHeader from '@components/AppPageHeader';
import AppTypography from '@components/AppTypography';
import AppDivider, { FinalActionDivider } from '@/components/AppDivider';
import _ from 'lodash';
import { StyledDescription, StyledItems } from '@pages/Assets/AudienceTarget/AudienceTargetDetail/StyledComp';
import { AppButton } from '@components/AppButton';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams, useRouteLoaderData } from 'react-router-dom';
import { deleteAudienceTarget, getAudienceTargetDetail } from '@apis/audience_target.api';
import { API_GRAPHQL } from '@apis/request';
import JSON_LANGUAGE from '@utils/json/language.json';
import AppPageFooter from '@components/AppPageFooter';
import { ConfirmModal } from '@components/AppModal';
import { StyledAudienceTarget } from '@pages/Assets/AudienceTarget/AudienceTargetComponent';
import { getCustomerFile } from '@apis/customer_file.api';

interface AudienceTargetDetailProps {}

const AudienceTargetDetail: React.FC<AudienceTargetDetailProps> = () => {
  const { audienceTargetId: audience_target_id } = useParams();
  const adAccountList: any = useRouteLoaderData('layout');
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';
  const navigate = useNavigate();

  const [isExistCustomAudience, setIsExistCustomAudience] = useState(false);
  const [isExistInclude, setIsExistInclude] = useState(false);
  const [isExistExclude, setIsExistExclude] = useState(false);
  const [isExistLanguage, setIsExistLanguage] = useState(false);
  const [isExistLocation, setIsExistLocation] = useState(false);
  const [isExistDevice, setIsExistDevice] = useState(false);

  const [locationList, setLocationList] = useState([]);
  const [locationListResult, setLocationListResult] = useState([]);

  const [isOpenModal, setIsOpenModal] = useState(false);

  const fetchAudienceTargetDetail = useQuery(
    ['fetchAudienceTargetDetail'],
    async () => {
      const { data } = await getAudienceTargetDetail({
        audience_target_id: audience_target_id || '',
        queryParams: {
          ad_account_id: selectedAdAccount,
          inquiry_option: 'INQUIRY_OVERVIEW',
        },
      });

      const targetingCondition = data.audience_target_overview.audience_target.targeting_condition;
      const checkExistCustomAudience = !!targetingCondition.custom_audience_set;

      setIsExistCustomAudience(checkExistCustomAudience);
      setIsExistInclude(
        !_.isEmpty(targetingCondition.custom_audience_set?.include_having_all) ||
          !_.isEmpty(targetingCondition.custom_audience_set?.include_having_any)
      );
      setIsExistExclude(
        !_.isEmpty(targetingCondition.custom_audience_set?.exclude_having_all) ||
          !_.isEmpty(targetingCondition.custom_audience_set?.exclude_having_any)
      );
      setIsExistLanguage(
        !_.isEmpty(targetingCondition.allowed_languages) || !_.isEmpty(targetingCondition.blocked_languages)
      );
      setIsExistLocation(!_.isEmpty(targetingCondition.allowed_location_set));
      setIsExistDevice(!_.isEmpty(targetingCondition.device_oses) || !_.isEmpty(targetingCondition.connection_types));

      // 오디언스 데이터 가공
      const location: any = _.pick(targetingCondition, ['allowed_location_set']);
      if (!_.isEmpty(location)) {
        setLocationList(location.allowed_location_set.osm_ids);
      }
      return data.audience_target_overview;
    },
    {
      enabled: !_.isEmpty(audience_target_id) && !_.isEmpty(selectedAdAccount),
    }
  );

  // Customer Set
  const fetchCustomerSetList = useQuery(
    ['fetchCustomerSetList'],
    async () => {
      const { data } = await getCustomerFile({ ad_account_id: selectedAdAccount });
      if (data.customer_sets && data.customer_sets.length !== 0) {
        return data.customer_sets;
      } else {
        return [];
      }
    },
    {
      enabled: !_.isEmpty(selectedAdAccount),
      initialData: [],
    }
  );

  const handleModalOpen = () => {
    setIsOpenModal(true);
  };
  const handleModalClose = () => {
    setIsOpenModal(false);
  };
  const handleModalOk = () => {
    deleteAudienceTarget({
      pathParams: {
        audience_target_id: audience_target_id || '',
      },
      queryParams: {
        ad_account_id: selectedAdAccount,
      },
    })
      .then(() => {
        navigate('/assets/audience-target');
      })
      .catch((err) => {
        alert(err.response.data.message);
      });
  };

  useEffect(() => {
    if (locationList.length > 0) {
      API_GRAPHQL.post('', {
        query:
          '\n  query LocationsByCountry($request: LocationsByCountryRequest!) {\n    locationsByCountry(request: $request) {\n      locationsByCountry {\n        locationCode\n        locationName\n        children {\n          locationCode\n          locationName\n          division\n        }\n      }\n    }\n  }\n',
        variables: {
          request: {
            locationCodes: locationList,
          },
        },
      }).then((res) => {
        setLocationListResult(res.data.data.locationsByCountry.locationsByCountry);
      });
    }
  }, [locationList]);

  const selectedAdAccountTitle = useMemo(() => {
    return adAccountList.find((item: any) => item.id === selectedAdAccount).title;
  }, [selectedAdAccount]);

  return (
    <StyledAudienceTarget>
      <AppPageHeader title={'맞춤 타겟 조회'} />
      <div style={{ padding: '16px 30px 0 30px' }}>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'} isRequired>
              광고계정명
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{selectedAdAccountTitle}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'} isRequired>
              맞춤 타겟 ID
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>
              {fetchAudienceTargetDetail.data?.audience_target.id}
            </AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'} isRequired>
              맞춤 타겟명
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>
              {fetchAudienceTargetDetail.data?.audience_target.title}
            </AppTypography.Text>
          </div>
        </div>
        {(isExistCustomAudience || isExistDevice) && <AppDivider />}

        {isExistCustomAudience && (isExistInclude || isExistExclude || isExistLanguage || isExistLocation) && (
          <>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>오디언스</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                {(isExistInclude || isExistExclude) && (
                  <div className={'inner'}>
                    <div className={'inner__title'}>
                      <AppTypography.Label className={'text'}>커스텀 오디언스</AppTypography.Label>
                    </div>
                    <div className={'inner__content'}>
                      <StyledItems>
                        {/* 포함 */}
                        {isExistInclude && (
                          <>
                            {/* All*/}
                            {!_.isEmpty(
                              fetchAudienceTargetDetail.data?.audience_target.targeting_condition.custom_audience_set
                                .include_having_all
                            ) && (
                              <div className={'item'}>
                                <AppTypography.Label>포함, 둘 다 만족</AppTypography.Label>
                                {fetchAudienceTargetDetail.data?.audience_target.targeting_condition.custom_audience_set
                                  .include_having_all.app_events && (
                                  <StyledDescription>
                                    <div className="title">
                                      <AppTypography.Label>앱/앱 이벤트</AppTypography.Label>
                                    </div>
                                    <div className="desc">
                                      {fetchAudienceTargetDetail.data?.audience_target.targeting_condition.custom_audience_set.include_having_all.app_events.map(
                                        (item: any, idx: number) => {
                                          return (
                                            <AppTypography.Text key={idx}>
                                              - {item.product_id} / {item.event} / {item.sliding_window_duration.amount}
                                              일 이내
                                            </AppTypography.Text>
                                          );
                                        }
                                      )}
                                    </div>
                                  </StyledDescription>
                                )}
                                {fetchAudienceTargetDetail.data?.audience_target.targeting_condition.custom_audience_set
                                  .include_having_all.user_lists && (
                                  <StyledDescription>
                                    <div className="title">
                                      <AppTypography.Label>고객 파일</AppTypography.Label>
                                    </div>
                                    <div className="desc">
                                      {fetchAudienceTargetDetail.data?.audience_target.targeting_condition.custom_audience_set.include_having_all.user_lists.map(
                                        (item: any, idx: number) => {
                                          return (
                                            <AppTypography.Text key={idx}>
                                              -{' '}
                                              {_.find(fetchCustomerSetList.data, (obj) => {
                                                return obj.id === item;
                                              }).title || ''}
                                            </AppTypography.Text>
                                          );
                                        }
                                      )}
                                    </div>
                                  </StyledDescription>
                                )}
                              </div>
                            )}
                            {/* Any*/}
                            {!_.isEmpty(
                              fetchAudienceTargetDetail.data?.audience_target.targeting_condition.custom_audience_set
                                .include_having_any
                            ) && (
                              <div className={'item'}>
                                <AppTypography.Label>포함, 둘 중 하나라도 만족</AppTypography.Label>
                                {fetchAudienceTargetDetail.data?.audience_target.targeting_condition.custom_audience_set
                                  .include_having_any.app_events && (
                                  <StyledDescription>
                                    <div className="title">
                                      <AppTypography.Label>앱/앱 이벤트</AppTypography.Label>
                                    </div>
                                    <div className="desc">
                                      {fetchAudienceTargetDetail.data?.audience_target.targeting_condition.custom_audience_set.include_having_any.app_events.map(
                                        (item: any, idx: number) => {
                                          return (
                                            <AppTypography.Text key={idx}>
                                              - {item.product_id} / {item.event} / {item.sliding_window_duration.amount}
                                              일 이내
                                            </AppTypography.Text>
                                          );
                                        }
                                      )}
                                    </div>
                                  </StyledDescription>
                                )}
                                {fetchAudienceTargetDetail.data?.audience_target.targeting_condition.custom_audience_set
                                  .include_having_any.user_lists && (
                                  <StyledDescription>
                                    <div className="title">
                                      <AppTypography.Label>고객 파일</AppTypography.Label>
                                    </div>
                                    <div className="desc">
                                      {fetchAudienceTargetDetail.data?.audience_target.targeting_condition.custom_audience_set.include_having_any.user_lists.map(
                                        (item: any, idx: number) => {
                                          return (
                                            <AppTypography.Text key={idx}>
                                              -{' '}
                                              {_.find(fetchCustomerSetList.data, (obj) => {
                                                return obj.id === item;
                                              }).title || ''}
                                            </AppTypography.Text>
                                          );
                                        }
                                      )}
                                    </div>
                                  </StyledDescription>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {/* 제외 */}

                        {isExistExclude && (
                          <>
                            {/* All*/}
                            {!_.isEmpty(
                              fetchAudienceTargetDetail.data?.audience_target.targeting_condition.custom_audience_set
                                .exclude_having_all
                            ) && (
                              <div className={'item'}>
                                <AppTypography.Label>제외, 둘 다 만족</AppTypography.Label>
                                {fetchAudienceTargetDetail.data?.audience_target.targeting_condition.custom_audience_set
                                  .exclude_having_all.app_events && (
                                  <StyledDescription>
                                    <div className="title">
                                      <AppTypography.Label>앱/앱 이벤트</AppTypography.Label>
                                    </div>
                                    <div className="desc">
                                      {fetchAudienceTargetDetail.data?.audience_target.targeting_condition.custom_audience_set.exclude_having_all.app_events.map(
                                        (item: any, idx: number) => {
                                          return (
                                            <AppTypography.Text key={idx}>
                                              - {item.product_id} / {item.event} / {item.sliding_window_duration.amount}
                                              일 이내
                                            </AppTypography.Text>
                                          );
                                        }
                                      )}
                                    </div>
                                  </StyledDescription>
                                )}
                                {fetchAudienceTargetDetail.data?.audience_target.targeting_condition.custom_audience_set
                                  .exclude_having_all.user_lists && (
                                  <StyledDescription>
                                    <div className="title">
                                      <AppTypography.Label>고객 파일</AppTypography.Label>
                                    </div>
                                    <div className="desc">
                                      {fetchAudienceTargetDetail.data?.audience_target.targeting_condition.custom_audience_set.exclude_having_all.user_lists.map(
                                        (item: any, idx: number) => {
                                          return <AppTypography.Text key={idx}>- {item}</AppTypography.Text>;
                                        }
                                      )}
                                    </div>
                                  </StyledDescription>
                                )}
                              </div>
                            )}
                            {/* Any*/}
                            {!_.isEmpty(
                              fetchAudienceTargetDetail.data?.audience_target.targeting_condition.custom_audience_set
                                .exclude_having_any
                            ) && (
                              <div className={'item'}>
                                <AppTypography.Label>제외, 둘 중 하나라도 만족</AppTypography.Label>
                                {fetchAudienceTargetDetail.data?.audience_target.targeting_condition.custom_audience_set
                                  .exclude_having_any.app_events && (
                                  <StyledDescription>
                                    <div className="title">
                                      <AppTypography.Label>앱/앱 이벤트</AppTypography.Label>
                                    </div>
                                    <div className="desc">
                                      {fetchAudienceTargetDetail.data?.audience_target.targeting_condition.custom_audience_set.exclude_having_any.app_events.map(
                                        (item: any, idx: number) => {
                                          return (
                                            <AppTypography.Text key={idx}>
                                              - {item.product_id} / {item.event} / {item.sliding_window_duration.amount}
                                              일 이내
                                            </AppTypography.Text>
                                          );
                                        }
                                      )}
                                    </div>
                                  </StyledDescription>
                                )}
                                {fetchAudienceTargetDetail.data?.audience_target.targeting_condition.custom_audience_set
                                  .exclude_having_any.user_lists && (
                                  <StyledDescription>
                                    <div className="title">
                                      <AppTypography.Label>고객 파일</AppTypography.Label>
                                    </div>
                                    <div className="desc">
                                      {fetchAudienceTargetDetail.data?.audience_target.targeting_condition.custom_audience_set.exclude_having_any.user_lists.map(
                                        (item: any, idx: number) => {
                                          return <AppTypography.Text key={idx}>- {item}</AppTypography.Text>;
                                        }
                                      )}
                                    </div>
                                  </StyledDescription>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </StyledItems>
                    </div>
                  </div>
                )}

                {isExistLanguage && (
                  <div className={'inner'}>
                    <div className={'inner__title'}>
                      <AppTypography.Label className={'text'}>언어</AppTypography.Label>
                    </div>
                    <div className={'inner__content'}>
                      <StyledItems>
                        <div className={'item'}>
                          {!_.isEmpty(
                            fetchAudienceTargetDetail.data?.audience_target.targeting_condition.allowed_languages
                          ) && (
                            <StyledDescription inline style={{ marginBottom: 20 }}>
                              <div className="title">
                                <AppTypography.Label>포함</AppTypography.Label>
                              </div>
                              <div className="desc">
                                {fetchAudienceTargetDetail.data?.audience_target.targeting_condition.allowed_languages.map(
                                  (item: any, idx: number) => {
                                    return `${idx !== 0 ? ', ' : ''}${_.find(JSON_LANGUAGE, { value: item })?.label}`;
                                  }
                                )}
                              </div>
                            </StyledDescription>
                          )}
                          {!_.isEmpty(
                            fetchAudienceTargetDetail.data?.audience_target.targeting_condition.blocked_languages
                          ) && (
                            <StyledDescription inline>
                              <div className="title">
                                <AppTypography.Label>제외</AppTypography.Label>
                              </div>
                              <div className="desc">
                                {fetchAudienceTargetDetail.data?.audience_target.targeting_condition.blocked_languages.map(
                                  (item: any, idx: number) => {
                                    return `${idx !== 0 ? ', ' : ''}${_.find(JSON_LANGUAGE, { value: item })?.label}`;
                                  }
                                )}
                              </div>
                            </StyledDescription>
                          )}
                        </div>
                      </StyledItems>
                    </div>
                  </div>
                )}
                {isExistLocation && (
                  <div className={'inner'}>
                    <div className={'inner__title'}>
                      <AppTypography.Label className={'text'}>위치</AppTypography.Label>
                    </div>
                    <div className={'inner__content'}>
                      <StyledItems>
                        <div className={'item'}>
                          {locationListResult.map((ele: any, eleIdx: number) => {
                            return (
                              <StyledDescription inline key={eleIdx}>
                                <div className="desc">
                                  {ele.children.map((child: any, childIdx: number) => {
                                    return `${childIdx !== 0 ? ', ' : ''}${child.locationName}`;
                                  })}
                                </div>
                              </StyledDescription>
                            );
                          })}
                        </div>
                      </StyledItems>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isExistDevice && <AppDivider />}
          </>
        )}

        {isExistDevice && (
          <>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>디바이스</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                {!_.isEmpty(fetchAudienceTargetDetail.data?.audience_target.targeting_condition.device_oses) && (
                  <div className={'inner'}>
                    <div className={'inner__title'}>
                      <AppTypography.Label className={'text'}>OS 및 OS버전</AppTypography.Label>
                    </div>
                    <div className={'inner__content'}>
                      <StyledItems>
                        <div className={'item'}>
                          {fetchAudienceTargetDetail.data?.audience_target.targeting_condition.device_oses.map(
                            (ele: any, idx: number) => {
                              return (
                                <StyledDescription inline style={{ marginTop: idx !== 0 ? '10px' : '0' }} key={idx}>
                                  <div className="title">
                                    <AppTypography.Label>
                                      {ele.os === 'ANDROID' ? 'Android' : 'iOS'}
                                    </AppTypography.Label>
                                  </div>
                                  <div className="desc">
                                    {!ele.min_version && !ele.max_version
                                      ? '전체 버전'
                                      : ele.min_version
                                      ? `${ele.min_version} ~ ${ele.max_version || '최신 버전'}`
                                      : `~ ${ele.max_version}`}
                                  </div>
                                </StyledDescription>
                              );
                            }
                          )}
                        </div>
                      </StyledItems>
                    </div>
                  </div>
                )}
                {!_.isEmpty(fetchAudienceTargetDetail.data?.audience_target.targeting_condition.connection_types) && (
                  <div className={'inner'}>
                    <div className={'inner__title'}>
                      <AppTypography.Label className={'text'}>네트워크</AppTypography.Label>
                    </div>
                    <div className={'inner__content'}>
                      <StyledItems>
                        <div className={'item'}>
                          <StyledDescription inline>
                            <div className="desc">와이파이만 포함</div>
                          </StyledDescription>
                        </div>
                      </StyledItems>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <FinalActionDivider />
      <AppPageFooter
        extra={
          <AppButton
            size={'lg'}
            style={{ width: 70 }}
            theme={'white_gray'}
            onClick={handleModalOpen}
            disabled={!!fetchAudienceTargetDetail.data?.audience_target_referrer_infos}
          >
            삭제
          </AppButton>
        }
      >
        <AppButton size={'lg'} style={{ width: 138 }} onClick={() => navigate('/assets/audience-target')}>
          목록
        </AppButton>
        <AppButton
          size={'lg'}
          theme={'red'}
          style={{ width: 138, marginLeft: 15 }}
          onClick={() => navigate(`/assets/audience-target/edit/${audience_target_id}`)}
        >
          수정
        </AppButton>
      </AppPageFooter>

      <ConfirmModal
        open={isOpenModal}
        onClose={handleModalClose}
        title={'맞춤 타겟 삭제'}
        onOk={handleModalOk}
        content={
          <>
            삭제한 맞춤 타겟은 복구할 수 없으며,
            <br />
            맞춤 타겟 화면에 노출되지 않습니다.
            <br />
            {fetchAudienceTargetDetail.data?.audience_target.title}을 삭제하시겠습니까?
          </>
        }
      />
    </StyledAudienceTarget>
  );
};

export default AudienceTargetDetail;
