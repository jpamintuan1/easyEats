const db = require("../models");
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');
const path = require("path");
const moment = require('moment');

const  acctManager = {}

acctManager.createAcct = (userInfo, res)=>{
  bcrypt.hash(userInfo.password, 10, function(err, hash) {
    //check for usernmae and create it if doesnt exist
    db.User.findOrCreate({
          where:{
            name:userInfo.name
          },
          defaults:{
            pw_hash:hash,
            uuid: uuidv4()
          }
        }).then(results=>{
      //if created a new one send response
      let resObj;
      if(results.includes(true)){
        resObj ={
          msg:"account created",
          sucess:true,
          uuid: results[0].uuid,
          name:results[0].name,
          id:results[0].id
        }
        
      }else{
        //if false send a false
        resObj ={
          msg:"account name already exists try agian",
          acctCreated:false
        }
      }
      res.json(resObj)
    }).catch((data)=>{
      res.json({
        msg:"system error",
        sucess: false
      })
    })//db.user.findOne.then
  })
}
acctManager.createNewUuid = (userInfo, callback)=>{
  //create a new uuid ad assigns it
  let newUuid = uuidv4();
  db.User.update({
    uuid: newUuid
  },{
    where:{
      id: userInfo.id
    }
  }).then(()=>{
    callback(newUuid)
  })
}

acctManager.checkUuid = (userInfo, res, callback)=>{
  //gets user info
  db.User.findOne({
    where:{
      name:userInfo.name
    }
  }).then(results=>{
    //records time since last update
    let timeSinceUpdate = moment().diff(moment(userInfo.updatedAt), "seconds")
    if(results.uuid === userInfo.uuid && timeSinceUpdate <=6*60*60){
      //if within last 6 hours callback with same uuid
      callback(results.uuid)
    } else if(results.uuid === userInfo.uuid && timeSinceUpdate<= 24*60*60){
      //if over 6 hours but within 24hours generate new key to use and callback with it
      _createNewUuid(results, (newUuid)=> {
        callback(newUuid)
      })
    }else{
      //if incorrect or older than 24 hours return to login screen
      res.redirect("/login")
    }
  })
}
acctManager.comparePassword = (req, res, userDbInfo)=>{
  bcrypt.compare(req.body.password, userDbInfo.pw_hash, (err, matched)=>{
      //if matches update with new uuid
      let newUuid = uuidv4();
      let resObj;
      if(matched){
        
        db.User.update({
          uuid:newUuid
        }, {
          where:{
            id:userDbInfo.id
          }
        }).then((data)=>{
          
          //return new uuid to browser 
          resObj={
            msg:"login sucessfull",
            sucess:true,
            id:userDbInfo.id,
            uuid:newUuid,
            name:userDbInfo.name,
          }
           res.json(resObj)
        }).catch((err)=>{
          console.log(err)
          resObj={
            msg:"login failed",
            sucess:false
          }
           res.json(resObj)
        })
      } else{
        //if failed send response
        resObj={
            msg:"login failed",
            sucess:false,
          }
           res.json(resObj)
      }//else
     
    })//compare
}

module.exports = acctManager;