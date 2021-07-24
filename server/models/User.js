const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');


const userSchema = mongoose.Schema({
    name: {
        type : String,
        maxlength:50
    },
    email: {
        type:String,
        trim:true,      // seongmin221 @naver.com -> seongmin221@naver.com : 띄어쓰기 없에주는 역할
        unique: 1
    },
    password: {
        type: String,
        maxlength: 100,
    },
    role: {             // 역할을 주는 부분
        type: Number,   // Number 값이 1이면 일반, 2이면 관리자 등등..
        default: 0
    },
    image: String,
    token: {            // token을 이용해서 유효성 관리 가능
        type: String
    },
    tokenExp: {         // token 유효기간
        type: Number
    }
})

userSchema.pre('save', function(next){  
    // User 모델에 저장하기 전에 뭔가를 한다는 의미
        // 이때, 유저 정보를 새로 저장할 때마다 암호화 일어남
        // 비밀번호 바꿀 때에만 암호화 일어나야 함
    // index.js 에서 new User(req.body) 부분

    var user = this;
    
    if(user.isModified('password')){    // user의 password가 modified 되면 실행
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return  next(err)
            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) return next(err)
                user.password = hash
                next()
            })
        })
    }
    // 비밀번호를 암호화 시킨다.
    // 위에 동작들이 다 끝나면 index.js에서 다음 줄로
    else{
        next()
    }
})  

userSchema.methods.comparePassword = function(plainPassword, cb) {
    // plainPassword(암호화 전)과 암호화 된 비밀번호가 일치하는지 확인
    // 암호화 된 비밀번호를 다시 복호화 할 수는 없음
    // plainPassword를 같은 방식으로 암호화 해서 DB에 저장된 암호화 같은지 확인
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err);
        cb(null, isMatch);
    })
}

userSchema.methods.generateToken = function(cb){
    var user = this
    // jsonwebtoken을 이용해서 token을 생성
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    // user._id + 'secretToken' = token

    user.token = token
    user.save(function(err, user){
        if(err) return cb(err)
        cb(null, user)
    })
}

userSchema.statics.findByToken = function (token, cb){
    var user = this;
    // 토큰을 decode
    jwt.verify(token, 'secretToken', function(err, decoded){
        // 유저 아이디를 이용해서 유저를 찾고
        // client에서 가져온 토큰과 DB에 보관된 토큰이 일치하는지 확인
        user.findOne({"_id":decoded, "token": token}, function(err, user){
            if(err) return cb(err);
            cb(null, user)
        })
    })
}
const User = mongoose.model('User', userSchema)

module.exports = {User}