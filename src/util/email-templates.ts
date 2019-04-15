export interface ILocalVar {
  name: string;
  course: string;
  amount: string;
  vbank_name: string;
  vbank_date: string;
  vbank_num: string;
}

interface IEmailTemplates {
  ready: (localVar: ILocalVar) => object;
  paid: (localVar: ILocalVar) => object;
  [key: string]: Function;
}

class EmailTemplates implements IEmailTemplates {
  [key: string]: Function;
  ready(localVar: ILocalVar) {
    return {
      subject: `[스터디스테이츠] 스터디 신청 완료`,
      html: `
        <h2>${localVar.name}님, 스터디스테이츠 스터디를 신청해주셔서 감사합니다.</h2>
        <br />
        <p>신청 스터디: ${localVar.course}</p>
        <br />
        <p>(가상)계좌번호: ${localVar.vbank_name} ${localVar.vbank_num}</p>
        <p>결제 금액: ${localVar.amount}원</p>
        <p>결제 기한: ${localVar.vbank_date}</p>
        <br />
        <br />
        <p>결제 기한 내 결제를 완료해 주시고, 결제 완료 후 추가 안내 메일이 나갈 예정입니다.</p>
        <p>궁금하신 사항은 스터디스테이츠 웹사이트에 실시간 채팅 기능이나 studystates@codestates.com 으로 문의주세요.</p>
        <br />
        <hr />
        <br />
        <strong>StudyStates 연락처 (02-3482-8881 / studystates@codestates.com)</strong>
      `
    };
  }

  paid(localVar: ILocalVar) {
    return {
      subject: `[스터디스테이츠] 스터디 결제 완료`,
      html: `
        <h2>${localVar.name}님, 신청해주신 스터디스테이츠 스터디 결제가 완료되었습니다.</h2>
        <br />
        <p>신청 스터디: ${localVar.course}</p>
        <br />
        <p>스터디 시작전에 함께 이야기 나눌 수 있는 슬랙에 초대드릴 예정입니다. 기입해주신 이메일을 잘 확인해주시기 바랍니다.</p>
        <p>궁금하신 사항은 스터디스테이츠 웹사이트에 실시간 채팅 기능이나 studystates@codestates.com 으로 문의주세요.</p>
        <br />
        <hr />
        <br />
        <strong>StudyStates 연락처 (02-3482-8881 / studystates@codestates.com)</strong>
      `
    };
  }
}

export default EmailTemplates;
