/*
 * Emoji
 * "Invalid. Emojis are not allowed"
 * */
export const REGEXP_EMOJI =
  /[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff]/g;

export const REGEXP_SPECIAL_CHAR = /[@.()\-_~`!#$%^&*+=\[\]\\';,/{}|":<>?]/g;

export const REGEXP_TITLE = /^([a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣_\- ]+)$/;

/*
 * alphaNumericHyphen
 * "Invalid. Only alphabet, numbers and -, _ are allowed."
 * */
export const REGEXP_ALPHA_NUM_HYPHEN = /^[a-zA-Z0-9_-]*$/;

/*
 * lowercaseAlphaNumeric
 * "Invalid. Only lower alphabet, numbers and -, _ are allowed."
 * */
export const REGEXP_LOWER_ALPHA_NUM_HYPHEN = /^[a-z0-9_-]*$/;

/*
 * advertiserDomain
 * "Please don't include 'http' or 'https' protocol and hostname such as 'www.'."
 * */
export const REGEXP_ADVERTISER_DOMAIN = /([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;
export const REGEXP_ADVERTISER_DOMAIN_WWW = /^(?!(:\/\/|www\.))([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;

/*
 * url
 */
export const REGEXP_URL = /^http[s]?\:\/\//i;

/*
 * couponName
 */
export const REGEXP_COUPON = /^[ㄱ-ㅎ가-힣a-zA-Z0-9-_\.\s]+$/;

/*
 * 숫자
 */
export const REGEXP_NUMBER = /^[0-9]*$/;

/*
 * 영문(대소), 한글, 숫자, 띄어쓰기
 */
export const REGEXP_EN_KR_NUM_SPACE = /^[a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣0-9\s]+$/;
/*
 * 영문(대소), 한글, 띄어쓰기
 */
export const REGEXP_EN_KR_SPACE = /^[a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣\s]+$/;
/*
 * 영문(대소), 한글, 숫자, -, 띄어쓰기
 */
export const REGEXP_EN_KR_NUM_HYPHEN_SPACE = /^[a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣0-9-\s]+$/;
/*
 * 이메일
 */
// 영문(대소), 숫자, -, _, ., @
export const REGEXP_EMAIL = /^[0-9a-zA-Z-_\.]*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;
//export const REGEXP_EMAIL = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;
/*
 * 영문(대소), 숫자 특수문자
 */
export const REGEXP_EN_NUM_SPECIAL = /^[a-zA-Z0-9~!@#$%^&*()_+|<>?:{}]+$/;
/*
 * 영문(소문자), 숫자
 */
export const REGEXP_EN_NUM = /^[a-z0-9]+$/;
/*
 * 영문(대소), 숫자, 특수문자 조합
 */
export const REGEXP_EN_NUM_SPECIAL_COMBINATION = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[~!@#$%^&*()_+|<>?:{}]).{8,20}$/;

/*
 * 영문(대소), 한글, 숫자, -, _, 띄어쓰기
 */
export const REGEXP_EN_KR_NUM_HYPHEN_UNDERBAR_SPACE = /^[a-zA-Zㄱ-ㅎㅏ-ㅣ_|가-힣0-9-\s]+$/;
