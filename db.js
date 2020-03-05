// init.js에서 이 파일 import하면 DB가 실행됨

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
// dotenv.config() 함수로 인해, .env 파일 다 가져오고, 모든 변수들을 process.env에 저장함 / dotenv를 import하면, dotenv.config()도 해주면 됨


// connect는 문자열로 된 URL(from .env파일)을 인자로 받음. 터미널에 mongod 입력해서 포트넘버 얻고, 뒤에는 database 이름 적어줌
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useFindAndModify: false
});

const db = mongoose.connection;

// 성공적으로 연결 되었는지 또는 에러가 있는지 확인하는 함수
const handleOpen = () => console.log("✅ Connected to DB");
const handleError = (error) => console.log(`❌ Error on DB Connection:${error}`);

// 한번 실행하는 함수, once
db.once("open", handleOpen);
db.on("error", handleError);