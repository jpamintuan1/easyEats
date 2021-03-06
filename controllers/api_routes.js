const express = require("express");
const exphbs = require("express-handlebars");
const db = require("../models");
const path = require("path");
const dbOrm = require("../db/databaseQuery")
const acctManager = require("../password_auth/acctManager")


let router =express.Router();


router.post("/addStar", (req, res)=>{
    let starData = {
        UserId: req.body.user_id,
        RecipeId: req.body.recipe_id
    }
    dbOrm.addStar(starData, (results, err)=>{
        if(err){ 
            res.json({
                err:results,
                success:false
            })
        } else{
            res.json(results)
        }
        
    })
})

router.post("/addRecipe", (req, res)=>{
    let recipe = {
        title:req.body.title,
        ingredients:req.body.ingredients,
        recipe_steps:req.body.recipe_steps,
        user_recipe:true,
        UserId: req.body.user_id
    }
    req.body.img_url?recipe.img_url=req.body.img_url:null;
    dbOrm.addRecipe(recipe,(results, err)=>{
        if(err){ 
            res.json({
                err:results,
                success:false
            })
        } else{
            res.json(results)
        }
    })
});

router.post("/addComment", (req, res)=>{
    let comment = {
        UserId: req.body.user_id,
        comment: req.body.comment,
        reply_to:req.body.reply_to
    }

    dbOrm.findRecipeId({
            title:req.body.title,
            ingredients:req.body.ingredients,
            img_url:req.body.img_url,
            source_url:req.body.source_url
          }, (results)=>{
            comment.RecipeId = results;
            addComment(comment, (results, err)=>{
                if(err){
                    res.json({
                        err:results,
                        success:false
                    })
                } else{
                    res.json(results)
                }
            })
          })

})

module.exports = router;