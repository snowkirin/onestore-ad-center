import React, { useState } from 'react';
import AppTypography from '@components/AppTypography';
import AppPageHeader from '@components/AppPageHeader';
import AppDiver, { FinalActionDivider } from '@components/AppDivider';
import { useQuery } from '@tanstack/react-query';
import { getInquiryDetail } from '@apis/Inquiry/detail.api';
import { isEmpty } from 'lodash';
import { AppButton } from '@components/AppButton';
import { useNavigate, useParams } from 'react-router-dom';
import AppRadioGroup from '@components/AppRadio';
import AppInputTextArea from '@components/AppInput/AppInputTextArea';
import { createInquiryAnswer } from '@apis/Inquiry/admin.api';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import { WISEBIRDS_API } from '@apis/request';
import AppPageFooter from '@components/AppPageFooter';

interface AdminCustomerServiceInquiryDetailProps {}

const ColWidth = {
  three: '200px',
  two: '360px',
  one: '860px',
};

const AdminCustomerServiceInquiryDetail: React.FC<AdminCustomerServiceInquiryDetailProps> = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<any>([]);
  const [answer, setAnswer] = useState<string>('');
  const [status, setStatus] = useState('IN_REVIEW');

  const { inquiryId: inquiryId } = useParams();

  const {
    handleSubmit: AD_INQ_handleSubmit,
    control: AD_INQ_control,
    setValue: AD_INQ_setValue,
    getValues: AD_INQ_getValue,
    formState: { errors: AD_INQ_errors },
  } = useForm();

  const fetchInquiryDetail = useQuery(
    ['fetchInquiryDetail', inquiryId],
    async () => {
      const { data } = await getInquiryDetail(inquiryId);
      if (data) {
        return {
          ...data,
          advertiser_name: data.advertiser_name || '-',
          ad_account_name: data.ad_account_name || '-',
          type: data.type || '-',
          title: data.title || '-',
          status: data.status || '-',
          created_at: data.created_at || '-',
          created_by: data.created_by || '-',
          answer: data.answer || '',
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
      onSuccess: (data) => {
        setData(data);
        if (data.status === 'WAITING') {
          setStatus('IN_REVIEW');
        } else {
          setStatus(data.status);
        }
        AD_INQ_setValue('answer', data.answer);
      },
    }
  );

  const chkConfirm = () => {
    if (answer !== '') {
      if (confirm('문의 답변 등록을 취소하시겠습니까? 입력한 내용은 저장되지 않습니다.')) {
        navigate('/admin/customer-service/inquiry');
      }
    } else {
      navigate('/admin/customer-service/inquiry');
    }
  };

  const onClickADINQSubmit = () => {
    const bodyParams = {
      answer: AD_INQ_getValue('answer'),
      status: status,
    };
    createInquiryAnswer(inquiryId, bodyParams).then((res: any) => {
      if (res.status === 200) {
        navigate('/admin/customer-service/inquiry');
      }
    });
  };

  return (
    <div>
      <AppPageHeader title={'고객문의 조회'} />
      <div className={'content__inner'}>
        {/* 광고주 정보 */}
        <div>
          <AppTypography.SubTitle level={2}>광고주 정보</AppTypography.SubTitle>
          <div style={{ marginTop: 20 }}>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>광고주</AppTypography.Label>
              </div>
              <div className={'col col-input'} style={{ width: ColWidth.three }}>
                <AppTypography.Text className={'text'}>{data.advertiser_name}</AppTypography.Text>
              </div>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>광고계정</AppTypography.Label>
              </div>
              <div className={'col col-input'} style={{ width: ColWidth.three }}>
                <AppTypography.Text className={'text'}>{data.ad_account_name}</AppTypography.Text>
              </div>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>등록자</AppTypography.Label>
              </div>
              <div className={'col col-input'} style={{ width: ColWidth.three }}>
                <AppTypography.Text className={'text'}>{data.created_by}</AppTypography.Text>
              </div>
            </div>
          </div>
        </div>
        <AppDiver />
        {/* 문의 내용*/}
        <div style={{ marginTop: 30 }}>
          <AppTypography.SubTitle level={2}>문의 내용</AppTypography.SubTitle>
          <div style={{ marginTop: 20 }}>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>문의일시</AppTypography.Label>
              </div>
              <div className={'col col-input'} style={{ width: ColWidth.two }}>
                <AppTypography.Text className={'text'}>{data.created_at}</AppTypography.Text>
              </div>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>문의 유형</AppTypography.Label>
              </div>
              <div className={'col col-input'} style={{ width: ColWidth.two }}>
                <AppTypography.Text className={'text'}>{data.type}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>제목</AppTypography.Label>
              </div>
              <div className={'col col-input'} style={{ width: ColWidth.one }}>
                <AppTypography.Text className={'text'}>{data.title}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>내용</AppTypography.Label>
              </div>
              <div className={'col col-input'} style={{ width: ColWidth.one }}>
                <AppTypography.Text className={'text'}>{data.content}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>파일</AppTypography.Label>
              </div>
              <div className={'col col-input'} style={{ width: ColWidth.one }}>
                {data.question_attachments?.length === 0 ? (
                  <AppTypography.Text className={'text'}>등록된 파일 없음</AppTypography.Text>
                ) : (
                  data.question_attachments?.map((ele: any, idx: any) => {
                    return (
                      <AppTypography.Text className={'text'} key={idx}>
                        <a href={`${WISEBIRDS_API}/v1/questions/file/${ele.id}`} style={{ marginRight: '10px' }}>
                          {ele.name}
                        </a>
                      </AppTypography.Text>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <AppDiver />

        {/* 답변 내용 */}
        <div>
          <AppTypography.SubTitle level={2}>답변 내용</AppTypography.SubTitle>
          {data.status === 'CLOSED' ? (
            <div style={{ marginTop: 20 }}>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>답변일시</AppTypography.Label>
                </div>
                <div className={'col col-input'} style={{ width: ColWidth.two }}>
                  <AppTypography.Text className={'text'}>{data.answer_at}</AppTypography.Text>
                </div>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>답변자</AppTypography.Label>
                </div>
                <div className={'col col-input'} style={{ width: ColWidth.two }}>
                  <AppTypography.Text className={'text'}>{data.answerer}</AppTypography.Text>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>내용</AppTypography.Label>
                </div>
                <div className={'col col-input'} style={{ width: ColWidth.one }}>
                  <div style={{ paddingTop: 6 }}>
                    <pre style={{ fontFamily: 'KoPubWorldDotum', margin: 0 }}>{data.answer}</pre>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 20 }}>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label isRequired className={'text'}>
                    답변상태
                  </AppTypography.Label>
                </div>
                <div className={'col col-input'} style={{ flex: '0 1 auto', width: 'auto' }}>
                  <AppRadioGroup
                    inline
                    data={[
                      { label: '임시저장', value: 'IN_REVIEW' },
                      { label: '답변완료', value: 'CLOSED' },
                    ]}
                    value={status}
                    onChange={(value: any) => {
                      setStatus(value);
                    }}
                  />
                </div>
                <div className={'col col-extra'}>
                  <AppTypography.Text type={'sub'} className={'text'}>
                    (답변 완료 후에는 수정이 불가하니 유의해주세요)
                  </AppTypography.Text>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label isRequired className={'text'}>
                    내용
                  </AppTypography.Label>
                </div>
                <div className={'col col-input'} style={{ width: ColWidth.one }}>
                  <Controller
                    name={'answer'}
                    defaultValue={''}
                    control={AD_INQ_control}
                    render={({ field }) => {
                      return (
                        <AppInputTextArea
                          as={'textarea'}
                          maxLength={5000}
                          height={200}
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                            setAnswer(value);
                          }}
                        />
                      );
                    }}
                    rules={{
                      required: '내용을 입력하세요.',
                    }}
                  />
                  <ErrorMessage
                    errors={AD_INQ_errors}
                    name={'answer'}
                    render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <FinalActionDivider />
      {data.status === 'CLOSED' ? (
        <AppPageFooter>
          <AppButton size={'lg'} style={{ width: 138 }} onClick={() => navigate('/admin/customer-service/inquiry')}>
            목록
          </AppButton>
        </AppPageFooter>
      ) : (
        <AppPageFooter>
          <AppButton size={'lg'} style={{ width: 138 }} onClick={chkConfirm}>
            취소
          </AppButton>
          <AppButton
            theme={'red'}
            size={'lg'}
            style={{ width: 138, marginLeft: 15 }}
            onClick={AD_INQ_handleSubmit(onClickADINQSubmit)}
          >
            등록
          </AppButton>
        </AppPageFooter>
      )}
    </div>
  );
};

export default AdminCustomerServiceInquiryDetail;
