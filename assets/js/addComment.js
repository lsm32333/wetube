import axios from "axios";


const addCommentForm = document.getElementById("jsAddComment");
const commentList = document.getElementById("jsCommentList");
const commentNumber = document.getElementById("jsCommentNumber");

const increaseNumber = () => {
    // videoDetail.pug 보면, commentNumber는 문자열이므로, 숫자로 바꿔주고 +1 해준다.
    commentNumber.innerHTML = parseInt(commentNumber.innerHTML, 10) + 1
}

// 댓글 달면, 새로고침 전이라도 fake comment가 달려서 갯수가 한개 늘어나게 해주는 함수
const addComment = (comment) => {
    // html의 li, span을 변수로 불러옴.
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.innerHTML = comment;
    li.appendChild(span);
    commentList.prepend(li); //prepend는 가장 첫번째에 추가해준다
    increaseNumber();
}

const sendComment = async(comment) => {
    const videoId = window.location.href.split("/videos/")[1];
    // window.location.href는, 현재 url주소인 "http://localhost:4000/videos/(비디오id)" 문자열인데, split함수로 /videos/를 기준으로 나눠서 그 뒷부분 (그러니까 결국 비디오id 부분)을 가져온 것!
    const response = await axios({
        url: `/api/${videoId}/comment`,
        method: "POST",
        data: {
            comment
            // req.body.comment 변수로 데이터 보내준다! (videoController.js 참고)
        }
    });
    // axios이용해서 해당 url에 접속한 것처럼 한다. 그러면 자동으로 api가 돌아가겠지...
    // 정상적으로 댓글 달릴때만 addComment 함수 실행한다.
    if (response.status === 200) {
        addComment(comment);
    }
};

const handleSubmit = event => {
    event.preventDefault();
    // 아래 코드로, addCommentForm(실제로는 videoDetail.pug에서 #jsAddComment인 form)안의 input에 입력되는 값을 변수로 지정함.
    const commentInput = addCommentForm.querySelector("input");
    const comment = commentInput.value;
    sendComment(comment);
    // 보내고 나면 다시 commentInput 변수 초기화해준다.
    commentInput.value = "";
};

function init() {
    addCommentForm.addEventListener("submit", handleSubmit);
}

if (addCommentForm) {
    init();
}