import React from 'react';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import AppDivider from '@components/AppDivider';

interface TermsServiceProps {
  onTermsDateChange: (type: string, date: string) => void;
  selectedTermsDate: string;
}

const TermsService: React.FC<TermsServiceProps> = ({ onTermsDateChange, selectedTermsDate }) => {
  return (
    <div className={'terms__wrapper'}>
      <div className={'selected-terms'}>
        <h2 className={'selected-terms__title'}>원스토어 광고센터 개인정보처리방침</h2>
        <div>
          <AppSelectPicker
            data={[{ label: '[현행] 2022. 11. 24', value: '20221124' }]}
            searchable={false}
            cleanable={false}
            value={selectedTermsDate}
            style={{ width: 160 }}
            onChange={(value) => onTermsDateChange('privacy', value)}
          />
        </div>
      </div>
      <AppDivider style={{ marginTop: 20, marginBottom: 30 }} />
      <div className={'section__wrapper'}>
        <div className={'section'} style={{ marginTop: 30 }}>
          <h4 className={'section__title'}>개인정보 처리방침</h4>
          <div className={'section__desc'}>
            <p>원스토어 광고센터가 수집하는 이용자의 개인정보항목 및 수집이유, 개인정보보호책임자 등을 알려드립니다.</p>
            <p>
              원스토어 광고센터(이하 “회사”)가 운영하는 광고센터 (
              <a href={'https://onestoreads.co.kr'} target={'_blank'}>
                https://onestoreads.co.kr
              </a>{' '}
              이하 "광고센터"라고 함)에서 회원에게 공동으로 제공하는 광고 서비스(이하 "서비스"라 함)는 회원의
              개인정보보호를 소중하게 생각하고, 회원의 개인정보를 보호하기 위하여 항상 최선을 다해 노력하고 있습니다.
            </p>
          </div>
        </div>
        <div className={'section'}>
          <h4 className={'section__title'}>총칙</h4>
          <div className={'section__desc'}>
            <p>
              1. 개인정보란 생존하고 있는 개인에 관한 정보로서 당해 개인을 알아볼 수 있는 부호, 문자, 음성, 음향 및 영상
              등의 정보(당해 정보만으로는 특정 개인을 알아볼 수 없는 경우에도 다른 정보와 용이하게 결합하여 알아볼 수
              있는 것을 포함)를 말합니다.
            </p>
            <p>
              2. 회사는 고객정보보호를 가장 소중하게 생각하며, 개인정보보호법을 비롯 모든 개인정보보호 관련 법률규정을
              준수하고 있습니다.
            </p>
            <p>
              3. 회사는 본 개인정보처리방침을 통하여 회원께서 제공하시는 개인정보가 어떤 용도와 방식으로 이용되고 있으며
              개인정보를 효과적이고 적극적으로 보호하기 위해 회사가 노력하는 사항을 알려드립니다.
            </p>
            <p>
              4. 회사는 본 개인정보처리방침을 홈페이지(
              <a href={'https://onestoreads.co.kr'} target={'_blank'}>
                https://onestoreads.co.kr
              </a>
              ) 첫 화면 또는 서비스 가입 화면에 공개함으로써 회원께서 언제나 용이하게 보실 수 있도록 조치하고 있습니다.
            </p>
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
                    전자상거래등에서의 소비자보호에 관한 법률 <br />
                    (거래기록)
                  </td>
                  <td>소비자의 불만 또는 분쟁처리</td>
                  <td>개인 및 담당자의 성명, ID, E-mail, 이동전호번호 등 소비자 식별정보 및 분쟁처리 기록</td>
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
          <h4 className={'section__title'}>개인정보 수집에 대한 동의</h4>
          <div className={'section__desc'}>
            <p>
              회사는 회원께서 개인정보의 수집, 이용에 관한 내용에 대해 「동의한다」 또는 「동의하지 않는다」 버튼을
              클릭할 수 있는 절차를 마련하고 있으며, 회원께서 「동의한다」 버튼을 클릭하면 개인정보 수집에 대해 동의한
              것으로 봅니다.
            </p>
          </div>
        </div>
        <div className={'section'}>
          <h4 className={'section__title'}>개인정보의 수집 방법</h4>
          <div className={'section__desc'}>
            <p>
              회사는 홈페이지에서의 가입 절차, 상담절차, 개인정보 처리업무 수탁사 또는 제휴사 등으로부터의 수집 시
              생성정보 수집 툴을 통한 방법 등으로 개인 정보를 수집합니다.
            </p>
          </div>
        </div>
        <div className={'section'} id={'thirdParty'}>
          <h4 className={'section__title'}>수집한 개인정보의 이용 및 제3자 제공</h4>
          <div className={'section__desc'}>
            <p>
              1. 회사는 회원의 개인정보를 가입신청서, 서비스이용약관, 개인정보처리방침의 개인정보의 수집 및 이용목적에서
              고지한 범위 내에서 사용하며, 동 범위를 초과하여 이용하거나 타인 또는 타기업, 기관에 제공하지 않습니다. 단,
              다음의 경우에는 주의를 기울여 개인정보를 이용 및 제공할 수 있습니다.
            </p>
            <p>- 제휴관계</p>
            <p>
              보다 나은 서비스 제공을 위하여 회원의 개인정보를 제휴사에게 제공하거나 또는 제휴사와 공유할 수 있습니다.
              개인정보를 제공하거나 공유할 경우에는 사전에 회원께 제휴사가 누구인지, 제공 또는 공유되는 개인정보항목이
              무엇인지, 왜 그러한 개인정보가 제공되거나 공유되어야 하는지, 그리고 언제까지 어떻게 보호, 관리되는지에
              대해 개별적으로 서면 또는 E-mail 등을 통해 고지하여 동의를 구하는 절차를 거치게 되며, 회원께서 동의하지
              않는 경우에는 제휴사에게 제공하거나 제휴사와 공유하지 않습니다. 제휴관계에 변화가 있거나 제휴관계가 종결될
              때도 같은 절차에 의하여 고지하거나 동의를 구합니다.
            </p>
            <p>- 매각, 인수합병 등</p>
            <p>
              영업의 전부 또는 일부를 양도하거나, 합병, 상속 등으로 서비스 제공자의 권리, 의무를 이전 승계하는 경우
              개인정보보호 관련 회원의 권리를 보장하기 위하여 반드시 그 사실을 회원께 통지합니다.
            </p>
            <p>
              2. 회사는 수집한 개인정보를 개인정보 수집 시 회원께 고지하고 동의를 얻은 범위를 넘어 이용하거나 제3자에게
              제공하지 않습니다. 다만, 회원의 동의가 있거나 다음에 해당하는 경우에는 예외로 합니다.
            </p>
            <p>
              - 서비스의 제공에 관한 계약의 이행을 위하여 필요한 개인정보로서 경제적, 기술적인 사유로 통상의 동의를 받는
              것이 현저히 곤란한 경우
            </p>
            <p>- 서비스 제공에 따른 요금정산을 위하여 필요한 경우</p>
            <p>
              - 통신비밀보호법, 국세기본법, 정보통신망법, 개인정보보호법, 금융실명거래 및 비밀보장에 관한 법률,
              신용정보의 이용 및 보호에 관한 법률, 전기통신기본법, 전기통신사업법, 지방세법, 소비자기본법, 한국은행법,
              형사소송법 등 다른 법률에 특별한 규정이 있는 경우. 단, '법률에 특별한 규정이 있는 경우'로 행정목적이나
              수사목적으로 행정관청 또는 수사기관이 요구해 온 경우라도 무조건 회원의 개인정보를 제공하지 않으며, 법률에
              규정된 바에 따라 영장 또는 기관장의 직인이 날인된 서면에 의한 경우 등 적법한 절차에 따라 제공합니다.
            </p>
            <p>
              - 통계작성/학술연구 또는 시장조사를 위하여 필요한 경우로서 특정 개인을 알아볼 수 없는 형태로 가공하여
              제공하는 경우
            </p>
            <p>
              1. 회사는 기본적인 서비스 제공, 보다 나은 서비스 제공, 고객편의 제공 등 원활한 업무 수행을 위하여 다음과
              같이 개인정보 처리 업무를 외부 전문업체(또는 회사의 다른 서비스)에 위탁하여 운영하고 있습니다.
            </p>
            <table className={'terms-table'}>
              <thead>
                <tr>
                  <th>수탁자</th>
                  <th>수탁범위</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>㈜와이즈버즈</td>
                  <td>서비스 운영</td>
                </tr>
                <tr>
                  <td>Amazon Web Service,Ins (Seoul)</td>
                  <td>클라우드 서비스를 이용한 서비스 제공 및 데이터 보간 관리</td>
                </tr>
              </tbody>
            </table>
            <table className={'terms-table'}>
              <thead>
                <tr>
                  <th>
                    업체명 <br />
                    (정보관리책임자 연락처)
                  </th>
                  <th>국가</th>
                  <th>일시 및 방법</th>
                  <th>개인정보 항목</th>
                  <th>이용목적</th>
                  <th>보유 및 처리기간</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    Molocco Inc. <br />(<a href={'mailto:help@onestoreads.co.kr'}>help@onestoreads.co.kr</a>)
                  </td>
                  <td>미국</td>
                  <td>서비스 이용 시 안전한 네트워크를 이용한 전송</td>
                  <td>서비스를 이용하면서 수집/이용되는 개인정보</td>
                  <td>서비스 개선 및 유지보수</td>
                  <td>위탁계약 종료 시 파기</td>
                </tr>
              </tbody>
            </table>

            <p>
              2. 회사는 위탁업무계약서 등을 통하여 개인정보보호 관련 법규의 준수, 개인정보에 관한 비밀유지, 제3자 제공에
              대한 금지, 사고시의 책임 부담, 위탁기간, 처리 종료 후의 개인정보의 반환 또는 파기의무 등을 규정하고, 이를
              준수하도록 관리하고 있습니다.
            </p>
          </div>
        </div>
        <div className={'section'}>
          <h4 className={'section__title'}>개인정보의 열람 및 정정</h4>
          <div className={'section__desc'}>
            <p>
              1. 회원은 언제든지 등록되어 있는 회원의 개인정보를 열람하거나 정정하실 수 있습니다. 개인정보 열람 및
              정정을 하고자 할 경우에는 『회원정보관리 &#8594; 개인정보변경』을 클릭하여 직접 열람 또는 정정하거나,
              개인정보보호책임자 및 담당자에게 E-mail로 연락하시면 지체 없이 조치하겠습니다.
            </p>
            <p>
              2. 회원께서 개인정보의 오류에 대한 정정을 요청한 경우, 정정을 완료하기 전까지 당해 개인 정보를 이용 또는
              제공하지 않습니다.
            </p>
            <p>
              3. 잘못된 개인정보를 제3자에게 이미 제공한 경우에는 정정 처리결과를 제3자에게 지체없이 통지하여 정정하도록
              조치하겠습니다.
            </p>
          </div>
        </div>
        <div className={'section'}>
          <h4 className={'section__title'}>개인정보의 수집, 이용, 제공에 대한 동의 철회</h4>
          <div className={'section__desc'}>
            <p>
              1. 회원가입 등을 통해 개인정보의 수집, 이용, 제공에 대해 회원께서 동의하신 내용을 회원께서는 언제든지
              철회하실 수 있습니다. 동의 철회는 홈페이지 첫 화면의 회원정보관리 &#8594; 개인정보변경』에서 "회원탈퇴"를
              클릭하거나 개인정보보호책임자에게 E-mail등으로 연락하시면 지체 없이 회원탈퇴를 위해 필요한 조치를
              취합니다. 동의 철회를 하고 개인정보를 파기하는 등의 조치를 취한 경우에는 그 사실을 회원께 지체 없이
              통지하도록 하겠습니다.
            </p>
            <p>
              2. 회사는 개인정보의 수집에 대한 동의철회(회원탈퇴)를 회원가입 방법보다 쉽게 할 수 있도록 필요한 조치를
              취합니다.
            </p>
          </div>
        </div>
        <div className={'section'}>
          <h4 className={'section__title'}>개인정보 파기 절차 및 방법</h4>
          <div className={'section__desc'}>
            <p>
              회사는 수집한 개인정보의 이용목적이 달성된 후에는 보관기간 및 이용기간에 따라 해당 정보를 지체 없이
              파기합니다. 파기절차, 방법, 시점은 다음과 같습니다.
            </p>
            <p>1. 파기절차 및 시점</p>
            <p>
              회원이 서비스 가입 등을 위해 기재한 개인정보는 서비스 해지 등 이용목적이 달성된 후 내부 방침 및 기타 관련
              법령에 의한 정보보호 사유(위 개인정보의 보유 및 이용기간 참조)에 따른 보유기간이 경과한 후에 삭제되거나
              파기합니다. 일반적으로 잔존하는 채권, 채무 관계가 없는 경우 본 서비스 회원가입 시 수집되어 전자적
              파일형태로 관리하는 개인정보는 회원 탈퇴 시점에 바로 삭제 됩니다.
            </p>
            <p>
              단, 고객응대 및 불법적 사용자에 대한 관련 수사기관 협조를 위하여 탈퇴 후 6개월간 회원 정보 데이터를
              보관하며 12개월 이후에는 회원의 모든 데이터를 삭제합니다.
            </p>
            <p>2. 파기방법</p>
            <p>
              종이에 출력된 개인정보는 분쇄기로 분쇄 또는 소각하거나 화학약품 처리를 하여 용해하여 파기하고, 전자적
              파일형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.
            </p>
          </div>
        </div>
        <div className={'section'}>
          <h4 className={'section__title'}>이용자의 권리와 의무</h4>
          <div className={'section__desc'}>
            <p>
              1. 회사는 회원의 의견을 매우 소중하게 생각하며, 회원은 의문사항으로부터 언제나 성실한 답변을 받을 권리가
              있습니다.
            </p>
            <p>
              2. 회원의 개인정보를 최신의 상태로 정확하게 입력하여 불의의 사고를 예방해 주시기 바랍니다. 입력한 부정확한
              정보로 인해 발생하는 사고의 책임은 회원께 있으며 타인 정보의 도용 등 허위정보를 입력할 경우 회원자격이
              상실될 수 있습니다.
            </p>
            <p>
              3. 회원은 개인정보를 보호받을 권리와 함께 회원 자신의 개인정보를 보호하고 타인의 정보를 침해하지 않을
              의무도 가지고 있습니다. PASSWORD를 포함한 회원의 개인정보가 유출되지 않도록 조심하시고 게시물을 포함한
              타인의 개인정보를 훼손하지 않도록 유의해 주십시오. 만약 이 같은 책임을 다하지 못하고 타인의 정보를 훼손할
              시에는 개인정보보호법등에 의해 처벌받을 수 있습니다.
            </p>
          </div>
        </div>
        <div className={'section'}>
          <h4 className={'section__title'}>개인정보처리방침의 고지 또는 통지방법</h4>
          <div className={'section__desc'}>
            <p>
              1. 회사가 회원이 동의한 범위를 넘어 회원의 개인정보를 이용하거나 제3자에게 제공하기 위해 회원의 추가적인
              동의를 얻고자 하는 때에는 미리 회원께 개별적으로 서면, E-mail, 전화, 인터넷 홈페이지 등에 개재하는 등으로
              해당사항을 통지하고 이에 대한 동의를 얻습니다.
            </p>
            <p>
              2. 타인에게 회원의 개인정보의 수집, 보관, 처리, 이용, 제공, 관리, 파기 등을 위탁하는 경우에는 홈페이지의
              개인정보처리방침 등을 통하여 인터넷 홈페이지에 공개합니다.
            </p>
            <p>
              3. 회사가 영업의 전부 또는 일부를 양도하거나 합병, 상속 등으로 그 권리, 의무를 이전하는 경우 서면, E-mail
              등을 통하여 회원께 개별적으로 통지합니다. 다만, 서면, E-mail 기타의 방법에 의한 통지는 과실 없이 회원의
              연락처를 알지 못하는 경우에는 인터넷 홈페이지에 30일 이전에 게시하고, 천재, 지변 그 밖에 정당한 사유로 위
              홈페이지 게시가 곤란한 경우에는 2곳 이상의 일반일간신문(회원의 대부분이 특정 지역에 거주하는 경우에는 그
              지역을 보급구역으로 하는 일반일간신문으로 할 수 있습니다)에 1회 이상 공고하는 것으로 갈음합니다.
            </p>
          </div>
        </div>
        <div className={'section'}>
          <h4 className={'section__title'}>개인정보보호를 위한 기술 및 관리적 대책</h4>
          <div className={'section__desc'}>
            <p>
              본 서비스에서는 회원의 개인정보를 보호하기 위해 기술적 대책과 관리적 대책을 마련하고 있으며, 이를 적용하고
              있습니다.
            </p>
            <p>1. 기술적 대책</p>
            <p>
              회사는 회원의 개인정보를 처리함에 있어 개인정보가 분실, 도난, 유출, 변조 또는 훼손되지 않도록 안전성
              확보를 위하여 다음과 같은 기술적 대책을 강구하고 있습니다.
            </p>
            <p>
              회원의 개인정보는 비밀번호에 의해 보호되며 파일 및 전송데이터를 암호화하거나 파일 잠금기능 (Lock)을
              사용하여 중요한 데이터는 별도의 보안기능을 통해 보호되고 있습니다.
            </p>
            <p>
              회사는 백신프로그램을 이용하여 컴퓨터 바이러스에 의한 피해를 방지하기 위한 조치를 취하고 있습니다.
              백신프로그램은 주기적으로 업데이트되며 갑작스런 바이러스가 출현할 경우 백신이 나오는 즉시 이를
              제공함으로써 개인정보가 침해되는 것을 방지하고 있습니다.
            </p>
            <p>
              회사는 암호알고리즘을 이용하여 네트워크 상의 개인정보를 안전하게 전송할 수 있는 보안장치(SSL 또는 SET)를
              채택하고 있습니다.
            </p>
            <p>
              회사는 해킹 등 외부침입에 대비하여 각 서버마다 침입차단시스템 및 취약점 분석시스템 등을 이용하여 보안에
              만전을 기하고 있습니다.
            </p>
            <p>2. 관리적 대책</p>
            <p>
              회사는 개인정보의 안전한 보호를 위하여 주요 시스템 및 설비에 대하여 외부 전문기관으로부터 정보보호관리체계
              인증 등 객관적인 인증을 받아 운영되고 있습니다.
            </p>
            <p>
              회사는 고객의 개인정보에 대한 접근 및 관리에 필요한 절차 등을 마련하여 소속 직원으로 하여금 이를 숙지하고
              준수하도록 하고 있습니다.
            </p>
            <p>
              회사는 회원의 개인정보에 대한 접근권한을 최소한의 인원으로 제한하고 있습니다. 그 최소한의 인원에 해당하는
              자는 다음과 같습니다.
            </p>
            <ul>
              <li>- 개인정보보호책임자 및 담당자 등 개인정보관리업무를 수행하는 자</li>
              <li>- 이용자를 직접 상대로 하여 마케팅 업무를 수행하는 자</li>
              <li>- 기타 업무상 개인정보의 처리가 불가피한 자</li>
            </ul>
            <p>
              회사는 회원의 개인정보에 대한 접근 및 관리에 필요한 절차 등을 마련하여 소속 직원으로 하여금 이를 숙지하고
              준수하도록 하고 있으며, 개인정보를 처리하는 직원을 대상으로 새로운 보안 기술 습득 및 개인정보보호 의무
              등에 관해 정기적인 사내 교육 및 외부 위탁교육을 실시하고 있습니다.
            </p>
            <p>
              개인정보 관련 처리자의 업무 인수인계는 보안이 유지된 상태에서 철저하게 이뤄지고 있으며 입사 및 퇴사 후
              개인정보 사고에 대한 책임을 명확히 하고 있습니다.
            </p>
            <p>전산실 및 자료 보관실 등을 특별 보호구역으로 설정하여 물리적 논리적으로 접근을 통제하고 있습니다.</p>
            <p>
              회사는 컴퓨터를 이용하여 회원의 개인정보를 처리하는 경우 개인정보에 대한 접근권한을 가진 담당자를 지정하여
              ID 및 PASSWORD를 부여하고, 해당 비밀번호를 정기적으로 갱신하고 있습니다.
            </p>
            <p>
              회사는 신규직원 채용 시 정보보호서약서 또는 개인정보보호서약서에 서명함으로 직원에 의한 정보유출을 사전에
              방지하고 개인정보처리방침에 대한 이행사항 및 직원의 준수여부를 감사하기 위한 내부절차를 마련하여
              지속적으로 시행하고 있습니다.
            </p>
            <p>
              회사는 직원 퇴직 시 비밀유지서약서에 서명함으로 회원의 개인정보를 처리하였던 자가 직무상 알게 된
              개인정보를 훼손/ 침해 또는 누설하지 않도록 하고 있습니다.
            </p>
            <p>
              회사는 서비스이용계약체결 또는 서비스제공을 위하여 회원의 신용카드번호, 은행결제계좌 등 정산에 관한 정보를
              수집하거나 회원께 제공하는 경우 당해 회원이 본인임을 확인하기 위하여 필요한 조치를 취하고 있습니다.
            </p>
            <p>
              회사는 회원 개인의 실수나 기본적인 인터넷의 위험성 때문에 일어나는 일들에 대해 책임을 지지 않습니다.
              회원의 경우 개개인이 본인의 개인정보를 보호하기 위해서 자신의 ID 와 패스워드를 적절하게 관리하고 여기에
              대한 책임을 져야 합니다. 또한, 다른 사람이 추측할 수 있는 쉬운 PASSWORD는 사용을 피하시기를 권장하며,
              정기적으로 PASSWORD를 변경하시는 것이 바람직합니다.
            </p>
            <p>
              공동으로 사용하는 PC에서 저희 홈페이지를 접속하여 로그인 한 상태에서 다른 사이트로 이동하는 경우, 서비스
              이용을 종료하는 경우에는 반드시 로그아웃 처리 후 해당 홈페이지를 종료하시기 바랍니다. 그렇지 않을 경우,
              해당 브라우저를 통해 ID, PASSWORD 등 회원의 정보가 타인에게 쉽게 유출될 위험이 있습니다.
            </p>
            <p>
              그 외 내부 관리자의 실수나 기술관리 상의 사고로 인해 개인정보의 상실, 유출, 변조, 훼손이 유발될 경우
              회사는 지체 없이 회원께 사실을 알리고 적절한 대책과 보상을 강구할 것입니다.
            </p>
          </div>
        </div>
        <div className={'section'}>
          <h4 className={'section__title'}>의견수렴 및 불만 처리</h4>
          <div className={'section__desc'}>
            <p>
              1. 회사는 회원과의 원활한 의사소통을 위해 고객센터 등 고객상담창구를 운영하고 있으며 회원께서 문의사항이
              있으실 경우 아래의 연락처로 문의하시면 언제든 성실한 답변을 받으실 수 있습니다.
            </p>
            <div>
              <p>개인정보 관련 고객센터</p>
              <p>
                개인정보처리담당자 : <a href={'mailto:help@onestoreads.co.kr'}>help@onestoreads.co.kr</a>
              </p>
              <p>사이버상담: 위 메일을 통해 상담원에게 질문을 하실 수 있습니다.</p>
            </div>
            <p>2. E-mail이나 팩스 및 우편을 이용한 상담은 접수 후 24시간 이내에 답변이 될 수 있도록 노력하겠습니다.</p>
            <p>
              3. 기타 개인정보 침해에 관한 상담이 필요한 경우에는 한국인터넷진흥원 개인정보침해신고센터, 경찰청
              사이버안전지킴이 등으로 문의하실 수 있습니다.
            </p>
            <div className={'call__wrapper'}>
              <p className={'title'}>개인정보침해신고센터</p>
              <p>전화 : 118</p>
              <p>
                URL :{' '}
                <a href={'http://privacy.kisa.or.kr'} target={'_blank'}>
                  http://privacy.kisa.or.kr
                </a>
              </p>
            </div>
            <div className={'call__wrapper'}>
              <p className={'title'}>대검찰청 사이버수사과</p>
              <p>전화 : (국번없이)1301</p>
              <p>
                URL :{' '}
                <a href={'www.spo.go.kr'} target={'_blank'}>
                  www.spo.go.kr
                </a>
              </p>
            </div>
            <div className={'call__wrapper'}>
              <p className={'title'}>경찰청 사이버안전지킴이</p>
              <p>전화 : (국번없이)182</p>
              <p>
                URL :{' '}
                <a href={'https://www.police.go.kr/www/security/cyber.jsp'} target={'_blank'}>
                  https://www.police.go.kr/www/security/cyber.jsp
                </a>
              </p>
            </div>
          </div>
        </div>
        <div className={'section'}>
          <h4 className={'section__title'}>개인정보관리 책임자 및 담당자</h4>
          <div className={'section__desc'}>
            <p>
              1. 회사는 회원의 개인정보보호를 매우 소중하게 생각하며, 회원의 개인정보가 훼손, 침해 또는 누설되지 않도록
              최선을 다하고 있습니다. 그러나 기술적인 보완조치를 했음에도 불구하고, 해킹 등 기본적인 네트워크상의
              위험성에 의해 발생하는 예기치 못한 사고로 인한 정보의 훼손 및 방문자가 작성한 게시물에 의한 각종 분쟁에
              관해서는 책임이 없습니다.
            </p>
            <p>
              2. 회원의 개인정보보호 관련 문의 시 고객센터에서 신속하고 성실하게 답변을 드리도록 하고 있습니다. 또한
              회원이 본 서비스의 개인정보보호 담당자와 연락을 원하실 경우 아래의 연락처 또는 E-mail로 연락을 주시면
              개인정보 관련 문의사항에 대하여 신속하고 성실하게 답변해 드리겠습니다. (케이티, 엘지는 삭제/이메일 수정)
            </p>

            <table className={'terms-table'}>
              <thead>
                <tr>
                  <th>구분</th>
                  <th>원스토어㈜</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    개인정보보호 책임자
                    <br />
                    (=개인정보보호 총괄책임자)
                  </td>
                  <td>
                    최우석 실장
                    <br />- 이메일 : <a href={'mailto:help@onestoreads.co.kr'}>help@onestoreads.co.kr</a>
                  </td>
                </tr>
                <tr>
                  <td>개인정보보호 담당자</td>
                  <td>
                    박윤혜 매니저
                    <br />- 이메일 : <a href={'mailto:help@onestoreads.co.kr'}>help@onestoreads.co.kr</a>
                    <br />- 전화번호 : 국번없이 1600-6573(유료)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className={'section'}>
          <h4 className={'section__title'}>광고성 정보 전송</h4>
          <div className={'section__desc'}>
            <p>1. 회사는 고객의 사전 동의 없이 영리목적의 광고성 정보를 전송하지 않습니다.</p>
            <p>
              2. 회사는 신상품이나 이벤트 정보안내 등 고객 지향적인 마케팅을 수행하기 위하여 광고성 정보를 E-mail으로
              전송하는 경우에는 광고성 정보 전송에 대한 고객의 사전 동의를 득하고 E-mail의 제목란 및 본문란에 아래와
              같이 고객이 광고성 정보임을 쉽게 알아 볼 수 있도록 조치합니다.
            </p>
            <p>
              E-mail의 제목란 : '(광고)'라는 문구를 제목란의 처음에 빈칸 없이 한글로 표시하고 이어서 E-mail 본문란의
              주요 내용을 표시합니다.
            </p>
            <p>
              3. 광고수신에 동의한 고객에게 팩스, 이동전화 문자메시지 전송 등 E-mail 이외의 방법을 통해 영리목적의
              광고성 정보를 전송하는 경우에도 전송자의 명칭을 표기하는 등 필요한 조치를 취합니다.
            </p>
          </div>
        </div>
        <div className={'section'}>
          <h4 className={'section__title'}>고지의무</h4>
          <div className={'section__desc'}>
            <p>
              현 개인정보처리방침은 2022년 11월 24일에 제정되었으며 정부의 정책 또는 보안기술의 변경에 따라 내용의 추가,
              삭제 및 수정이 있을 경우에는 개정 최소 7일 전부터 홈페이지의 '공지'란을 통해 고지할 것입니다.
            </p>
          </div>
        </div>
        <div className={'section'}>
          <h4 className={'section__title'}>부칙</h4>
          <div className={'section__desc'}>
            <p>본 운영정책은 2022년 11월 24일부터 시행됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsService;
