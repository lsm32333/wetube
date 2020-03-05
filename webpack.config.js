// 들어오는 파일들에 대해 컴파일(컴터가 알아들을 수 있게 변환)을 어떻게 해야하는지 webpack에 다 가르쳐줘야 한다!! 그래야 변환을 똑바로 하지!!
// 서버 관련된 코드랑은 전혀 상관없다
// 옛날 JS 문법으로 써야한다 (즉, import 구문 못 씀)

// path, Extract 등을 import한 것
const path = require("path");
const ExtractCSS = require("extract-text-webpack-plugin");
const autoprefixer = require("autoprefixer");

// webpack 실행 시 mode 관련 변수
const MODE = process.env.WEBPACK_ENV;

// entry는 어떤 파일이 들어오는지, output은 어디로 내보내는지에 관한 변수 / resolve는 아래 인자들을 합쳐서 주소로 만든다. / join은 2개 합침
const ENTRY_FILE = path.resolve(__dirname, "assets", "js", "main.js");
// path구문을 썼기 때문에, 절대경로(컴퓨터상에서 경로 나타내는 것과 같이, users/documents/wetube/assets/js/main.js 라는 것.) 위와 같은 방식으로 경로 적어줌

const OUTPUT_DIR = path.join(__dirname, "static");


// 변수 간단히... output에는 디렉토리(path), 파일이름(filename) 2개가 와야 함.
const config = {
    entry: ["@babel/polyfill", ENTRY_FILE],
    mode: MODE,
    // 특정 module을 만났을 때, 적용되는 rule. (rule은 array 형태다)
    module: {
        rules: [{
                test: /\.(js)$/,
                use: [{
                    loader: "babel-loader"
                }]
            },
            {
                // 정규표현식으로, 들어온 파일이 .scss인지 확인
                test: /\.(scss)$/,
                // 확인 후, 1)scss파일을 css파일로 바꾸고, 2) css파일의 텍스트 부분만 추출하고, 3) 하나의 css파일로 모으는 것.
                // extract 함수는 아래쪽부터 먼저 실행한다!!!
                // 아래 모든 loader들 다 npm install 해주자!
                use: ExtractCSS.extract([{
                        // 마무리
                        loader: "css-loader"
                    },
                    {
                        // 아래에서 올라온 css파일을, plugin에 맞게 변환. (주로 호환성에 대해)
                        loader: "postcss-loader",
                        options: {
                            plugins() {
                                // 시중의 99.5%의 브라우저와 호환 가능
                                return [autoprefixer({ overrideBrowserslist: "cover 99.5%" })];
                            }
                        }
                    },
                    {
                        // scss, sass파일을 css파일로 바꿔주는 loader
                        loader: "sass-loader"
                    }
                ])
            }
        ]
    },
    output: {
        path: OUTPUT_DIR,
        filename: "[name].js"
    },
    plugins: [new ExtractCSS("styles.css")]
};

module.exports = config;