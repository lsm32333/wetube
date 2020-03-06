// URL 모아둔 파일
// 이 파일 import해서 다른 파일들에서 url을 통일되고 안 헷갈리게 가져간다!
// routers 폴더에도 해당 라우터 다루는 내용이 있어야 하고, app.js에도 큰 줄기가 있어야 한다.

// Global
const HOME = "/";
const JOIN = "/join";
const LOGIN = "/login";
const LOGOUT = "/logout";
const SEARCH = "/search";

// Users

const USERS = "/users";
const USER_DETAIL = "/:id";
const EDIT_PROFILE = "/edit-profile";
const CHANGE_PASSWORD = "/change-password";
const ME = "/me";

// Videos

const VIDEOS = "/videos";
const UPLOAD = "/upload";
const VIDEO_DETAIL = "/:id";
const EDIT_VIDEO = "/:id/edit";
const DELETE_VIDEO = "/:id/delete";
// :id의 의미는, url로부터 해당 칸에 들어오는 내용을 id라는 이름의 변수로 받겠다는 것! 아래의 routes에서 id들은 다 함수처리 되어, 숫자로 표시된다
// id별로 각기 다른 url로 들어가기 위한 부분 시작!

// Github 로그인 관련 url
const GITHUB = "/auth/github";
const GITHUB_CALLBACK = "/auth/github/callback";

// API (server와 통신하기 위한 URL) => user는 이 URL에 접근도 불가능하고, 이 URL은 어떤 것도 rendering하지 않는다. (단순히 post 동작만을 하기 위해 만든 url이다)
const API = "/api";
const REGISTER_VIEW = "/:id/view";
// 즉, 누군가 동영상보면, 렌더링 아무것도 안하고 그냥 view 숫자만 올리기 위한 api
const ADD_COMMENT = "/:id/comment";

const routes = {
  home: HOME,
  join: JOIN,
  login: LOGIN,
  logout: LOGOUT,
  search: SEARCH,
  users: USERS,
  // 아래는 함수를 만든 것. id값을 URL에 ':id/'가 아니라, id 값 (숫자)를 띄우기 위해서 함수로 만든 것
  // 함수로 만들었으면, ~~Router.js 파일에도 함수로 반드시 수정해줄 것!
  userDetail: id => {
    if (id) {
      return `/users/${id}`;
    }
    return USER_DETAIL;
  },
  editProfile: EDIT_PROFILE,
  changePassword: CHANGE_PASSWORD,
  videos: VIDEOS,
  upload: UPLOAD,
  videoDetail: id => {
    if (id) {
      return `/videos/${id}`;
    }
    return VIDEO_DETAIL;
  },
  editVideo: id => {
    if (id) {
      return `/videos/${id}/edit`;
    }
    return EDIT_VIDEO;
  },
  deleteVideo: id => {
    if (id) {
      return `/videos/${id}/delete`;
    }
    return DELETE_VIDEO;
  },
  gitHub: GITHUB,
  githubCallback: GITHUB_CALLBACK,
  me: ME,
  api: API,
  registerView: REGISTER_VIEW,
  addComment: ADD_COMMENT
};

export default routes;
