const mongoose = require('mongoose');

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
        maxlength: 50,
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

const User = mongoose.model('User', userSchema)

module.exports = {User}