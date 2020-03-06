// api 라우터 하위의 라우터 모음

import express from "express";
import routes from "../routes";
import {
  postRegisterView,
  postAddComment
} from "../controllers/videoController";

const apiRouter = express.Router();

// 순서 중요

// registerView url(routes.js에서 볼 수 있다.)에 접근하면, 자동으로 postRegisterView(videoController.js에 있다) 함수가 실행됨. 이 함수는 자동으로 view를 하나 늘려줌! (단, 실제로 이 url은 어떤 것을 렌더링하지는 않음!)
apiRouter.post(routes.registerView, postRegisterView); // database에 변화가 필요없으면 get, 변화가 필요하면 post를 쓴다.
apiRouter.post(routes.addComment, postAddComment);

export default apiRouter;
