# enkor-bnb

## 과제 제출 방식

- develop 브랜치에 PR 해주세요.

## 필수 스택

- Node.js 14 이상
- Express.js or Nest.js
- MySQL or Sqlite
- Typescript or Javascript

## 구현 기능

숙박 플랫폼을 서비스하기 위한 REST API를 구현해야 합니다.

- 회원 기능
  - 회원 가입
  - 로그인
  - 회원 가입 및 로그인은 이메일을 사용합니다.
  - 비밀번호는 암호화 되어야 합니다.
  - JWT만을 이용해 인증기능이 구현되어야 합니다.
- 매물 조회 기능
  - 매물 정보: 타이틀, 주변대학, 매물 타입, 이미지 URL, 설명, 주소, 가격.
  - 사용자는 매물 리스트를 볼 수 있어야 합니다. 페이지네이션이 필요합니다. 리스트에는 타이틀, 주변대학, 이미지, 매물 타입, 가격이 나옵니다.
  - 사용자는 상품 리스트를 가격순으로 정렬할 수 있습니다.
  - 사용자는 상품 상세 정보를 볼 수 있어야 합니다.

## 구현 시 우대사항

- 숙박 예약
  - 사용자는 숙박 시설을 예약할 수 있어야 합니다.
  - 사용자는 예약한 내용을 확인할 수 있어야 합니다.

## 우대사항

- Typescript 사용
- 유닛 테스트
- 문서화

---

## 설치

$ npm i

## 실행

$ npm run start:dev

## 테스트

$ npm run test:watch

## 기술스택

TypeScript, NestJS, TypeOrm, MySql, JWT

## ERD

![image](https://github.com/TaeHyeongKwon/be-test/blob/TaeHyeong/img/enkor-erd.png?raw=true)

## ENV

- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME
- ACCESS_JWT_SECRET
- REFRESH_JWT_SECRET

## API 경로

| HTTP메소드 |        경로         |             기능             |
| :--------: | :-----------------: | :--------------------------: |
|    Post    |    /auth/sign-up    |           회원가입           |
|    Post    |     /auth/login     |            로그인            |
|    Post    | /auth/refresh-token |      accessToken재발급       |
|    Get     |    /houses/list     |    숙소 매물 리스트 조회     |
|    Get     |    /houses/{id}     |     숙소 매물 상세 조회      |
|    Post    | /reservations/{id}  |      숙소 매물 예약하기      |
|    Get     |  /reservations/my   | 사용자 예약 매물 리스트 조회 |
