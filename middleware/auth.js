const { User } = require("../models/User");

let auth = (req, res, next) => {

    // authorized 된 계정인지 인증 처리를 함
    // 1. client cookie에서 token 가져옴
    let token = req.cookies.x_auth;
    
    // 2. 토큰을 복호화 한 뒤 유저 찾음
    User.findByToken(token, (err, user)=>{
        if(err) throw err;
        if(!user) return res.json({isAuth:false, error:true})

        req.token = token;
        req.user = user;
        next();
    })
    // 3. 유저가 있으면 인증됨, 유저가 없으면 안됨  
}

module.exports = { auth };