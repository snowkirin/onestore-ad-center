import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useRouteLoaderData } from 'react-router-dom';
import AppPageHeader from '@components/AppPageHeader';
import AppTypography from '@components/AppTypography';
import { AppInputCount } from '@components/AppInput';
import { AppButton } from '@components/AppButton';
import AppUploader from '@components/AppUploader';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import AppInputTextArea from '@components/AppInput/AppInputTextArea';
import { createInquiryData, inquiryFileUpload } from '@apis/Inquiry/create.api';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import { inquiryTypeGroup } from '@pages/CustomerService/variables';
import _ from 'lodash';
import AppDivider, { FinalActionDivider } from '@components/AppDivider';
import AppPageFooter from '@components/AppPageFooter';
import { ConfirmModal } from '@components/AppModal';

interface CustomerServiceInquiryCreateProps {}

const CustomerServiceInquiryCreate: React.FC<CustomerServiceInquiryCreateProps> = () => {
  let navigate = useNavigate();

  const adAccountList: any = useRouteLoaderData('layout');
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';

  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [questionAttachments, setQuestionAttachments] = useState<any>([]);
  const [sum, setSum] = useState(0);
  const [fileCount, setFileCount] = useState(0);

  // Modal
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);

  const {
    handleSubmit: INQ_handleSubmit,
    control: INQ_control,
    formState: { errors: INQ_errors },
  } = useForm();

  const onClickINQSubmit = (data: any) => {
    const INQ_data = data;
    INQ_data.content = content;
    INQ_data.ad_account_id = selectedAdAccount;
    INQ_data.question_attachments = questionAttachments;

    createInquiryData(INQ_data).then((res: any) => {
      if (res.status === 200) {
        navigate('/customer-service/inquiry');
      }
    });
  };

  const handleShouldQueueUpdate = (file: any) => {
    const newSum = Number(sum + file[file.length - 1].blobFile.size / 1024).toFixed(2);
    const reg =
      /(.*?)\.(jpg|jpeg|png|gif|psd|tif|zip|pdf|hwp|doc|docm|docx|dot|dotm|dotx|potm|potx|pps|ppsm|ppsx|ppt|pptm|pptx|vdw|vsd|vsdm|vsdx|vss|vssm|vst|vstm|vssx|vstx|xls|xlsb|xlt|xlsm|xlsx|xltm|xltx)$/;
    if (file.length > 5) {
      alert('첨부파일은 최대 5개까지 등록 가능합니다.');
      return false;
    } else if (Number(newSum) > 20480) {
      alert('첨부파일은 20MB까지 등록 가능합니다');
      return false;
    } else if (!file[0].name.match(reg)) {
      alert('형식에 맞는 파일을 업로드하세요.');
      return false;
    } else {
      setFileCount(file.length);
      return true;
    }
  };

  const fetchUploadFile = async (file: any) => {
    if (file.length > 0 && file.length < 6) {
      const formData = new FormData();
      await file.forEach((ele: any) => {
        formData.append('files', ele.blobFile);
      });
      inquiryFileUpload(formData).then((res: any) => {
        if (res.status === 200) {
          const { data } = res;
          setQuestionAttachments(data);
        }
      });
      setFileCount(file.length);
    } else {
      setQuestionAttachments([]);
      setSum(0);
      setFileCount(file.length);
    }
  };

  const onClickINQCancel = () => {
    if (!_.isEmpty(type) || !_.isEmpty(title) || !_.isEmpty(content) || fileCount !== 0) {
      setIsOpenConfirmModal(true);
    } else {
      navigate('/customer-service/inquiry');
    }
  };

  useEffect(() => {
    setContent('');
    if (type === 'CAMPAIGN') {
      setContent(
        '원스토어 광고센터에서 광고를 집행하고 있는 경우, 아래 양식으로 문의해주시면 신속하게 확인 가능합니다.' +
          '\n\n' +
          '- 앱 이름:' +
          '\n\n' +
          '- 캠페인명:' +
          '\n\n' +
          '- 광고그룹명:'
      );
    } else if (type === 'CREATIVE') {
      setContent(
        '원스토어 광고센터에서 광고를 집행하고 있는 경우, 아래 양식으로 문의해주시면 신속하게 확인 가능합니다.' +
          '\n\n' +
          '- 소재명:' +
          '\n\n' +
          '- 소재그룹명:'
      );
    } else if (type === 'ASSET') {
      setContent(
        '원스토어 광고센터에서 광고를 집행하고 있는 경우, 아래 양식으로 문의해주시면 신속하게 확인 가능합니다.' +
          '\n\n' +
          '- 앱 이름:' +
          '\n\n' +
          '- 트래킹링크명:'
      );
    }
  }, [type]);

  useEffect(() => {
    const sizeArr = questionAttachments.map((ele: any) => {
      return ele.file_size;
    });
    if (sizeArr.length) {
      const sum = sizeArr.reduce((a: any, b: any) => {
        return a + b;
      });
      const tmpSum = Number((sum / 1024).toFixed(2));
      setSum(tmpSum);
    }
  }, [questionAttachments]);

  const selectedAdAccountTitle = useMemo(() => {
    return adAccountList.find((item: any) => item.id === selectedAdAccount).title;
  }, [selectedAdAccount]);

  return (
    <div>
      <AppPageHeader title={'고객문의하기'} />

      <div className={'content__inner'}>
        <div
          style={{
            background: 'var(--disabled-color)',
            borderRadius: 6,
            padding: '20px 30px',
            textIndent: '-5px',
          }}
        >
          <AppTypography.Text>&bull; 등록한 문의 내용은 수정이 불가합니다.</AppTypography.Text>
          <AppTypography.Text>&bull; 영업일 기준 1-2일 이내에 담당자가 답변을 드립니다.</AppTypography.Text>
        </div>
        <AppDivider />
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
            <AppTypography.Label isRequired className={'text'}>
              문의 유형
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'type'}
              control={INQ_control}
              render={({ field }) => {
                return (
                  <AppSelectPicker
                    placeholder={'문의 유형 선택'}
                    searchable={false}
                    cleanable={false}
                    block
                    data={inquiryTypeGroup}
                    onChange={(value) => {
                      field.onChange(value);
                      setType(value);
                    }}
                    value={field.value}
                  />
                );
              }}
              rules={{
                required: '문의 유형을 선택하세요.',
              }}
            />
            <ErrorMessage
              errors={INQ_errors}
              name={'type'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              제목
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'title'}
              control={INQ_control}
              render={({ field }) => {
                return (
                  <AppInputCount
                    maxLength={100}
                    onChange={(value) => {
                      field.onChange(value);
                      setTitle(value);
                    }}
                    value={field.value}
                  />
                );
              }}
              rules={{
                required: '제목을 입력하세요.',
              }}
            />
            <ErrorMessage
              errors={INQ_errors}
              name={'title'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              내용
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'content'}
              control={INQ_control}
              render={({ field }) => {
                return (
                  <AppInputTextArea
                    className={'inquiryTextArea'}
                    maxLength={5000}
                    as={'textarea'}
                    height={100}
                    onChange={(value) => {
                      field.onChange(value);
                      setContent(value);
                    }}
                    value={content}
                    placeholder={'문의유형 선택 후 내용을 작성해주세요.'}
                  />
                );
              }}
              rules={{
                required: '내용을 입력하세요.',
              }}
            />
            <ErrorMessage
              errors={INQ_errors}
              name={'content'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>파일 첨부</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <div style={{ paddingTop: 6, position: 'relative' }}>
              <form>
                <AppUploader
                  action={''}
                  autoUpload={false}
                  onChange={fetchUploadFile}
                  accept={
                    'jpg, jpeg, gif, psd, png, tif, zip, pdf , hwp, doc, docm, docx, dot, dotm, dotx, potm, potx, pps, ppsm, ppsx, ppt, pptm, pptx, vdw, vsd, vsdm, vsdx, vss, vssm, vst, vstm, vssx, vstx, xls, xlsb, xlt, xlsm, xlsx, xltm, xltx'
                  }
                  shouldQueueUpdate={(fileList) => handleShouldQueueUpdate(fileList)}
                  info={
                    <span>
                      첨부파일은 최대 5개, 20MB(20,480KB)까지 등록 가능합니다.
                      <br />
                      jpg, gif, psd, png, tif, zip, pdf ,ms office, hwp 파일만 첨부 가능합니다.
                    </span>
                  }
                >
                  <AppButton style={{ width: '200px' }} size={'md'} theme={'red'}>
                    첨부파일 추가 ({fileCount} / 5)
                  </AppButton>
                </AppUploader>
              </form>
            </div>
            <AppTypography.Text className={'text'} style={{ textAlign: 'right', color: 'var(--border-line)' }}>
              {sum}KB / 20MB(20,480KB)
            </AppTypography.Text>
          </div>
        </div>
        <FinalActionDivider />
        <AppPageFooter>
          <AppButton size={'lg'} style={{ width: 138 }} onClick={onClickINQCancel}>
            취소
          </AppButton>
          <AppButton
            size={'lg'}
            theme={'red'}
            style={{ width: 138, marginLeft: 15 }}
            onClick={INQ_handleSubmit(onClickINQSubmit)}
          >
            등록
          </AppButton>
        </AppPageFooter>
      </div>

      <ConfirmModal
        size={'xs'}
        open={isOpenConfirmModal}
        onClose={() => setIsOpenConfirmModal(false)}
        onOk={() => navigate('/customer-service/inquiry')}
        okText={'확인'}
        content={
          <AppTypography.Text>
            문의하기를 취소하시겠습니까?
            <br />
            입력한 내용은 저장되지 않습니다.
          </AppTypography.Text>
        }
        title={'고객문의 등록 취소'}
      />
    </div>
  );
};
export default CustomerServiceInquiryCreate;
