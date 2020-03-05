// 가장 기본인 곳에서 시작하는 라우터 모음
import express from "express";
import passport from "passport";
import routes from "../routes";
import { home, search } from "../controllers/videoController";
import {
  getJoin,
  getLogin,
  logout,
  postJoin,
  postLogin,
  githubLogin,
  postGithubLogIn,
  getMe
} from "../controllers/userController";
import { onlyPublic, onlyPrivate } from "../middlewares";
// ../을 쓰면 부모디렉토리로 나갈 수 있다 //

const globalRouter = express.Router();

// 아래의 방식으로 각 페이지에 띄울 파일이나 함수 정한다.
// 함수부분 보면, 각 Controller.js에 있는 함수들 가져온건데, vscode의 Auto import 기능을 사용한 것이다.
globalRouter.get(routes.join, onlyPublic, getJoin);
// join route에 post 접근 방식을 추가한다
// postJoin에서 입력한 값들을 next()에 해당하는 postLogin으로 전달한다
globalRouter.post(routes.join, onlyPublic, postJoin, postLogin);

globalRouter.get(routes.login, onlyPublic, getLogin);
// login routes에 post 접근 방식을 추가한다
globalRouter.post(routes.login, onlyPublic, postLogin);

globalRouter.get(routes.home, home);
globalRouter.get(routes.search, search);
globalRouter.get(routes.logout, onlyPrivate, logout);

// user가 github login 페이지 진입 시 userController의 githubLogin 함수 실행
globalRouter.get(routes.gitHub, githubLogin);
// githubLogin 함수가 정상적으로 실행되었다면 gitHubCallback route로 진입하며 github login이 진행되고, postGithubLogIn이 실행된다
globalRouter.get(
  routes.githubCallback,
  passport.authenticate("github", { failureRedirect: "/login" }),
  postGithubLogIn
);

// profile 눌렀을 때 들어오는 페이지에 대한 함수 (routes.js 파일의 me라는 url로 가고, userController.js의 getMe 함수 실행)
globalRouter.get(routes.me, getMe);

export default globalRouter;