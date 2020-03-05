// models 폴더 ===> mongodb에 들어갈 (데이터)파일들의 형태를 정의해주는 파일 모음


// Video.js 파일은, 동영상에 대한 형태를 저장.

import mongoose from "mongoose";

// schema ==> 형태가 나열되고, 각 형태별 특징이 그 안에 각각 정의된 형태
const VideoSchema = new mongoose.Schema({
    fileUrl: {
        // 동영상 파일을 저장하는게 아니고, 동영상 링크를 이용할 거다
        type: String,
        required: "File URL is required",
        // 링크가 없는 경우, 위와 같은 에러 메세지
    },
    title: {
        type: String,
        required: "Title is required"
    },
    description: String,
    views: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // comment와 video를 연결짓기 위한 부분. comments에는 array가 오고, 그 안에서 configuration 이루어짐
    // 모든 comment의 ID를 array에 추가해서 비디오와 연결해줌
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        // reference는 파일 이름과 같아야 함.
        ref: "Comment"
    }],
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

// 모델 정의 (모델명, schema)  ==> schema 이용
const model = mongoose.model("Video", VideoSchema);

export default model
// init.js에서 import 하자