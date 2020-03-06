// video Record 부분해 해당하는 파일 (main.js에 추가해줘야 한다!)

const recorderContainer = document.getElementById("jsRecordContainer");
const recordBtn = document.getElementById("jsRecordBtn");
const videoPreview = document.getElementById("jsVideoPreview");

// let 구문을 써서 변수를 등록하면, 여러 함수에서 해당 변수를 호출할 수 있다. (원래는 함수 내에서만 변수가 사용됨)
let streamObject;
let videoRecorder;

// 녹화된 영상
const handleVideoData = event => {
  const { data: videoFile } = event;
  // 링크를 만들고, 링크의 href는 우리가 얻은 videoFile을 가지고 만들어진 URL이다.(모든 동영상을 URL형태로 가져오니까!)
  const link = document.createElement("a");
  link.href = URL.createObjectURL(videoFile);
  // link에서 이 영상을 "recorded.webm"이라는 파일명으로 다운로드하게 될 거고(실제로 stop recording 버튼 누르면 자동으로 녹화한 영상 다운로드 할 수 있다), document.body에 link 추가.
  link.download = "recorded.webm";
  document.body.appendChild(link);
  // link를 클릭한 것으로 해서 해당 링크 클릭해서 다운로드 바로 되도록!
  link.click();
};

// 녹화 종료하는 기능을 가진 함수
const stopRecording = () => {
  videoRecorder.stop();
  recordBtn.removeEventListener("click", stopRecording);
  recordBtn.addEventListener("click", getVideo);
  recordBtn.innerHTML = "Start Recording";
  // 녹화를 종료하면, 녹화된 영상은 event.data에 Blobdata 형태로 저장된다.
  streamObject.getVideoTracks()[0].stop();
  // 녹화가 끝나면 웹캠 사용 종료하는 코드
};

// 녹화가 시작되는 함수
const startRecording = () => {
  // MediaRecorder()함수는 영상 녹화
  videoRecorder = new MediaRecorder(streamObject);
  videoRecorder.start(); // 녹화 시작
  videoRecorder.addEventListener("dataavailable", handleVideoData); // dataavailable은 레코딩이 다 끝나야 이벤트가 호출된다. 레코딩 중간에는 이벤트 호출이 안됨.
  recordBtn.addEventListener("click", stopRecording);
};

// 버튼 누르면 카메라로 영상이 보이게 하는 함수 (media device navigator mdn 검색하면 함수들 찾을 수 있다.)
const getVideo = async () => {
  try {
    // user가 지금 사용하고 있는 기기에서 미디어기능 사용(오디오, 비디오 사용) -> videoPreview에 srcObject로 해당 영상 보이게 해서, upload.pug의 jsVideoPreview 부분에 카메라로 찍히는 영상이 올라가게 됨. (단순히 영상 보이기만 함)
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { width: 1280, height: 720 }
    });
    videoPreview.srcObject = stream;
    // 우리가 우리 목소리 중복으로 안 듣게 하기 위해서
    videoPreview.muted = true;
    videoPreview.play();
    recordBtn.innerHTML = "Stop Recording";
    streamObject = stream;
    startRecording();
    // 즉, recordBtn누르면 getVideo 함수 실행 -> getVideo 함수 안의 startRecording 함수가 실행되면서 녹화 시작.
  } catch (error) {
    recordBtn.innerHTML = "😥Cannot Record";
  } finally {
    recordBtn.removeEventListener("click", getVideo);
  }
};

function init() {
  recordBtn.addEventListener("click", getVideo);
}

if (recorderContainer) {
  init();
}
