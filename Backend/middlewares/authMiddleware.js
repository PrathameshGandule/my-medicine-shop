const jwt = require("jsonwebtoken");
const verifyToken = (req, res, next) => {
    let token;
    let authHeader = req.headers.authorization || req.headers.Authorization;
    if(authHeader && authHeader.startsWith("Bearer")){
        token = authHeader.split(" ")[1];
        if(!token){
            return res.status(401).json({ message: "Access Denied" });
        }
        try{
            const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decodedUser;
            next();
        } catch(err) {
            return res.status(401).json({ message: "Invalid Token" });
        }
    } else {
        return res.status(401).json({ message: "No token, Access Denied" });
    }
}

module.exports = verifyToken;