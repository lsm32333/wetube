import passport from "passport";
import routes from "../routes";
import User from "../models/User";

// user 관련 모델에 쓰이는 함수(로직) 모음 파일
// globalRouter.js, userRouter.js 파일에 있는 함수에 들어간다.

export const getJoin = (req, res) => {
    res.render("join", { pageTitle: "Join" });
};
export const postJoin = async(req, res, next) => {
    // req.body 안의 name, email, password, password2 가져오는 코드
    const {
        body: { name, email, password, password2 }
    } = req;
    // 아래 코드는 비밀번호 확인 올바른지 확인하는 코드. 안 맞으면 오류메세지(400)보내고, 다시 join 페이지로... 맞으면 홈화면으로 redirect
    if (password !== password2) {
        res.status(400);
        res.render("join", { pageTitle: "Join" });
    } else {
        // 새로운 사용자 등록한다. mongo 실행해서 db.users.find({}) 입력해보면 회원가입한 사용자들이 DB에 들어가 있는 걸 볼 수 있다.
        try {
            // user 변수에 name, email 등록
            const user = await User({
                name,
                email
            });
            // register 함수는 인자로 주는 pw 이용해서 새로운 인스턴스 만드는 함수
            await User.register(user, password);
            next();
        } catch (error) {
            console.log(error);
            res.redirect(routes.home);
        }
        // To Do : Log user in
    }
};


export const getLogin = (req, res) => res.render("login", { pageTitle: "Log In" });
// globalRouter.js 보면, postJoin 부분에, postJoin 다음에 postLogin 바로 실행해서, 가입 후 바로 로그인 절차 밟도록 한다.
// local(username과 pw이용하는 strategy) 방법으로, authenticate하고, 실패시에는 로그인화면으로, 성공시에는 홈화면으로 간다.
export const postLogin = passport.authenticate("local", {
    failureRedirect: routes.login,
    successRedirect: routes.home
});

// Github로 로그인하기 했을 때, 사용자를 깃헙으로 보내는 과정
export const githubLogin = passport.authenticate("github");

// Github로 로그인하기 했을 때, 깃허브에서 정보 받아오고 나서 사용자가 다시 우리 사이트로 돌아오는 과정을 처리하기 위한 함수 / passport.js 파일에 쓰인다 (인자는 공식문서 양식 그대로지만, 첫두번째 인자 안 쓰여서 _, __로 표시)
export const githubLoginCallback = async(_, __, profile, cb) => {
    // 깃허브에서 주는 정보는 profile 안의 _json 안에 있기 때문에, 이렇게 가져오면 됨
    const { _json: { id, avatar_url: avatarUrl, name, email } } = profile;
    try {
        // 깃헙에 등록된 사용자의 이메일과, 기존에 가입되어 있는 사람들의 이메일들을 비교해서 똑같은 사용자가 있는지 찾아줌
        const user = await User.findOne({ email });
        if (user) {
            // 만약 동일한 이메일을 쓰는 계정이 이미 있으면, id와 기존의 id 동일하게!
            user.githubId = id;
            user.save();
            return cb(null, user);
            // 에러없고, 가입자는 user가 되도록 cb함수 리턴
        } else {
            // 신규가입이 되는 경우
            const newUser = await User.create({
                email,
                name,
                githubId: id,
                avatarUrl
                // User.js 파일의 양식에 따라, profile안의 _json에서 받은 데이터들을 지정해서 user로 등록하는 과정 (githubID에는 id를 할당, avatarUrl에는 avatar_url을 할당)
            });
            return cb(null, newUser);
        }
    } catch (error) {
        return cb(error);
        // 에러가 난 cb 함수를 리턴해서, 사용자 인증에 오류가 있음을 passport가 알게 함
    }
};

// Github로 로그인 성공적으로 했을 때, /auth/github/callback 창으로 돌아와서 바로 home 화면으로 돌려보내주는 함수
export const postGithubLogIn = (req, res) => {
    res.redirect(routes.home);
};

// 로그아웃 누르면 로그아웃 처리하고, 홈화면으로 redirect
export const logout = (req, res) => {
    req.logout();
    res.redirect(routes.home);
};

// 로그인 한 상태에서 userDetail을 가게되면, user변수에다가 현재 로그인한 사용자(req.user)를 할당해준다. (그러므로, userDetail.pug 파일에서 user변수 사용가능) / globalRouter.js에서 쓰인다.
export const getMe = (req, res) => {
    res.render("userDetail", { pageTitle: "User Detail", user: req.user });
};

export const userDetail = async(req, res) => {
    const { params: { id } } = req;
    try {
        // id를 가지고 사용자를 찾아서, 그에 맞게 userDetail 보이게! / 만약 아무 id나 입력해버리면, 에러로 인식해서 home화면으로 간다
        const user = await (await User.findById(id)).populated("videos"); // videos가 들어있는 전체 객체를 user에 할당한다.
        res.render("userDetail", { pageTitle: "User Detail", user });
    } catch (error) {
        res.redirect(routes.home);
    }
};

// Edit Profile 관련 함수들 (userRouter.js에서 쓰인다.)
export const getEditProfile = (req, res) => res.render("editProfile", { pageTitle: "Edit Profile" });

export const postEditProfile = async(req, res) => {
    const {
        body: { name, email },
        file
    } = req;
    try {
        await User.findByIdAndUpdate(req.user.id, {
            name,
            email,
            // 이미지에 대해서 아무 동작 안하면, 그냥 원래 쓰던 req.user.avatarUrl 그대로 받아서 유지한다
            avatarUrl: file ? file.path : req.user.avatarUrl
        });
        res.redirect(routes.me);
    } catch (error) {
        res.redirect(routes.editProfile);
    }
};

export const getChangePassword = (req, res) => res.render("changePassword", { pageTitle: "Change Password" });
export const postChangePassword = async(req, res) => {
    const {
        body: {
            // changePassword.pug파일에서 들어오는 값들의 name부분. POST로 받아진 input들만 req.body 안에 받아진다! (우리가 미들웨어로 bodyParser를 쓰니까 body에 받아지는 거다!!)
            oldPassword,
            newPassword,
            newPassword1
        }
    } = req;
    try {
        if (newPassword !== newPassword1) {
            // 바꾸는 비번과 비번확인이 같지 않은 경우
            res.status(400);
            res.redirect(routes.changePassword);
            return;
            // 빈 return으로 else 없이 if 구문 종료
        }
        // 아래에서, passport-local-mongoose의 구문인 changePassword 쓴다. (위에서 변수로 등록한 이전비번, 새비번을 인지로 씀. 함수가 실행되면 자동으로 비밀번호를 바꿔줌!!)
        await req.user.changePassword(oldPassword, newPassword);
        res.redirect(`/users/${routes.changePassword}`);
    } catch (error) {
        res.redirect(400);
        res.redirect(`/users/${routes.changePassword}`);
    }
};