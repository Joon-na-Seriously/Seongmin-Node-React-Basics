const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const { auth } = require('./middleware/auth');
const { User } = require("./models/User");

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended:true }));

// application/json
app.use(bodyParser.json());
app.use(cookieParser());


const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true, useFindAndModify:false
}).then(() => console.log('MongoDB Connected..'))
.catch(err => console.log(err))

app.get('/', (req, res) => {res.send('Hello World! 하위하위')})

app.post('/api/users/register', (req, res) => {
  // 회원가입 때 필요한 정보들을 client에서 가져오면
  // 그것들을 데이터베이스에 넣어준다

  const user = new User(req.body) 

  user.save((err,userInfo)=>{
    if(err) return res.json({success:false, err})
    return res.status(200).json({
      success: true
    })
  })
})

app.post('/api/users/login', (req, res)=>{

  // 요청된 이메일을 DB에 있는지 찾기
  User.findOne({ email: req.body.email }, (err, user) => {
    if(!user){
      return res.json({
        loginSuccess: false,
        message: "입력하신 이메일에 해당하는 유저가 없습니다"
      })
    }
    
    // 요청된 이메일이 DB에 있다면, 비밀번호가 맞는지 확인  
    user.comparePassword(req.body.password, (err, isMatch) => {
      if(!isMatch)
        return res.json({loginSuccess: false, message: "비밀전호가 틀렸습니다."});
      
      // 비밀번호까지 맞다면 토큰 생성
      user.generateToken((err, user) => {
        if(err) return res.status(400).send(err);
        
        // 토큰을 저장 -> 쿠키, localstorage 등등의 위치에 저장 가능
        res.cookie("x_auth", user.token)
        .status(200)
        .json({ loginSuccess:true, userId: user._id })
      })
    })
  })
  // 비밀번호가 맞다면 토큰 생성
})

// 여기서 auth는 middleware -> callback function 실행 전에 실행됨
app.get('/api/users/auth', auth, (req,res)=>{
  // 여기까지 middleware를 통과했다는 말 -> authentication을 통과했다는 말
  res.status(200).json({
    _id: req.user._id,
    // role이 0이면 일반 유저, 0이 아니면 관리자 -> 어떤 프로그램이냐에 따라 달라짐
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
})


app.get('/api/users/logout', auth, (req, res) =>{
  User.findOneAndUpdate(
    { _id:req.user._id }, 
    { token: "" },
    (err, user) => {
    if(err) return res.json({ success:false, err });
    return res.status(200).send({
      success: true
    })
  })
})


app.get('/api/hello', (req, res) => res.send('하위'))


//app.listen(port, () => {
//  console.log(`Example app listening at http://localhost:${port}`)
//})

const port = 5000