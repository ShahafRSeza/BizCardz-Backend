const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    let token = req.header('Authorization')
    if(!token) res.status(401).send('Access Denied. No Token Provided')

    try {
        let payload = jwt.verify(token, process.env.secretKey)
        req.payload = payload;
        next()
    } catch(err){
        res.status(400).send('Invalid Token, Please try again...')
    }
}