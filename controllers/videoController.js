// video 관련 모델에 쓰이는 함수(로직) 모음 파일
// globalRouter.js, videoRouter.js에 있는 함수들에 들어간다.

import routes from "../routes";
import Video from "../models/Video";
import Comment from "../models/Comment";

// render함수를 쓰면, views 폴더의 home.pug파일(해당하는)을 찾아서 해당 html을 보여주고, export로 인해 해당 pug파일에 변수들을 전달해준다.!!!
export const home = async(req, res) => {
    // async & await => 한번에 두 내용 처리하지 않고, 하나 끝날때까지 기다리도록 함 (에러가 나도 끝난 것이기 때문에 다음 단계 실행이 됨 -> 에러를 잡지는 못함)
    // try 구문으로 에러난 경우는 에러 보여주도록!
    try {
        // models폴더의 Video.js에서 모든 동영상들을 가져와 보여주는 부분!! async와 await 때문에 이 과정이 끝나야 아래쪽의 render가 실행됨
        const videos = await Video.find({}).sort({ _id: -1 });
        // sort로, id역순으로 정렬. 최신 비디오가 먼저 나오게 됨!
        res.render("home", { pageTitle: "Home", videos });
    } catch (error) {
        console.log(error);
        res.render("home", { pageTitle: "Home", videos: [] });
    }
};
// 두번째 객체인 {}안의 내용 보면, pageTitle 변수에 저장할 수 있다. 이 변수는 home.pug에서만 global하게 쓰이는 변수이다. (각 템플릿마다 이렇게 전역적 변수를 설정해줄 수 있다.)

export const search = async(req, res) => {
    const {
        query: { term: searchingBy }
    } = req;
    // 위 코드의 의미는, searchingBy라는 변수에 req.query.term을 저장한 것과 같다. 뭔가 검색했을 때, url에 검색한 단어(term)이 뜨도록 해준다.
    let videos = [];
    try {
        // 제목에 검색한 단어(searchingBy 변수)가 들어가고, 옵션으로 대소문자 구분 없이(insensitive) 동영상을 찾음. 찾아진 동영상들은 videos 리스트에 추가됨.
        // $regex, $options는 mongoDB에서 지원하는 정규표현식 기능이다
        videos = await Video.find({ title: { $regex: searchingBy, $options: "i" } });
    } catch (error) {
        console.log(error);
    }
    res.render("search", { pageTitle: "Search", searchingBy, videos });
    // searchingBy, videos 변수도 search.pug에 전달함
};

// get은 url에 드러남. 그래서 렌더링만 해줌
// post에서 내부적으로 처리해야 할 것들 처리해주고, 업데이트하고, redirect로 마무리

export const getUpload = (req, res) => res.render("upload", { pageTitle: "Upload" });
export const postUpload = async(req, res) => {
    const {
        body: { title, description },
        file: { path }
        // multer에 의해 path 변수에 해당 파일의 경로가 저장됨
    } = req;
    // newVideo라는 변수에 필요한 변수들 저장
    const newVideo = await Video.create({
        // models 폴더의 Video.js의 schema와 형태가 같기 때문에, 자동으로 mongoDB에 저장이 된다!!
        fileUrl: path,
        title,
        description,
        // creator는 로그인한 해당 유저가 됨
        creator: req.user.id
    });
    req.user.videos.push(newVideo.id);
    req.user.save();
    // newVideo.id를 videos array에 추가하고, 저장한다.
    res.redirect(routes.videoDetail(newVideo.id));
    // 업로드한 영상의 id 값을 통해 해당 비디오의 videoDetail로 redirect
}

