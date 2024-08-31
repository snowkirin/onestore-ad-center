import React, { useState } from 'react';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import styled from 'styled-components';
import { AppButton } from '@components/AppButton';
import { deleteCreative, getCreativeDetail, getCreativeList, updateCreative } from '@apis/creative.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ImageTable from '@pages/Campaigns/Creative/List/ImageTable';
import NativeTable from '@pages/Campaigns/Creative/List/NativeTable';
import VideoTable from '@pages/Campaigns/Creative/List/VideoTable';
import { getProductDetail, getProductList } from '@apis/product.api';
import _ from 'lodash';
import AppModal, { ConfirmModal } from '@/components/AppModal';
import Row from '@components/AppGrid/Row';
import Col from '@components/AppGrid/Col';
import AppTypography from '@components/AppTypography';
import PencilIcon from '@assets//images/icons/pencil/pencil-small.svg';
import AppRadioGroup from '@components/AppRadio';
import { CREATIVE_KR_TYPE, creativeNameTypeList } from '../variables';
import { AppInputCount } from '@components/AppInput';
import { StyledContentWrapper } from '@components/Common';
import { useLocation, useNavigate } from 'react-router-dom';
import AppPageHeader from '@components/AppPageHeader';
import AppTabs, { AppTab } from '@components/AppTabs';
import Search from '@components/Search';
import { Whisper } from 'rsuite';
import AppPopover from '@components/AppPopover';
import AppErrorMessage from '@components/AppErrorMessage';
import { sortByCaseInsensitive } from '@utils/functions';

interface CreativeListProps {}

const StyledCreativeList = styled.div``;

const StyledEditCreativeName = styled.div`
  display: flex;
  align-items: center;
`;

/* Style Object */
const ModalStyle = {
  row: {
    marginTop: '15px',
  },
  col: {
    flex: '0 0 100px',
  },
};

