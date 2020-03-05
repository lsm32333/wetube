import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import passport from "passport";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import { localsMiddleware } from "./middlewares";
import routes from "./routes";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import globalRouter from "./routers/globalRouter";
// 자식 디렉토리로 갈때는 ./를 쓴다   .//는 부모디렉토리

// express import한 걸 상수로 변환
const app = express();

// 쿠키를 저장하기위한 저장소 변수 등록
const CookieStore = MongoStore(session);

// 각종 middleware들 (순서 중요함)
app.use(helmet()); // 보안 관련
app.set("view engine", "pug"); // 원래는 view engine 따로 없는데, pug사용하기 위해 등록!
app.use("/uploads", express.static("uploads")); // 디렉토리에서 파일을 보내주는 미들웨어 (middlewares.js 보면, multer의 dest가 uploads/videos인데, uploads라는 기본 url이 없으니까 둔 것!)
app.use("/static", express.static("static")); // static 폴더를 내 서버에 등록한 것.
app.use(cookieParser()); // 쿠키 전달 관련
app.use(bodyParser.json()); // 사용자 정보 전달한 거 검사 (예를들어, 회원가입 시 입력하는 정보들을 consol.log(req.body)하면 볼 수 있음)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev")); // application에서 일어나는 일 모두 logging
app.use(session({
    secret: process.env.COOKIE_SECRET, // .env파일에 저장한 랜덤문자열을 secret인자로 등록해준다. (쿠키 암호화에 쓰이는 문자열이 된다)
    resave: true,
    saveUninitialized: false, // 이 두개는 공식문서 참고
    store: new CookieStore({ mongooseConnection: mongoose.connection }) // 쿠키를 mongoose 이용하여 mongoDB에다가 저장한다. (그냥 세션에 두면, 서버 초기화할 때마다 날라감)
})); // passport 이전에 app.use해준다. express로 보내진 cookie를 가지고 있을 수 있는 곳이 session이다. (로그인을 하고나면, req.user 변수에 해당하는 쿠키 암호화되어 할당된다!)
app.use(passport.initialize()); // 전달받은 쿠키 초기화하고, 스스로 쿠키 들여다보면서 req에다가 해당하는 사용자 정보 올려줌
app.use(passport.session()); // 사용자 정보에 해당하는 것들을 session에 저장

// local 변수들을 global하게 쓰기 위한 middleware
app.use(localsMiddleware); // middlewares.js에 있는 변수들을 사용하겠다

// Routers
app.use(routes.home, globalRouter);
app.use(routes.users, userRouter);
// 누군가 user에 들어가면, userRouter가 실행된다. 자세한 건 router.js의 userRouter보면 나오겠지//
app.use(routes.videos, videoRouter);
// routes.js에서 import해온 url들은 넣은 걸 볼 수 있다. routes.videos에서.//
app.use(routes.api, apiRouter);

export default app;
// 다른 파일에서 import할때, app들어간 덩어리를 다 주겠다는 뜻//