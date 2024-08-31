import React, { useEffect, useMemo, useState } from 'react';
import { AppButton } from '@components/AppButton';
import { AppInputCount } from '@components/AppInput';
import { saveAs } from 'file-saver';
import { createCustomerFile, uploadCustomerFile } from '@apis/customer_file.api';
import { uploadCreativeAssets } from '@apis/creative.api';
import { useNavigate, useRouteLoaderData } from 'react-router-dom';
import AppTypography from '@components/AppTypography';
import AppPageHeader from '@components/AppPageHeader';
import Papa from 'papaparse';
import AppUploader from '@components/AppUploader';
import { v4 as uuidv4 } from 'uuid';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import { FinalActionDivider } from '@components/AppDivider';
import AppPageFooter from '@components/AppPageFooter';

interface CreateCustomerProps {}

const CustomerCreate: React.FC<CreateCustomerProps> = () => {
  // Variables
  let navigate = useNavigate();
  // adAccountId
  const adAccountList: any = useRouteLoaderData('layout');
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';
  // UseState
  const [csvName, setCSVName] = useState<any>([]);
  const [csvData, setCsvData] = useState<any>([]);
  const [csvDataError, setCsvDataError] = useState(false);
  const [sum, setSum] = useState(0);
  const [sizeArray, setSizeArray] = useState<any>([]);
  const {
    handleSubmit: CF_handleSubmit,
    control: CF_control,
    formState: { errors: CF_errors },
  } = useForm();

  // 템플릿 다운로드
  const onTemplateDownload = () => {
    saveAs('https://storage.googleapis.com/extitems/acp/customer_set_template.csv', 'customer_set_template.csv');
  };

  // .을 _로 replace
  const replaceDot = (data: any) => {
    let tmpItem: string[] = [];
    data.map((item: string) => {
      tmpItem.push(item.replace(/\./g, '_'));
    });
    return tmpItem.join(' ');
  };

  // 파일 용량 제한 500MB
  const handleShouldQueueUpdate = (file: any) => {
    const reg = /(.*?)\.(csv)$/;
    const lastUpload = file[file.length - 1];

    const sameFile = file.filter(
      (item: any) => item.blobFile.name == lastUpload.blobFile.name && item.blobFile.size == lastUpload.blobFile.size
    );

    if (sameFile.length > 1) {
      return false;
    }

    const nameList = file.filter((item: any) => item.blobFile.name.match(reg));
    const newSum = Number(sum + file[file.length - 1].blobFile.size / 1024).toFixed(2);

    if (Number(newSum) > 512000 || nameList.length != file.length) {
      alert('형식에 맞는 파일을 업로드 하세요.\n- 파일 형식: CSV\n- 총 용량: 500MB 이하');
      return false;
    } else {
      return true;
    }
  };

  // CSV 파일 read
  const getCSVData = async (file: any) => {
    let tmpCSVName: string[] = [];
    let tmpColumns: any[] = [];
    let tmpSizeArray: any[] = [];
    setSizeArray([]);
    setCsvData([]);
    setCsvDataError(false);
    if (file.length) {
      await file.forEach((ele: any) => {
        tmpCSVName.push(ele.name);
        tmpSizeArray.push(ele.blobFile.size);
        const reader = new FileReader();
        const hexRegexp = /[\d|a-fA-F]{8}-[\d|a-fA-F]{4}-[\d|a-fA-F]{4}-[\d|a-fA-F]{4}-[\d|a-fA-F]{12}/;
        reader.readAsText(ele.blobFile);
        reader.onload = async ({ target }) => {
          const csv = Papa.parse(target?.result as string, { header: false, skipEmptyLines: true });
          const parsedData = csv?.data;
          const columns = parsedData.map((item: any) => {
            if (hexRegexp.test(item)) {
              return Object.values(item).join(',');
            } else {
              return '';
            }
          });
          const stringColumns = columns
            .filter((item: string) => {
              return item !== '';
            })
            .join('\n');
          tmpColumns.push(stringColumns);
          setCsvData(tmpColumns);
          setCSVName(tmpCSVName);
          setSizeArray(tmpSizeArray);
        };
      });
    }
  };

  // creativeAssets create
  const onClickCFSubmit = (data: any) => {
    if ((csvData.length > 0 && csvDataError) || csvData.length === 0) {
      return;
    }
    const CF_data = data;
    /**
     title: 고객 파일명,
     id_type: 타겟 유형,
     description: 상태,
     data_file_path: 첨부 파일 경로,
     */
    const uploadPayload = {
      ad_account_id: selectedAdAccount,
    };
    const uploadBodyParams = {
      asset_kind: 'CSV',
      file_name: uuidv4() + '-' + replaceDot(csvName) + '.csv',
      mime_type: 'text/csv',
    };
    uploadCreativeAssets(uploadPayload, uploadBodyParams).then((res: any) => {
      const { data } = res;
      let { asset_url: assetURL, content_upload_url: contentURL } = data;
      if (contentURL !== undefined) {
        const filePayload = {
          uploadUrl: encodeURIComponent(contentURL),
          mimeType: 'text%2Fcsv',
        };
        const fileBodyParams = csvData.join('\n');
        uploadCustomerFile(filePayload, fileBodyParams).then((res: any) => {
          const { data } = res;
          if (data.status) {
            CF_data.id_type = 'GOOGLE_ADID';
            CF_data.data_file_path = assetURL;
            createCustomerFile(
              {
                ad_account_id: selectedAdAccount,
              },
              CF_data
            )
              .then((res: any) => {
                if (res.status === 200) {
                  navigate('/assets/customer-file');
                }
              })
              .catch((err: any) => {
                alert('생성 실패하였습니다.');
              });
          } else {
            alert('파일 업로드를 실패하였습니다.');
            return;
          }
        });
      }
    });
  };

  useEffect(() => {
    const tmpCSVData = csvData.filter((item: any) => {
      return item;
    });
    if (tmpCSVData.length === 0) {
      setCsvDataError(true);
    } else {
      setCsvDataError(false);
    }
  }, [csvData]);

  useEffect(() => {
    const sizeArr = sizeArray.map((ele: any) => {
      return ele;
    });
    if (sizeArr.length) {
      const sum = sizeArr.reduce((a: any, b: any) => {
        return a + b;
      });
      const tmpSum = Number((sum / 1024).toFixed(2));
      setSum(tmpSum);
    }
  }, [sizeArray]);

  const selectedAdAccountTitle = useMemo(() => {
    return adAccountList.find((item: any) => item.id === selectedAdAccount).title;
  }, [selectedAdAccount]);

  return (
    <div>
      <AppPageHeader title={'고객 파일 생성 '} />
      <div className={'content__inner'}>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              광고계정명
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{selectedAdAccountTitle}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              고객 파일명
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'title'}
              control={CF_control}
              render={({ field }) => {
                return (
                  <AppInputCount
                    maxLength={255}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value}
                  />
                );
              }}
              rules={{
                required: '고객 파일명을 입력하세요.',
              }}
            />
            <ErrorMessage
              errors={CF_errors}
              name={'title'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              타겟 유형
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>GOOGLE_ADID</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              파일 업로드
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <div
              style={{
                marginBottom: '10px',
                marginTop: '6px',
                position: 'relative',
              }}
            >
              <Controller
                name={'file'}
                control={CF_control}
                render={({ field }) => {
                  return (
                    <>
                      <AppUploader
                        action={''}
                        autoUpload={false}
                        multiple
                        onChange={(file) => {
                          field.onChange(file);
                          getCSVData(file).then();
                        }}
                        accept={'text/csv'}
                        shouldQueueUpdate={(fileList) => handleShouldQueueUpdate(fileList)}
                        info={'업로드 버튼을 눌러 CSV 파일을 등록하세요.'}
                      >
                        <AppButton size={'md'} theme={'red'}>
                          업로드
                        </AppButton>
                      </AppUploader>
                    </>
                  );
                }}
                rules={{
                  required:
                    ((csvData.length > 0 && csvDataError) || csvData.length === 0) && '고객 파일을 업로드하세요.',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  position: 'absolute',
                  width: 'calc(100% - 70px)',
                  top: 24,
                  marginLeft: 70,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>파일 형식: CSV / 총 용량: 500MB</div>
                <AppButton size={'md'} onClick={onTemplateDownload}>
                  템플릿 다운로드
                </AppButton>
              </div>
            </div>

            <ErrorMessage
              errors={CF_errors}
              name={'file'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
          </div>
        </div>
      </div>
      <FinalActionDivider />
      <AppPageFooter>
        <AppButton size={'lg'} style={{ width: 138 }} onClick={() => navigate('/assets/customer-file')}>
          취소
        </AppButton>
        <AppButton
          size={'lg'}
          theme={'red'}
          style={{ width: 138, marginLeft: 20 }}
          onClick={CF_handleSubmit(onClickCFSubmit)}
        >
          생성
        </AppButton>
      </AppPageFooter>
    </div>
  );
};

export default CustomerCreate;
