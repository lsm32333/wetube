import multer from "multer";
import routes from "./routes";

// multer 이용하는 부분 (어느 경로(url)에 만들지)
const multerVideo = multer({ dest: "uploads/videos/" });
const multerAvatar = multer({ dest: "uploads/avatars/" });

export const localsMiddleware = (req, res, next) => {
  res.locals.siteName = "WeTube";
  res.locals.routes = routes; // routes.js 파일을 routes변수에 저장, 이 변수를 글로벌하게 사용가능 -> pug파일에서도 자유롭게 사용 가능!
  res.locals.loggedUser = req.user || null; // loggedUser 변수에 passport가 회원가입할 때 자동으로 req에 올려준 로그인한 사용자정보들을 저장함/ 없으면 빈 object -> 이 변수들 역시 글로벌하게 사용 가능 (pug 파일에서도 읽어짐)
  next();
};
// 변수를 만들고, 이를 글로벌하게 사용가능하게 하는 미들웨어에 쓰이는 파일

// 로그아웃 상태에서만 접근가능한 페이지들 정하는 데 쓰이는 미들웨어 (req.user가 있으면 로그인 된 상태) / globalRouter.js에 쓰인다
export const onlyPublic = (req, res, next) => {
  if (req.user) {
    res.redirect(routes.home);
  } else {
    next();
  }
};

// 로그인 상태에서만 접근가능한 페이지들 정하는 데 쓰이는 미들웨어 / user, videoRouter.js에서 볼 수 있다.
export const onlyPrivate = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect(routes.home);
  }
};

// upload.pug에서 videoFile이 name인 부분과 연결. 하나씩만 업로드 가능
export const uploadVideo = multerVideo.single("videoFile");
export const uploadAvatar = multerAvatar.single("avatar");
