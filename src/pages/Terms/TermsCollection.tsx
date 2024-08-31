import React from 'react';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import AppDivider from '@components/AppDivider';

interface TermsCollectionProps {
  onTermsDateChange: (type: string, date: string) => void;
  selectedTermsDate: string;
}

const TermsCollection: React.FC<TermsCollectionProps> = ({ onTermsDateChange, selectedTermsDate }) => {
  return (
    <div className={'terms__wrapper'}>
      <div className={'selected-terms'}>
        <h2 className={'selected-terms__title'}>원스토어 광고센터 개인정보 수집 및 이용안내</h2>
        <div>
          <AppSelectPicker
            data={[{ label: '[현행] 2022. 11. 24', value: '20221124' }]}
            searchable={false}
            cleanable={false}
            value={selectedTermsDate}
            style={{ width: 160 }}
            onChange={(value) => onTermsDateChange('collection', value)}
          />
        </div>
      </div>
      <AppDivider style={{ marginTop: 20, marginBottom: 30 }} />
      <div className={'section__wrapper'}>
        <div className={'section'}>
          <h4 className={'section__title'}>개인정보 수집 및 이용안내</h4>
          <div className={'section__desc'}>
            <p>(주) 원스토어 주식회사 귀중</p>
          </div>
        </div>
        <div className={'section'}>
          <h4 className={'section__title'}>개인정보의 수집 항목, 이용 목적</h4>
          <div className={'section__desc'}>
            <p>1) 개인회원</p>
            <table className={'terms-table'}>
              <thead>
                <tr>
                  <th>유형</th>
                  <th>구분</th>
                  <th>목적</th>
                  <th>항목</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td rowSpan={29}>개인</td>
                  <td rowSpan={21}>필수</td>
                  <td rowSpan={3}>회원가입</td>
                  <td>광고주명</td>
                </tr>
                <tr>
                  <td>생년월일</td>
                </tr>
                <tr>
                  <td>주소</td>
                </tr>
                <tr>
                  <td rowSpan={6}>이용자 식별 및 본인여부 확인</td>
                  <td>(이용자) 이름</td>
                </tr>
                <tr>
                  <td>ID</td>
                </tr>
                <tr>
                  <td>PASSWORD</td>
                </tr>
                <tr>
                  <td>E-mail</td>
                </tr>
                <tr>
                  <td>핸드폰 번호</td>
                </tr>
                <tr>
                  <td>본인인증 정보 (* E-mail 인증)</td>
                </tr>
                <tr>
                  <td rowSpan={4}>몰로코 연동 정보 처리 </td>
                  <td>ID</td>
                </tr>
                <tr>
                  <td>(이용자) E-mail</td>
                </tr>
                <tr>
                  <td>이름</td>
                </tr>
                <tr>
                  <td>PASSWORD</td>
                </tr>
                <tr>
                  <td rowSpan={3}>계약 이행을 위한 연락, 민원 등 고객 고충 처리</td>
                  <td>(이용자) 이름</td>
                </tr>
                <tr>
                  <td>(이용자) E-mail</td>
                </tr>
                <tr>
                  <td>(이용자) 핸드폰 번호</td>
                </tr>
                <tr>
                  <td>통신사실확인 등 운영 업무</td>
                  <td>최종 로그인 일시</td>
                </tr>
                <tr>
                  <td rowSpan={4}>부정이용 방지</td>
                  <td>ID</td>
                </tr>
                <tr>
                  <td>광고주명</td>
                </tr>
                <tr>
                  <td>탈퇴일자</td>
                </tr>
                <tr>
                  <td>탈퇴사유</td>
                </tr>
                <tr>
                  <td rowSpan={8}>선택</td>
                  <td rowSpan={8}>광고집행비 청구 등 정산 업무</td>
                  <td>식별번호</td>
                </tr>
                <tr>
                  <td>광고주명</td>
                </tr>
                <tr>
                  <td>생년월일</td>
                </tr>
                <tr>
                  <td>주소</td>
                </tr>
                <tr>
                  <td>정산 담당자</td>
                </tr>
                <tr>
                  <td>- 이름</td>
                </tr>
                <tr>
                  <td>- 이메일</td>
                </tr>
                <tr>
                  <td>- 핸드폰 번호</td>
                </tr>
              </tbody>
            </table>
            <p style={{ marginTop: 10 }}>2) 사업자 회원</p>
            <table className={'terms-table'}>
              <thead>
                <tr>
                  <th>유형</th>
                  <th>구분</th>
                  <th>목적</th>
                  <th>항목</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td rowSpan={32}>사업자</td>
                  <td rowSpan={23}>필수</td>
                  <td rowSpan={5}>회원가입</td>
                  <td>사업자등록번호</td>
                </tr>
                <tr>
                  <td>광고주명</td>
                </tr>
                <tr>
                  <td>대표자명</td>
                </tr>
                <tr>
                  <td>사업자 주소</td>
                </tr>
                <tr>
                  <td>사업자등록증</td>
                </tr>
                <tr>
                  <td rowSpan={6}>이용자 식별 및 본인여부 확인</td>
                  <td>(이용자=담당자) 이름</td>
                </tr>
                <tr>
                  <td>ID</td>
                </tr>
                <tr>
                  <td>PASSWORD</td>
                </tr>
                <tr>
                  <td>E-mail</td>
                </tr>
                <tr>
                  <td>핸드폰 번호</td>
                </tr>
                <tr>
                  <td>본인인증 정보 (* E-mail 인증)</td>
                </tr>
                <tr>
                  <td rowSpan={4}>몰로코 연동 정보 처리</td>
                  <td>ID</td>
                </tr>
                <tr>
                  <td>(이용자) E-mail</td>
                </tr>
                <tr>
                  <td>이름</td>
                </tr>
                <tr>
                  <td>PASSWORD</td>
                </tr>
                <tr>
                  <td rowSpan={3}>계약 이행을 위한 연락, 민원 등 고객 고충 처리</td>
                  <td>(이용자=담당자) 이름</td>
                </tr>
                <tr>
                  <td>(이용자=담당자) E-mail</td>
                </tr>
                <tr>
                  <td>(이용자=담당자) 핸드폰 번호</td>
                </tr>
                <tr>
                  <td>통신사실확인 등 운영 업무</td>
                  <td>최종 로그인 일시</td>
                </tr>
                <tr>
                  <td rowSpan={4}>부정이용 방지</td>
                  <td>ID</td>
                </tr>
                <tr>
                  <td>광고주명</td>
                </tr>
                <tr>
                  <td>탈퇴일자</td>
                </tr>
                <tr>
                  <td>탈퇴사유</td>
                </tr>
                <tr>
                  <td rowSpan={9}>선택</td>
                  <td rowSpan={9}>광고집행비 청구 등 정산 업무</td>
                  <td>사업자등록번호</td>
                </tr>
                <tr>
                  <td>사업자등록증</td>
                </tr>
                <tr>
                  <td>광고주명</td>
                </tr>
                <tr>
                  <td>대표자명</td>
                </tr>
                <tr>
                  <td>사업자 주소</td>
                </tr>
                <tr>
                  <td>정산 담당자</td>
                </tr>
                <tr>
                  <td>- 이름</td>
                </tr>
                <tr>
                  <td>- 이메일</td>
                </tr>
                <tr>
                  <td>- 핸드폰 번호</td>
                </tr>
              </tbody>
            </table>
            <p style={{ marginTop: 10 }}>3) 선택 항목</p>
            <table className={'terms-table'}>
              <thead>
                <tr>
                  <th>유형</th>
                  <th>구분</th>
                  <th>목적</th>
                  <th>항목</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>개인/사업자</td>
                  <td>선택</td>
                  <td>마케팅에의 활용</td>
                  <td>E-mail</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className={'section'}>
          <h4 className={'section__title'}>개인정보의 보유/이용기간</h4>
          <div className={'section__desc'}>
            <p>
              회원의 개인정보는 본 서비스 회원께 서비스를 제공하는 기간 동안에 보유 및 이용되고, 회원 탈퇴 시 수집된
              개인의 정보가 열람 또는 이용될 수 없도록 파기 처리되거나 개인정보 유효기간* 도래 시까지 보관합니다. 다만,
              회원 재가입, 임의 해지 등을 반복적으로 행함으로써 본 서비스가 제공하는 할인쿠폰, 이벤트 혜택 등의 경제상의
              이익을 불법 편법적으로 수취하거나 이 과정에서 명의도용 등의 행위가 발생하는 것을 방지하기 위한 목적 및
              서비스 제공과 관련된 각종 문의사항에 응대하기 위해 회원 탈퇴 후 1개월 동안 회원가입 시 동의하신 회원의
              개인정보를 보관합니다. 또한, 관계법령의 규정에 의하여 보존할 필요성이 있는 경우에는 관계법령에 따라
              보존합니다.
            </p>
            <p>유효기간이라 함은 일정기간(1년) 서비스를 이용하지 않은 경우로써, 탈퇴 등의 조치가 적용됩니다.</p>
            <p>
              회원의 개인정보는 회원의 본 서비스 회원 탈퇴 이후에도 상법 및 ‘전자상거래 등에서의 소비자보호에 관한
              법률(이하 ‘전자상거래법’이라 함), 전자금융거래법, 여신전문금융업법 국세기본법, 법인세법, 부가가치세법 등
              관계법령에 따라 보존할 필요가 있는 경우에는 회사는 관계법령에서 정한 기간 동안 회원정보를 보관합니다. 이
              경우 회사는 보관하는 정보를 그 보관의 목적으로만 이용하며 상세 항목 및 각 보유기간은 다음과 같습니다.
            </p>
            <table className={'terms-table'}>
              <thead>
                <tr>
                  <th>관련 법률</th>
                  <th>목적</th>
                  <th>수집항목</th>
                  <th>보유기간</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td rowSpan={3}>
                    전자상거래등에서의 소비자보호에 관한 법률
                    <br />
                    (거래기록)
                  </td>
                  <td>소비자의 불만 또는 분쟁처리</td>
                  <td>개인 및 담당자의 성명, ID, E-mail, 이동전화번호 등 소비자 식별정보 및 분쟁처리 기록</td>
                  <td>3년</td>
                </tr>
                <tr>
                  <td>대금결제 및 재화 등의 공급에 관한 기록</td>
                  <td>소비자 식별정보, 계약/청약철회 기록</td>
                  <td>5년</td>
                </tr>
                <tr>
                  <td>표시/광고에 관한 기록</td>
                  <td>성명, E-mail, 상호, 사업자 등록번호, 대표번호 및 이메일</td>
                  <td>6개월</td>
                </tr>
                <tr>
                  <td>
                    통신비밀보호법 <br />
                    (통신사실확인자료)
                  </td>
                  <td>법원의 영장을 받아 수사기관이 요청 시 제공</td>
                  <td>IP주소, 방문일시, 쿠키 등 통신사실확인자료 제공 시 필요한 로그기록자료</td>
                  <td>3개월</td>
                </tr>
              </tbody>
            </table>
            <p>
              회원의 동의를 받아 보유하고 있는 거래정보에 대해 회원께서 열람을 요구하는 경우, 지체없이 해당 정보를 열람/
              확인할 수 있도록 조치합니다.
            </p>
          </div>
        </div>
        <div className={'section'}>
          <h4 className={'section__title'}>동의 거부권 및 거부 시 불이익 사항</h4>
          <div className={'section__desc'}>
            <p>고객님께서는 동의거부 권리가 있으며, 동의거부 시 광고센터 가입이 불가합니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsCollection;