// routes.js 참고하면, id 별로 다른 url을 가지게 할 수 있다.
// id별로 다른 비디오에 들어가기 위해서는, 아래의 양식처럼 id를 가지고 비디오를 찾고, 그에 맞는 비디오를 띄워주는 페이지로 들어가야 한다! (req.params.id / try catch 구문 사용)
export const videoDetail = async(req, res) => {
    const {
        params: { id }
    } = req;
    // routes.js에서 videoDetail보면, url로부터 id 변수를 받는다. 이 변수는 req.params.id이므로, 이를 위 코드로 적은 것이다
    try {
        // populate함수는, 인자로 오는 objectId(Video.js파일 보면, creator는 id가 할당된다)에 대해, 그에 해당하는 전체 객체 (creator id가 들어가있는 전체)를 불러온다
        const video = await (await Video.findById(id).populate("creator")).populate("comments");
        res.render("videoDetail", { pageTitle: video.title, video });
        // 위에서 만든 video 변수 찾고나서, video변수를 videoDetail.pug 템플릿에 전달
    } catch (error) {
        console.log(error);
        res.redirect(routes.home);
        // 에러가 뜨면, 에러 보고 home화면으로 redirect
    }
};

export const getEditVideo = async(req, res) => {
    // id에 해당하는 editVideo 페이지로 렌더링
    const {
        params: { id }
    } = req;
    try {
        // 비디오가 찾아지면, editVideo.pug html로 이동, 페이지 제목 아래처럼 + video 변수 전달
        const video = await Video.findById(id);
        // 비디오 작성자와 현재 로그인한 유저가 같지 않으면, error를 발생시켜, 자동적으로 home화면으로 redirect 되도록! (추가로, 여기서는 populate 안 썼기 때문에 그냥 video.creator만 해도 id를 의미하게 됨!)
        if (video.creator !== req.user.id) {
            throw Error();
        } else {
            res.render("editVideo", { pageTitle: `Edit ${video.title}`, video });
        }
    } catch (error) {
        res.redirect(routes.home);
    };
    res.render("editVideo", { pageTitle: "Edit Video" });
};
export const postEditVideo = async(req, res) => {
    // 내용들에 대해 수정이 이루어지는 부분
    const {
        params: { id },
        body: { title, description }
    } = req;
    try {
        // findOneAndUpdate 함수로, id를 찾고, title과 description을 업데이트 한다. / 수정을 하고 나서는 videoDetail로 redirect해서 수정 된 걸 확인한다!
        // 이런 류의 함수를 보려면, mongoosejs.com의 documents 중에 query 보면 됨
        await Video.findOneAndUpdate({ _id: id }, { title, description });
        res.redirect(routes.videoDetail(id));
    } catch (error) {
        res.redirect(routes.home);
    }
};

export const deleteVideo = async(req, res) => {
    const {
        params: { id }
    } = req;
    try {
        // edit video와 마찬가지로, 비디오 작성자와 로그인한 사용자가 다른 경우에는 비디오 삭제 못하도록!
        const video = await Video.findById(id);
        if (video.creator !== req.user.id) {
            throw Error();
        } else {
            // findOneAndRemove함수로, 해당 id 동영상을 DB에서 삭제한다
            await Video.findOneAndRemove({ _id: id });
        }
    } catch (error) {
        console.log(error);
    }
    res.redirect(routes.home)
};

// api와 관련된 함수 (apiRouter.js에 쓰인다) => view 숫자 올리기 위한 함수
export const postRegisterView = async(req, res) => {
    const { params: { id } } = req;
    // 누군가 postRegisterView 함수를 post하게 되는 url로 가면, id로 비디오를 찾고, 그 이후에 views 숫자를 1 늘려주고 저장한다. (videoDetail.pug를 보면, 각 video.views에 따라 자동으로 view 숫자가 보이게 된다)
    try {
        const video = await Video.findById(id);
        video.views += 1;
        // save()나, create() 함수를 사용하면 DB에 저장이 됨!
        video.save();
        res.status(200);
    } catch (error) {
        res.status(400);
    } finally {
        res.end();
        // 서버와의 통신을 종료함
    }
}

// 댓글달기 기능을 위한 API용 함수
export const postAddComment = async(req, res) => {
    const {
        params: { id },
        body: { comment },
        user
    } = req;
    try {
        const video = await Video.findById(id);
        const newComment = await Comment.create({
            text: comment,
            creator: user.id,
        });
        // video.comments는 Video.js에 정의되어 있다.
        video.comments.push(newComment.id);
        video.save();
    } catch (error) {
        res.status(400);
    } finally {
        res.end();
    }
}