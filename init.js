import "@babel/polyfill";
import "core-js";
import dotenv from "dotenv";
import "./db";
import app from "./app";
// 아래는 MongoDB에 들어갈 model들을 전체 프로젝트에 등록하기 위해 import 한 것!!! (app이 실행될 때, model들도 같이 실행된다)
import "./models/Video";
import "./models/Comment";
import "./models/User";

dotenv.config();

const PORT = process.env.PORT || 4000;

const handleListening = () =>
  console.log(`✅ listening on: http://localhost:${PORT}`);

// localhost 실행하는 함수
app.listen(PORT, handleListening);
