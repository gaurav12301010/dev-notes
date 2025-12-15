const { validateToken, secret } = require("../services/authentication");

function checkForAuthenticationCookie(cookieName){
    return (req, res, next)=>{
        const tokenCookieValue = req.cookies[cookieName];

        if(!tokenCookieValue){
            return next();
        }
        try{
            const userPayload = validateToken(tokenCookieValue, secret);
            req.user =  userPayload;
            
        }catch(error){}
        
        return next();
    }
};

function requireAuth(req, res, next) {
  if (!req.user) return res.redirect('/');
  next();
}

module.exports = {
    checkForAuthenticationCookie,
    requireAuth
}