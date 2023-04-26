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