const CreativeList: React.FC<CreativeListProps> = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';
  const [selectedProduct, setSelectedProduct] = useState('');
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'IMAGE');

  const [filterParams, setFilterParams] = useState<{
    searchValue: string;
    searchType: string;
  }>({
    searchType: 'title',
    searchValue: '',
  });
  const [tmpSearchValue, setTmpSearchValue] = useState('');
  const [tmpSearchType, setTmpSearchType] = useState('title');

  const [selectedCreativeForDetail, setSelectedCreativeForDetail] = useState<string>('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCreativeIdForDelete, setSelectedCreativeIdForDelete] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [isEditCreativeName, setIsEditCreativeName] = useState(false);
  const [selectedCreativeNameType, setSelectedCreativeNameType] = useState('FILE_NAME'); // 기본값은 file_name
  const [customCreativeName, setCustomCreativeName] = useState('');
  const [selectedCreativeNameForDelete, setSelectedCreativeNameForDelete] = useState('');

  // Product List 가져오기
  const fetchProductList = useQuery(
    ['getProductList', selectedAdAccount],
    async () => {
      const { data } = await getProductList({ ad_account_id: selectedAdAccount });
      if (data.products && data.products.length !== 0) {
        const sortProductsList = sortByCaseInsensitive(data.products, 'title', 'asc');
        setSelectedProduct(sortProductsList[0].id);
        return sortProductsList;
      } else {
        setSelectedProduct('');
        return [];
      }
    },
    {
      enabled: !_.isEmpty(selectedAdAccount),
    }
  );
  // Creative List 가져오기
  const fetchCreativeList = useQuery(
    ['getCreativeList', selectedProduct],
    async () => {
      // 소재리스트 호출
      const { data } = await getCreativeList({ ad_account_id: selectedAdAccount, product_id: selectedProduct });
      // 정상적으로 호출 되었다면
      if (data.creatives && data.creatives.length !== 0) {
        return data.creatives.reduce((result: any, value: any) => {
          (result[value.type] || (result[value.type] = [])).push(value);
          return result;
        }, {});
      } else {
        return {
          IMAGE: [],
          NATIVE: [],
          VIDEO: [],
        };
      }
    },
    {
      enabled: !_.isEmpty(selectedAdAccount) && !_.isEmpty(selectedProduct),
      onError: (err: any) => {
        alert(err.response.data.message);
      },
    }
  );

  // 소재 자세히 보기
  const { data: creativeDetail } = useQuery(
    ['getCreativeDetail', selectedCreativeForDetail],
    async () => {
      const response = await getCreativeDetail(selectedCreativeForDetail);
      if (response.status === 200) {
        setDetailModalOpen(true);
        setCustomCreativeName(response.data.creative.title);
        return response.data;
      }
    },
    {
      enabled: !_.isEmpty(selectedCreativeForDetail),
    }
  );

  const { data: productDetail } = useQuery(
    [' getProductDetail', selectedProduct],
    async () => {
      const { data: productData } = await getProductDetail(selectedProduct);
      return productData;
    },
    {
      enabled: !_.isEmpty(selectedAdAccount) && !_.isEmpty(selectedProduct),
      onError: (err: any) => {
        alert(err.response.data.message);
      },
    }
  );

  // 소재 삭제 Mutation
  const deleteCreativeMutation = useMutation(deleteCreative, {
    onSuccess: async () => {
      await queryClient.invalidateQueries(['getCreativeList']);
      await onDeleteCreativeModalClose();
    },
  });

  // 소재 업데이트

  const updateCreativeMutation = useMutation(updateCreative, {
    onSuccess: async () => {
      await queryClient.invalidateQueries(['getCreativeList']);
      await queryClient.invalidateQueries(['getCreativeDetail']);
      onToggleEditCreativeName();
    },
  });

  // 필터 (검색) 적용
  const handleFilterParamsApply = () => {
    setFilterParams((prevState) => ({
      ...prevState,
      searchType: tmpSearchType,
      searchValue: tmpSearchValue,
    }));
  };

  // 탭 변경
  const handleTabChange = (eventKey: string) => {
    if (activeTab !== eventKey) {
      // 검색 조건 초기화
      setFilterParams({
        searchType: 'title',
        searchValue: '',
      });
      setTmpSearchType('title');
      setTmpSearchValue('');
      setActiveTab(eventKey);
    }
  };

  // 소재 자세히 보기
  const onClickCreativeDetail = async (creativeId: string) => {
    setSelectedCreativeForDetail(creativeId);
  };

  /* 소재 삭제 함수 */
  // 소재 삭제 팝업 열기
  const onDeleteCreativeModalOpen = (id: string, title: string) => {
    setSelectedCreativeIdForDelete(id);
    setSelectedCreativeNameForDelete(title);
    setDeleteModalOpen(true);
  };
  // 소재 삭제 팝업 닫기
  const onDeleteCreativeModalClose = () => {
    setSelectedCreativeIdForDelete('');
    setDeleteModalOpen(false);
  };
  // 소재 삭제하기

  const onDeleteCreativeAction = async () => {
    await deleteCreativeMutation.mutate(selectedCreativeIdForDelete);
  };

  // 소재 업데이트
  const onUpdateCreative = async ({ creativeID, payload }: { creativeID: string; payload: any }) => {
    await updateCreativeMutation.mutate({ creativeID, payload });
  };

  // 소재명 변경 모드 Toggle
  const onToggleEditCreativeName = () => {
    setSelectedCreativeNameType('FILE_NAME');
    setIsEditCreativeName(!isEditCreativeName);
    setCustomCreativeName(creativeDetail?.creative.title);
  };

  // 모달 닫기
  const handleModalClose = () => {
    setIsEditCreativeName(false);
    setSelectedCreativeNameType('FILE_NAME');
    setSelectedCreativeForDetail('');
    setDetailModalOpen(false);
  };

  // 생성 페이지 이동
  const onClickCreateCreative = () => {
    navigate(`create/${activeTab.toLowerCase()}/${selectedProduct}`);
  };

  return (
    <StyledCreativeList>
      <AppPageHeader
        title={'소재'}
        extra={
          <AppSelectPicker
            cleanable={false}
            searchable={false}
            style={{ width: '200px' }}
            data={fetchProductList.data}
            value={selectedProduct}
            labelKey={'title'}
            valueKey={'id'}
            onChange={(value) => {
              setSelectedProduct(
                _.find(fetchProductList.data, (item) => {
                  return item.id === value;
                })?.id
              );
            }}
          />
        }
      />

      {/* 탭 영역 */}
      <div style={{ position: 'relative' }}>
        <AppTabs activeKey={activeTab} appearance="subtle" onSelect={(value) => handleTabChange(value)}>
          <AppTab eventKey={'IMAGE'}>이미지</AppTab>
          <AppTab eventKey={'NATIVE'}>네이티브</AppTab>
          <AppTab eventKey={'VIDEO'}>동영상</AppTab>
        </AppTabs>

        <div style={{ position: 'absolute', right: 30, top: 0, display: 'flex', alignItems: 'center' }}>
          <Search
            data={[{ value: 'title', label: '소재명' }]}
            maxLength={255}
            searchKey={tmpSearchType}
            onSearchKeyChange={(value) => setTmpSearchType(value)}
            searchValue={tmpSearchValue}
            onSearchValueChange={(value) => setTmpSearchValue(value)}
            onSearch={handleFilterParamsApply}
          />
        </div>
      </div>

      <div
        style={{
          padding: '14px 30px',
        }}
      >
        {!selectedProduct ? (
          <Whisper
            trigger="hover"
            placement="bottomStart"
            enterable
            speaker={<AppPopover theme={'white'}>{`자산 > 앱 메뉴에서 앱을 생성하세요.`}</AppPopover>}
          >
            <span style={{ display: 'inline-block' }}>
              <AppButton theme={'create'} size="md" style={{ width: 80, pointerEvents: 'none' }} disabled>
                생성
              </AppButton>
            </span>
          </Whisper>
        ) : (
          <AppButton theme={'create'} size="md" onClick={onClickCreateCreative} style={{ width: 80 }}>
            생성
          </AppButton>
        )}
        <span style={{ fontSize: '12px', color: '#ff7c2d', marginLeft: 15 }}>
          ※소재 생성 후 소재그룹에서 생성한 소재를 추가하세요.
        </span>
      </div>
      {/* 테이블 영역*/}
      <div>
        {activeTab === 'IMAGE' && (
          <ImageTable
            data={fetchCreativeList.data?.IMAGE?.filter((item: any) =>
              filterParams.searchValue
                ? item[filterParams.searchType]?.toUpperCase().includes(filterParams.searchValue.toUpperCase())
                : true
            )}
            onDelete={onDeleteCreativeModalOpen}
            onDetail={onClickCreativeDetail}
            loading={fetchCreativeList.isFetching}
          />
        )}
        {activeTab === 'NATIVE' && (
          <NativeTable
            data={fetchCreativeList.data?.NATIVE?.filter((item: any) =>
              filterParams.searchValue
                ? item[filterParams.searchType]?.toUpperCase().includes(filterParams.searchValue.toUpperCase())
                : true
            )}
            onDelete={onDeleteCreativeModalOpen}
            onDetail={onClickCreativeDetail}
            loading={fetchCreativeList.isFetching}
          />
        )}

        {activeTab === 'VIDEO' && (
          <VideoTable
            data={fetchCreativeList.data?.VIDEO?.filter((item: any) =>
              filterParams.searchValue
                ? item[filterParams.searchType]?.toUpperCase().includes(filterParams.searchValue.toUpperCase())
                : true
            )}
            onDelete={onDeleteCreativeModalOpen}
            onDetail={onClickCreativeDetail}
            loading={fetchCreativeList.isFetching}
          />
        )}
      </div>

      {/* 소재 삭제 모달창 */}
      <ConfirmModal
        open={deleteModalOpen}
        onClose={onDeleteCreativeModalClose}
        title={'소재 삭제'}
        onOk={onDeleteCreativeAction}
        content={
          <>
            삭제한 소재는 복구할 수 없으며 소재 화면에 노출되지 않습니다.
            <br />
            또한, 운영중인 캠페인에 적용된 소재일 경우 더이상 노출되지 않습니다.
            <br />
            {selectedCreativeNameForDelete}을 삭제하시겠습니까?
          </>
        }
      />

      {/* 소재 조회 모달창 */}
      <AppModal open={detailModalOpen} onClose={handleModalClose} size={'lg'} role={'dialog'}>
        <AppModal.Header>
          <AppModal.Title>소재 조회</AppModal.Title>
        </AppModal.Header>
        <AppModal.Body>
          <Row>
            <Col isLabel>
              <AppTypography.Label>앱이름</AppTypography.Label>
            </Col>
            <Col>
              <AppTypography.Text>{productDetail?.product.title}</AppTypography.Text>
            </Col>
          </Row>
          <Row>
            <Col isLabel>
              <AppTypography.Label>소재 유형</AppTypography.Label>
            </Col>
            <Col>{CREATIVE_KR_TYPE[creativeDetail?.creative.type.toLowerCase()]}</Col>
          </Row>
          <Row>
            <Col isLabel>
              <AppTypography.Label>소재 ID</AppTypography.Label>
            </Col>
            <Col>{creativeDetail?.creative.id}</Col>
          </Row>
          <Row>
            <Col isLabel>
              <AppTypography.Label>소재명</AppTypography.Label>
            </Col>
            <Col>
              <AppTypography.Text>
                {creativeDetail?.creative.title}{' '}
                <img
                  src={PencilIcon}
                  style={{ verticalAlign: 'middle', cursor: 'pointer' }}
                  alt={'Edit'}
                  onClick={onToggleEditCreativeName}
                />
              </AppTypography.Text>
              {isEditCreativeName && (
                <div>
                  <div>
                    <AppRadioGroup
                      inline
                      data={creativeNameTypeList}
                      value={selectedCreativeNameType}
                      onChange={(v) => {
                        setSelectedCreativeNameType(v);
                        setCustomCreativeName(creativeDetail?.creative.title);
                      }}
                    />
                  </div>
                  <StyledEditCreativeName>
                    {selectedCreativeNameType === 'CUSTOM' && (
                      <AppInputCount
                        maxLength={255}
                        className={customCreativeName === '' ? 'input-error' : ''}
                        style={{ width: 250, marginRight: 5 }}
                        value={customCreativeName}
                        onChange={(value) => setCustomCreativeName(value)}
                      />
                    )}
                    <AppButton
                      type={'submit'}
                      size={'md'}
                      theme={'red'}
                      style={{ marginRight: 5 }}
                      loading={updateCreativeMutation.isLoading}
                      onClick={() => {
                        if (customCreativeName === '') return;
                        onUpdateCreative({
                          creativeID: creativeDetail?.creative.id,
                          payload: {
                            ...creativeDetail?.creative,
                            title:
                              selectedCreativeNameType === 'FILE_NAME'
                                ? creativeDetail.creative.original_filename
                                : customCreativeName,
                          },
                        });
                      }}
                    >
                      수정
                    </AppButton>
                    <AppButton type={'reset'} size={'md'} theme={'white_red'} onClick={onToggleEditCreativeName}>
                      취소
                    </AppButton>
                  </StyledEditCreativeName>
                  {customCreativeName === '' && <AppErrorMessage>소재명을 입력하세요.</AppErrorMessage>}
                </div>
              )}
            </Col>
          </Row>
          <Row>
            <Col isLabel>
              <AppTypography.Label>소재 스펙</AppTypography.Label>
            </Col>
            <Col>
              {creativeDetail?.creative.type === 'IMAGE' && (
                <div>
                  <AppTypography.Label>이미지</AppTypography.Label>
                  <div style={{ marginTop: 10 }}>
                    <StyledContentWrapper>
                      <img src={creativeDetail?.creative.image.image_url} alt="" style={{ height: '60px' }} />
                    </StyledContentWrapper>
                  </div>
                </div>
              )}
              {creativeDetail?.creative.type === 'NATIVE' && (
                <div>
                  <Row>
                    <Col style={ModalStyle.col}>
                      <AppTypography.Label>네이티브 유형</AppTypography.Label>
                    </Col>
                    <Col>
                      <AppTypography.Text>
                        {creativeDetail?.creative.native.video ? '동영상' : '이미지'}
                      </AppTypography.Text>
                    </Col>
                  </Row>
                  <Row style={ModalStyle.row}>
                    <Col style={ModalStyle.col}>
                      <AppTypography.Label>앱 이름</AppTypography.Label>
                    </Col>
                    <Col>
                      <AppTypography.Text>{creativeDetail?.creative.native.title}</AppTypography.Text>
                    </Col>
                  </Row>
                  <Row style={ModalStyle.row}>
                    <Col style={ModalStyle.col}>
                      <AppTypography.Label>설명</AppTypography.Label>
                    </Col>
                    <Col>
                      <AppTypography.Text>{creativeDetail?.creative.native.text}</AppTypography.Text>
                    </Col>
                  </Row>
                  <Row style={ModalStyle.row}>
                    <Col style={ModalStyle.col}>
                      <AppTypography.Label>CTA</AppTypography.Label>
                    </Col>
                    <Col>
                      <AppTypography.Text>{creativeDetail?.creative.native.cta_text}</AppTypography.Text>
                    </Col>
                  </Row>
                  <Row style={ModalStyle.row}>
                    <Col style={ModalStyle.col}>
                      <AppTypography.Label>아이콘</AppTypography.Label>
                    </Col>
                    <Col>
                      <StyledContentWrapper>
                        <img
                          src={creativeDetail?.creative.native.icon_image.image_url}
                          alt=""
                          style={{ height: '60px' }}
                        />
                      </StyledContentWrapper>
                    </Col>
                  </Row>
                  {creativeDetail?.creative.native.video && (
                    <Row style={ModalStyle.row}>
                      <Col style={ModalStyle.col}>
                        <AppTypography.Label>동영상</AppTypography.Label>
                      </Col>
                      <Col>
                        <StyledContentWrapper>
                          <video style={{ height: '144px' }} controls>
                            <source src={creativeDetail?.creative.native.video.video_url} type={'video/mp4'} />
                          </video>
                        </StyledContentWrapper>
                      </Col>
                    </Row>
                  )}
                  <Row style={ModalStyle.row}>
                    <Col style={ModalStyle.col}>
                      <AppTypography.Label>
                        {creativeDetail?.creative.native.video ? '종료 배너' : '이미지'}
                      </AppTypography.Label>
                    </Col>
                    <Col>
                      <StyledContentWrapper>
                        <img
                          src={creativeDetail?.creative.native.main_image.image_url}
                          alt=""
                          style={{ height: '60px' }}
                        />
                      </StyledContentWrapper>
                    </Col>
                  </Row>
                </div>
              )}
              {creativeDetail?.creative.type === 'VIDEO' && (
                <div>
                  <Row>
                    <Col style={ModalStyle.col}>
                      <AppTypography.Label>동영상</AppTypography.Label>
                    </Col>
                    <Col>
                      <StyledContentWrapper>
                        <video style={{ height: '144px' }} controls>
                          <source src={creativeDetail?.creative.video.video_url} type={'video/mp4'} />
                        </video>
                      </StyledContentWrapper>
                    </Col>
                  </Row>
                  <Row style={ModalStyle.row}>
                    <Col style={ModalStyle.col}>
                      <AppTypography.Label>종료 배너</AppTypography.Label>
                    </Col>
                    <Col>
                      <StyledContentWrapper>
                        <img
                          src={creativeDetail?.creative.video.companion_images[0].image_url}
                          alt={''}
                          style={{ height: '85px' }}
                        />
                      </StyledContentWrapper>
                    </Col>
                  </Row>
                </div>
              )}
            </Col>
          </Row>
        </AppModal.Body>
        <AppModal.Footer>
          <AppButton
            size={'md'}
            type={'button'}
            theme={'white_gray'}
            style={{ padding: '0 20px' }}
            onClick={handleModalClose}
          >
            닫기
          </AppButton>
        </AppModal.Footer>
      </AppModal>
    </StyledCreativeList>
  );
};

export default CreativeList;
