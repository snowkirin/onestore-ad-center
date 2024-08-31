import React, { useEffect, useMemo, useRef, useState } from 'react';
import AppPageHeader from '@components/AppPageHeader';
import AppTypography from '@components/AppTypography';
import { AppInput, AppInputCount } from '@components/AppInput';
import AppRadioGroup from '@components/AppRadio';
import AppDatePicker from '@components/AppDatePicker';
import dayjs from 'dayjs';
import { ScheduleDate } from '@interface/common.interface';
import { FinalActionDivider } from '@components/AppDivider';
import { AppButton } from '@components/AppButton';
import { useQuery } from '@tanstack/react-query';
import _, { isEmpty } from 'lodash';
import { getAdminHelpCategory, getAdminHelpDetail, updateAdminHelpContent } from '@apis/Help/admin.api';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import AppModal from '@components/AppModal/Modal';
import { useNavigate, useParams } from 'react-router-dom';
// import { useQuill } from 'react-quilljs';
// import 'quill/dist/quill.snow.css';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';

import ReactQuill from 'react-quill-with-table';
import AppPageFooter from '@components/AppPageFooter';

interface AdminCustomerServiceHelpUpdateProps {}

const AdminCustomerServiceHelpUpdate: React.FC<AdminCustomerServiceHelpUpdateProps> = () => {
  const navigate = useNavigate();
  const { id: helpId } = useParams();

  const [sort, setSort] = useState('');
  const [saveTitle, setSaveTitle] = useState('');
  const [saveContent, setSaveContent] = useState('');
  const [status, setStatus] = useState('TEMP');
  const [scheduleDate, setScheduleDate] = useState<ScheduleDate>({
    YYYY_MM_DD: dayjs().toDate(),
    HH_mm: dayjs().add(1, 'hour').toDate(),
  });
  const [category, setCategory] = useState<any>([]);
  const [selectedFirstType, setSelectedFirstType] = useState('');
  const [open, setOpen] = useState(false);
  const [isChange, setIsChange] = useState(false);
  const [isSumbit, setIsSubmit] = useState(false);

  const editorRef = useRef(null);

  const [saveContentText, setSaveContentText] = useState('');

  const {
    handleSubmit: AD_HU_handleSubmit,
    control: AD_HU_control,
    formState: { errors: AD_HU_errors },
    setValue: AD_HU_setValue,
    watch: AD_HU_watch,
  } = useForm();

  const watchFirstCategory = AD_HU_watch('first_category');

  const handleModalOpen = () => setOpen(true);
  const handleModalClose = () => setOpen(false);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          ['link', 'image'],
          [{ align: [] }, { indent: '-1' }, { indent: '+1' }],
        ],
        handlers: {},
      },
    }),
    []
  );
  const formats = [
    'bold',
    'italic',
    'underline',
    'strike',
    'link',
    'image',
    'link',
    'color',
    'background',
    'align',
    'indent',
  ];
  // const { quill, quillRef } = useQuill({ modules, formats });

  const fetchAdminHelpCategory = useQuery(
    ['fetchAdminHelpCategory', selectedFirstType],
    async () => {
      const { data } = await getAdminHelpCategory();
      if (!isEmpty(data)) {
        return data.map((item: any) => {
          return {
            label: item.name,
            value: item.code,
            children: item.children.map((ele: any) => {
              return {
                label: ele.name,
                value: ele.code,
              };
            }),
          };
        });
      } else {
        return [];
      }
    },
    {
      onSuccess: (data: any) => {
        setCategory(data);
      },
    }
  );

  const fetchAdminHelpContent = useQuery(
    ['fetchAdminHelpContent', helpId],
    async () => {
      const result = await getAdminHelpDetail(helpId);
      if (result.status === 200) {
        return {
          ...result.data,
          scheduleDate: {
            YYYY_MM_DD: dayjs(result.data.publish_at).toDate(),
            HH_mm: dayjs(result.data.publish_at).toDate(),
          },
        };
      } else {
        return [];
      }
    },
    {
      enabled: !isEmpty(helpId),
      onSuccess: (data: any) => {
        setIsChange(true);
        setSelectedFirstType(data.first_category);
        setSaveContent(data.content);
        setSaveContentText(data.raw_content);
        if (data.publish_status == 'PUBLISHED') {
          setScheduleDate(data.scheduleDate);
        }
        setStatus(data.publish_status);
      },
    }
  );

  const onClickADHUSubmit = (data: any) => {
    setIsSubmit(true);
    if (_.isEmpty(saveContentText) || saveContentText === '<p><br></p>') {
      return;
    }
    const AD_HC_data = data;
    AD_HC_data.content = saveContent;
    AD_HC_data.raw_content = saveContentText;
    AD_HC_data.publish_at =
      dayjs(scheduleDate.YYYY_MM_DD).format('YYYY-MM-DD') + ' ' + dayjs(scheduleDate.HH_mm).format('HH:mm');

    updateAdminHelpContent(helpId, AD_HC_data)
      .then((res: any) => {
        if (res.status === 200) {
          navigate('/admin/customer-service/help');
        }
      })
      .catch((err: any) => {
        alert('수정실패하였습니다.');
      });
  };

  const chkConfirm = () => {
    if (saveTitle !== '' || saveContentText !== '') {
      if (confirm('도움말 수정을 취소하시겠습니까? 입력한 내용은 저장되지 않습니다.')) {
        navigate('/admin/customer-service/help');
      }
    } else {
      navigate('/admin/customer-service/help');
    }
  };

  useEffect(() => {
    setSaveContent(
      //@ts-ignore
      editorRef?.current?.getEditor()?.getText().replace(/\s/g, '')
    );
  }, [saveContentText]);

  // const insertToEditor = (url: any) => {
  //   if (quill) {
  //     const range = quill.getSelection(true);
  //     if (range) {
  //       quill.insertEmbed(range.index, 'image', url);
  //     }
  //   }
  // };
  //
  // const saveToServer = async (file: any) => {
  //   const body = new FormData();
  //   body.append('files', file);
  //   helpFileUpload(body).then((res) => {
  //     if (res.status === 200) {
  //       const { data } = res;
  //       if (data) {
  //         insertToEditor(data[0].file_path);
  //       }
  //     }
  //   });
  // };
  //
  // const selectLocalImage = () => {
  //   const input = document.createElement('input');
  //   input.setAttribute('type', 'file');
  //   input.setAttribute('accept', 'image/*');
  //   input.click();
  //   input.onchange = () => {
  //     if (input.files) {
  //       const file = input.files[0];
  //       saveToServer(file);
  //     }
  //   };
  // };
  //
  // const getOriginContent = useQuery(
  //   [isChange],
  //   async () => {
  //     if (quill) {
  //       quill.clipboard.dangerouslyPasteHTML(saveContent);
  //     }
  //   },
  //   {}
  // );

  // useEffect(() => {
  //   if (quill) {
  //     quill.on('text-change', (delta, oldDelta, source) => {
  //       setSaveContent(quill.root.innerHTML);
  //     });
  //     quill.getModule('toolbar').addHandler('image', selectLocalImage);
  //   }
  // }, [quill]);

  return (
    <>
      {!fetchAdminHelpContent.isFetching && (
        <div>
          <AppPageHeader title={'도움말 수정'} />
          <div className={'content__inner'}>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  카테고리
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'first_category'}
                  defaultValue={fetchAdminHelpContent.data?.first_category}
                  control={AD_HU_control}
                  render={({ field }) => {
                    return (
                      <AppSelectPicker
                        placeholder={'대카테고리 선택'}
                        cleanable={false}
                        searchable={false}
                        style={{ width: '150px', marginRight: '10px' }}
                        data={category}
                        onChange={(value) => {
                          field.onChange(value);
                          AD_HU_setValue('second_category', '');
                        }}
                        value={field.value}
                      />
                    );
                  }}
                  rules={{
                    required: '카테고리를 선택하세요.',
                  }}
                />
                <Controller
                  name={'second_category'}
                  defaultValue={fetchAdminHelpContent.data?.second_category}
                  control={AD_HU_control}
                  render={({ field }) => {
                    return (
                      <AppSelectPicker
                        placeholder={'중카테고리 선택'}
                        cleanable={false}
                        searchable={false}
                        style={{ width: '150px', marginRight: '10px' }}
                        data={category.find((item: any) => item.value === watchFirstCategory)?.children || []}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        value={field.value}
                      />
                    );
                  }}
                  rules={{
                    required: '카테고리를 선택하세요.',
                  }}
                />

                <div>
                  <ErrorMessage
                    errors={AD_HU_errors}
                    name={'first_category'}
                    render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                  />
                  {!_.has(AD_HU_errors, 'first_category') && (
                    <ErrorMessage
                      errors={AD_HU_errors}
                      name={'second_category'}
                      render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>등록 순서</AppTypography.Label>
              </div>
              <div className={'col col-input'} style={{ width: 100 }}>
                <Controller
                  name={'sort'}
                  defaultValue={fetchAdminHelpContent.data?.sort}
                  control={AD_HU_control}
                  render={({ field }) => {
                    return (
                      <AppInput
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        numberOnly={true}
                        value={field.value}
                        style={{ width: '100px' }}
                      />
                    );
                  }}
                />
              </div>
              <div className={'col col-extra'}>
                <AppTypography.Text type={'sub'}>
                  숫자가 작을수록 게시물이 먼저 보여집니다.
                  <br />
                  만약 입력한 순서에 이미 등록된 게시물이 있을 경우, 기존 게시물은 그 다음 순서로 보여집니다.
                </AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  제목
                </AppTypography.Label>
              </div>
              <div className={'col col-input'} style={{ width: 840 }}>
                <Controller
                  name={'title'}
                  defaultValue={fetchAdminHelpContent.data?.title}
                  control={AD_HU_control}
                  render={({ field }) => {
                    return (
                      <AppInputCount
                        maxLength={100}
                        onChange={(value) => {
                          field.onChange(value);
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
                  errors={AD_HU_errors}
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
              <div className={'col col-input'} style={{ width: 840 }}>
                <div style={{ height: 342 }}>
                  <ReactQuill
                    ref={editorRef}
                    style={{ height: 300 }}
                    modules={modules}
                    value={saveContentText || ''}
                    onChange={setSaveContentText}
                  />
                </div>
                {isSumbit && (_.isEmpty(saveContentText) || saveContentText === '<p><br></p>') && (
                  <div style={{ marginTop: '40px' }}>
                    <AppErrorMessage>내용을 입력하세요.</AppErrorMessage>
                  </div>
                )}
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  게시상태
                </AppTypography.Label>
              </div>
              <div className={'col col-input'} style={{ width: 840 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div>
                    <Controller
                      name={'publish_status'}
                      defaultValue={fetchAdminHelpContent.data?.publish_status}
                      control={AD_HU_control}
                      render={({ field }) => {
                        return (
                          <AppRadioGroup
                            inline
                            data={[
                              { label: '임시저장', value: 'TEMP' },
                              { label: '게시', value: 'PUBLISHED' },
                            ]}
                            onChange={(value) => {
                              field.onChange(value);
                              setStatus(value);
                            }}
                            value={field.value}
                          />
                        );
                      }}
                    />
                  </div>
                  {status === 'PUBLISHED' && (
                    <>
                      <div style={{ marginLeft: '10px' }}>
                        <AppDatePicker
                          oneTap
                          ranges={[]}
                          style={{ width: 120 }}
                          isoWeek={true}
                          value={scheduleDate.YYYY_MM_DD}
                          cleanable={false}
                          onChange={(value) => {
                            setScheduleDate((prev) => ({ ...prev, YYYY_MM_DD: value }));
                          }}
                          disabledDate={(date) => dayjs(date).isBefore(dayjs().subtract(1, 'day'))}
                        />
                      </div>
                      <div style={{ marginLeft: '10px' }}>
                        <AppDatePicker
                          format={'HH:mm'}
                          ranges={[]}
                          style={{ width: 80 }}
                          value={scheduleDate.HH_mm}
                          cleanable={false}
                          onChange={(value) => {
                            setScheduleDate((prev) => ({ ...prev, HH_mm: value }));
                          }}
                          disabledHours={(date) =>
                            dayjs(scheduleDate.YYYY_MM_DD).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
                              ? dayjs(date).isBefore(dayjs().hour())
                              : false
                          }
                          disabledMinutes={(date) =>
                            dayjs(scheduleDate.YYYY_MM_DD).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
                              ? dayjs(date).isBefore(dayjs().minute())
                              : false
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <FinalActionDivider />
          <AppPageFooter
            extra={
              <AppButton theme={'red'} size={'lg'} style={{ width: 138 }} onClick={handleModalOpen}>
                미리보기
              </AppButton>
            }
          >
            <AppButton size={'lg'} style={{ width: 138 }} onClick={chkConfirm}>
              취소
            </AppButton>
            <AppButton
              theme={'red'}
              size={'lg'}
              style={{ width: 138, marginLeft: 15 }}
              onClick={AD_HU_handleSubmit(onClickADHUSubmit)}
            >
              등록
            </AppButton>
          </AppPageFooter>

          <AppModal size={'lg'} role={'dialog'} open={open} onClose={handleModalClose}>
            <AppModal.Header>
              <AppModal.Title>미리보기</AppModal.Title>
            </AppModal.Header>
            <AppModal.Body>
              <div dangerouslySetInnerHTML={{ __html: saveContentText }} />
            </AppModal.Body>
            <AppModal.Footer>
              <AppButton appearance="primary" size={'lg'} onClick={handleModalClose}>
                확인
              </AppButton>
            </AppModal.Footer>
          </AppModal>
        </div>
      )}
    </>
  );
};
export default AdminCustomerServiceHelpUpdate;
