![image](https://github.com/TaeHyeongKwon/TaeHyeongBnb/blob/dev/img/taehyeongbnb.png?raw=true)

## 프로젝트 소개

C2C or B2C를 기반으로 개인 또는 기업간 공간 대여를 안전하게 중개해주는 서비스

## 설치

$ npm i

## 실행

$ npm run start

## 기술스택

TypeScript, NestJS, TypeOrm, MySql, JWT, Multer, AWS-S3, AWS-EC2

## ERD

![image](https://github.com/TaeHyeongKwon/TaeHyeongBnb/blob/dev/img/ERD.png?raw=true)

## ENV

- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME
- ACCESS_JWT_SECRET
- REFRESH_JWT_SECRET
- SERVER_PORT
- KTH_ACCESKEYID
- KTH_SECRETKEYID
- KTH_S3_BUCKET_NAME
- KAKAO_API_KEY
- CODE_REDIRECT_URI
- NAVER_API_ACCESS_KEY_ID
- NAVER_API_SECRET_KEY
- NAVER_SMS_SERVICE_ID
- SMS_CALLING_NUMBER
- M_SIGNUP_URI
- M_ACCESS_SECRET
- M_REFRESH_SECRET
- M_HASHING_SOLT
- M_LOGIN_URI
- M_REFRESH_URI
- EMAILADDRESS
- EMAILPASSWORD

## 프로세스

![image](https://github.com/TaeHyeongKwon/TaeHyeongBnb/blob/dev/img/process.png?raw=true)

## 기능과 기능에 따른 API 경로

| HTTP메소드 |          경로          |                      기능                       |              권한              |
| :--------: | :--------------------: | :---------------------------------------------: | :----------------------------: |
|    Post    |     /auth/sign-up      |                    회원가입                     |               x                |
|    Post    |      /auth/login       |                     로그인                      |          사용자 계정           |
|    Get     | /auth/kakao-login-page |                  카카오로그인                   |          카카오사용자          |
|    Post    |  /auth/refresh-token   |                accessToken재발급                |      사용자or카카오사용자      |
|    Post    |    /auth/send-email    |              이메일 인증번호 발송               |               x                |
|    Post    |    /auth/check-code    |              이메일 인증 번호 확인              |               x                |
|    Post    |  /manager/M_LOGIN_URI  |      관리자 계정생성(M_SIGNUP_URI는 env에)      |               x                |
|    Post    |  /manager/M_LOGIN_URI  |     관리자 계정 로그인(M_LOGIN_URI는 env에)     |          관리자 계정           |
|    Post    | /manager/M_REFRESH_URI | 관리자 accessToken재발급(M_REFRESH_URI는 env에) |          관리자 계정           |
|    Post    |         /host          |                호스트 등록 신청                 |          사용자 계정           |
|    Post    |     /host/send-sms     |           호스트 휴대폰 인증번호 발송           |          사용자 계정           |
|    Post    |    /host/check-sms     |             호스트 휴대폰 인증 확인             |          사용자 계정           |
|    Get     |       /host/list       |           호스트 등록신청 리스트 조회           |          관리자 계정           |
|    Put     |       /host/{id}       |                 호스트 인증하기                 |          관리자 계정           |
|    Get     |      /houses/list      |              숙소 매물 리스트 조회              |               x                |
|    Get     |      /houses/{id}      |               숙소 매물 상세 조회               |               x                |
|    Post    |        /houses         |               숙소 매물 등록하기                |   호스트 등록된 사용자 계정    |
|    Get     |  /houses/update/{id}   |        숙소 매물 수정하기(수정하러 가기)        | 해당 숙소를 등록한 사용자 계정 |
|    Put     |      /houses/{id}      |        숙소 매물 수정하기(수정완료 하기)        | 해당 숙소를 등록한 사용자 계정 |
|   Delete   |   /houses/image/{id}   | 숙소 매물 수정중 등록 되어있던 이미지 삭제하기  | 해당 숙소를 등록한 사용자 계정 |
|   Delete   |      /houses/{id}      |             숙소 매물 등록취소하기              | 해당 숙소를 등록한 사용자 계정 |
|    Post    |   /reservations/{id}   |               숙소 매물 예약하기                |      사용자or카카오사용자      |
|    Get     |    /reservations/my    |          사용자 예약 매물 리스트 조회           |      사용자or카카오사용자      |
|   Delete   |   /reservations/{id}   |                  예약 취소하기                  |      사용자or카카오사용자      |
|    Post    |      /review/{id}      |                  리뷰 작성하기                  |      사용자or카카오사용자      |
|    Get     |      /review/{id}      |                  리뷰 조회하기                  |               x                |
|    Post    |     /comment/{id}      |              리뷰에 댓글 작성하기               | 해당 숙소를 등록한 사용자 계정 |
