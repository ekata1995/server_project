const monk=require('monk');
const db=monk('localhost/auth-for-nobs');
module.exports=db;