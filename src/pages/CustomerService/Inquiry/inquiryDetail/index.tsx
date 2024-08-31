import React, { useMemo } from 'react';
import AppTypography from '@components/AppTypography';
import AppPageHeader from '@components/AppPageHeader';
import AppDiver, { FinalActionDivider } from '@components/AppDivider';
import { useQuery } from '@tanstack/react-query';
import { getInquiryDetail } from '@apis/Inquiry/detail.api';
import { isEmpty } from 'lodash';
import { AppButton } from '@components/AppButton';
import { useNavigate, useParams, useRouteLoaderData } from 'react-router-dom';
import { WISEBIRDS_API } from '@apis/request';
import AppPageFooter from '@components/AppPageFooter';

interface inquiryDetailProps {}

const InquiryDetail: React.FC<inquiryDetailProps> = () => {
  const navigate = useNavigate();

  const adAccountList: any = useRouteLoaderData('layout');
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';

  const { inquiryId: inquiryId } = useParams();

  const fetchInquiryDetail = useQuery(
    ['fetchInquiryDetail', inquiryId],
    async () => {
      const { data } = await getInquiryDetail(inquiryId);
      if (data) {
        return {
          ...data,
          type: data.type || '-',
          title: data.title || '-',
          status: data.status || '-',
          created_at: data.created_at || '-',
          created_by: data.created_by || '-',
          answer: data.answer || '-',
          answer_at: data.answer_at || '-',
          answerer: data.answerer || '-',
          question_attachments:
            data.question_attachments?.map((ele: any) => {
              return { name: ele.file_name, url: ele.file_path, id: ele.id };
            }) || [],
        };
      }
    },
    {
      enabled: !isEmpty(inquiryId),
    }
  );

  const selectedAdAccountTitle = useMemo(() => {
    return adAccountList.find((item: any) => item.id === selectedAdAccount).title;
  }, [selectedAdAccount]);

  return (
    <div>
      <AppPageHeader title={'고객문의 조회'} />
      <div className={'content__inner'}>
        <div style={{ marginBottom: 20 }}>
          <AppTypography.SubTitle level={1}>문의 내용</AppTypography.SubTitle>
        </div>

        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>광고계정</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{selectedAdAccountTitle}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>등록일</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>
              {fetchInquiryDetail.data?.created_at}
              {'　'}
              {fetchInquiryDetail.data?.created_by}
            </AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>문의 유형</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{fetchInquiryDetail.data?.type}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>제목</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{fetchInquiryDetail.data?.title}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>내용</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <div style={{ paddingTop: 6 }}>
              <pre style={{ fontFamily: 'KoPubWorldDotum', margin: 0 }}>{fetchInquiryDetail.data?.content}</pre>
            </div>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>파일 첨부</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            {fetchInquiryDetail.data?.question_attachments?.length === 0 ? (
              <AppTypography.Text className={'text'}>등록된 파일 없음</AppTypography.Text>
            ) : (
              fetchInquiryDetail.data?.question_attachments?.map((ele: any) => {
                return (
                  <div className={'text'} key={ele.id}>
                    <a href={`${WISEBIRDS_API}/v1/questions/file/${ele.id}`} style={{ marginRight: '10px' }}>
                      {ele.name}
                    </a>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <AppDiver />
        <div style={{ marginBottom: 20 }}>
          <AppTypography.SubTitle level={1}>답변 내용</AppTypography.SubTitle>
        </div>

        {fetchInquiryDetail.data?.status === 'CLOSED' ? (
          <>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>등록일</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchInquiryDetail.data?.answer_at}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>내용</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <div style={{ paddingTop: 6 }}>
                  <pre style={{ fontFamily: 'KoPubWorldDotum', margin: 0 }}>{fetchInquiryDetail.data?.answer}</pre>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <AppTypography.SubTitle level={2}>문의 확인 중</AppTypography.SubTitle>
            <AppTypography.Text className={'text'}>문의 하신 내용은 현재 확인 중입니다.</AppTypography.Text>
            <AppTypography.Text className={'text'}>확인 후 답변드리도록 하겠습니다. 감사합니다.</AppTypography.Text>
          </div>
        )}
      </div>

      <FinalActionDivider />
      <AppPageFooter>
        <AppButton size={'lg'} style={{ width: 138 }} onClick={() => navigate('/customer-service/inquiry')}>
          목록
        </AppButton>
      </AppPageFooter>
    </div>
  );
};

export default InquiryDetail;
