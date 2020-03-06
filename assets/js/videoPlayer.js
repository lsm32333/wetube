// videoPlayer.pug파일과 연관. 비디오 플레이어의 음량, play/pause/ 전체화면 등의 기능들을 구현하는 js파일

const videoContainer = document.getElementById("jsVideoPlayer"); // videoPlayer.pug 파일의 #jsVideoPlayer 부분

const videoPlayer = document.querySelector("#jsVideoPlayer video");
// 위의 형식을 써서 videoPlayer 변수를 선언하면, 다른 어떤 함수에서든 그 함수 안에서 videoPlayer 변수를 사용할 수 있다.
const playBtn = document.getElementById("jsPlayButton");
// videoPlayer.pug파일의 play 버튼에 아이디를 지정하고, 해당 아이디를 playBtn변수에 할당해준 것.
const volumeBtn = document.getElementById("jsVolumeBtn");
const fullScrnBtn = document.getElementById("jsFullScreen");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const volumeRange = document.getElementById("jsVolume");

const registerView = () => {
  const videoId = window.location.href.split("/videos/")[1];
  // window.location.href는, 현재 url주소인 "http://localhost:4001/videos/(비디오id)" 문자열인데, split함수로 /videos/를 기준으로 나눠서 그 뒷부분 (그러니까 결국 비디오id 부분)을 가져온 것!
  fetch(`/api/${videoId}/view`, { method: "POST" });
  // fetch함수를 쓰면, 해당 url을 접속한 것과 같은 효과를 낼 수 있다! (videoController.js와 apiRouter.js 보면, 해당 url 들어갔으면 view가 추가되는 함수 실행되게 함)
};

// play,pause 기능과 관련된 함수
function handlePlayClick() {
  // 정지상태였다면, play하고 / 아니면 정지한다.
  if (videoPlayer.paused) {
    videoPlayer.play();
    // innerHTML으로, playBtn부분을 바꿀 수 있는데, 이 부분은 document.getElementById로 인해 videoPlayer.pug의 #jsPlayButton부분과 연결되어 있다.
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
  } else {
    videoPlayer.pause();
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
  }
}

// mute, unmute 기능과 관련된 함수
function handleVolumeClick() {
  if (videoPlayer.muted) {
    // HTMLMediaElement 공식문서를 보면, muted 프로퍼티는 Read Only가 아니므로, 아래의 방식처럼 오버라이드가 가능하다. false, true로 조작 가능하다.
    videoPlayer.muted = false;
    volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    // unmute 눌렀을 때, 다시 이전의 볼륨크기로 슬라이드바가 돌아가게 해줌
    volumeRange.value = videoPlayer.volume;
  } else {
    volumeRange.value = 0;
    // 윗줄 코드는 뮤트 눌렀을 때, 볼륨조절 슬라이드바가 0이 되도록 한다.
    videoPlayer.muted = true;
    volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
  }
}

// full screen에서 다시 작게 만드는 함수
function exitFullScreen() {
  // 아이콘 다시 확장으로 바뀌고, 클릭했을 때 goFullScreen 실행되고, 전체화면에서 나가지도록!
  fullScrnBtn.innerHTML = '<i class="fas fa-expand"></i>';
  fullScrnBtn.addEventListener("click", goFullScreen);
  // 여러 브라우저에서 사용가능하게 하는 부분! (아직 여러 브라우저에서 full screen 관련 프로퍼티를 제대로 지원하지 않음)
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

// full screen과 관련된 함수
function goFullScreen() {
  // full screen은 프로퍼티가 없다. 그리고 크롬에서는 requestFullscreen 함수가 없기 때문에 webkit을 써서 실행해준다. / 실행시 아이콘 바꿔주고, 화면 크게 하는 이벤트리스너 없애준다.
  if (videoContainer.requestFullscreen) {
    videoContainer.requestFullscreen();
  } else if (videoContainer.mozRequestFullScreen) {
    videoContainer.mozRequestFullScreen();
  } else if (videoContainer.webkitRequestFullscreen) {
    videoContainer.webkitRequestFullscreen();
  } else if (videoContainer.msRequestFullscreen) {
    videoContainer.msRequestFullscreen();
  }
  // videoContainer(비디오 들어가는 부분)을 크게 함. 비디오 자체도 크게 해야 하는데, 그건 videoPlayer.scss에서 작업함!
  fullScrnBtn.innerHTML = '<i class="fas fa-compress"></i>';
  fullScrnBtn.removeEventListener("click", goFullScreen);
  fullScrnBtn.addEventListener("click", exitFullScreen);
}

// 비디오 시간 형식 나타내는 포맷
const formatDate = seconds => {
  const secondsNumber = parseInt(seconds, 10);
  let hours = Math.floor(secondsNumber / 3600);
  let minutes = Math.floor((secondsNumber - hours * 3600) / 60);
  let totalSeconds = secondsNumber - hours * 3600 - minutes * 60;
  if (hours < 10) {
    hours = `0${hours}`;
  }
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  if (seconds < 10) {
    totalSeconds = `0${totalSeconds}`;
  }
  return `${hours}:${minutes}:${totalSeconds}`;
};

// 현재 비디오 재생 시간을 얻기 위한 함수
function getCurrentTime() {
  const currentTimeString = formatDate(Math.floor(videoPlayer.currentTime));
  currentTime.innerHTML = currentTimeString;
}

// videoPlayer.duration으로 비디오 길이를 '초'단위로 가져오고, 이게 formatDate 함수 안에서 ~~:~~:~~ 형식으로 리턴됨. 이걸 pug파일에 넣어줌!
function setTotalTime() {
  const totalTimeString = formatDate(videoPlayer.duration);
  totalTime.innerHTML = totalTimeString;
  setInterval(getCurrentTime, 1000);
  // 매초마다 getCurrentTime 함수 실행해줌
}

// 비디오 끝났을 때, 시간 다시 00초로 돌리고 pause하는 함수
function handleEnded() {
  registerView();
  // 비디오 끝났을 때, registerView 함수 실행해서 view 수 1개 늘린다!
  videoPlayer.currentTime = 0;
  playBtn.innerHTML = '<i class="fas fa-play"></i>';
}

// 볼륨 조절 기능과 관련된 함수 (videoPlayer.volume 변수에다가 볼륨값 계속 저장함)
function handleDrag(event) {
  // event.target.value에서 조정값인 0~1까지 0.1단위로 바뀌는 값이 할당된다.
  const {
    target: { value }
  } = event;
  videoPlayer.volume = value;
  // value값에 따라 volumeBtn의 모양 달라지게 하는 부분
  if (value >= 0.6) {
    volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
  } else if (value >= 0.2) {
    volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
  } else {
    volumeBtn.innerHTML = '<i class="fas fa-volume-off"></i>';
  }
}

// videoContainer 안에서 자동 실행되는 기능들 모음
function init() {
  videoPlayer.volume = "0.5";
  // 클릭을 하면, handlePlayClick 함수를 실행하겠다.
  playBtn.addEventListener("click", handlePlayClick);
  volumeBtn.addEventListener("click", handleVolumeClick);
  fullScrnBtn.addEventListener("click", goFullScreen);
  // loadedmetadata는, 비디오가 완전히 로딩 될때까지 기다렸다가 setTotalTime을 실행한다는 의미!
  videoPlayer.addEventListener("loadedmetadata", setTotalTime);
  videoPlayer.addEventListener("ended", handleEnded);
  volumeRange.addEventListener("input", handleDrag);
}

// videoContainer라는 div 안에서만 init()함수 실행할 수 있게
if (videoContainer) {
  init();
}
