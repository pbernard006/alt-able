/* eslint-disable */
const express = require("express");
const platModel = require("../db/plat");
const tableModel = require("../db/table");
const planTableModel = require("../db/planTable");
const { checkOrSetAlreadyCaught } = require("@sentry/utils");
const app = express();

// routes pour ajouter un plat
app.post("/api/addPlat",async (request,response)=>{
    platModel.findOne({name: request.body.name}).then((plat)=>{
        if(plat){
            return response.status(400).json({name : "plat déja existant"})
        }      
            const newPlat = new platModel({
                name: request.body.name,
                description: request.body.description,
                type: request.body.type,
                prix: request.body.prix,
            })
            newPlat.save()
            return response.status(200).json({msg: newPlat})
        
    })
})


// route pour modifier un plat   
app.put("/api/updatePlat",async(request,response)=>{
    // const filter = {_id : request.body.id}
    // const update = {toto : 89}
    let updates = request.body
    platModel.findOneAndUpdate({_id: request.body.id},updates,{new: true})
        .then(updatePlat => response.json(updatePlat))
        .catch(err => response.status(400).json("Error : "+err))
})


// routes récupérer tous les plats
app.get("/api/getAllPlats", async (request, response) => {
    const plats = await platModel.find({});
    try {
      response.send(plats);
    } catch (error) {
      response.status(500).send(error);
    }
  });


// routes récupérer les plats disponibles
app.get("/api/getCarte", async (request, response) => {
    const plats = await platModel.find({}).where("quantite").ne(0);
    try {
      response.send(plats);
    } catch (error) {
      response.status(500).send(error);
    }
  });


// routes pour ajouter une table
app.post("/api/addTable",async (request,response)=>{
  tableModel.findOne({numero: request.body.numero}).then((table)=>{
      if(table){

            return response.status(400).json({numero : "table déja existante"})

      } else if(request.body.convive < 1){

            return response.status(400).json({convive : "met des convives stp"})
      } else{
    
          const newTable = new tableModel({
              numero: request.body.numero,
              convive: request.body.convive,
          })
          newTable.save()
          return response.status(200).json({msg: newTable})
      }
  })
})


// routes pour ajouter un plan de table
app.post("/api/addPlanTable",async (request,response)=>{
    request.body.table.forEach(element => {
        if(element.convive <1){
            return response.status(400).json({convive : "met des convives stp"})
        }
    });
    planTableModel.findOne({name: request.body.name}).then((planTable)=>{
        if(planTable){
            return response.status(400).json({name : "plan de table déja existant"})
        }  
            const newPlanTable = new planTableModel({
                name : request.body.name,
                table: request.body.table
            })
            newPlanTable.save()
            return response.status(200).json({msg: newPlanTable})
      
    })
  })

// route pour modifier un plan de table    
app.put("/api/updatePlanTable",async(request,response)=>{
    request.body.table.forEach(element => {
        if(element.convive <1){
            return response.status(400).json({convive : "met des convives stp"})
        }
    });
    // const filter = {_id : request.body.id}
    // const update = {toto : 89}
    let updates = request.body
    planTableModel.findOneAndUpdate({_id: request.body.id},updates,{new: true})
        .then(updatePlanTable => response.json(updatePlanTable))
        .catch(err => response.status(400).json("Error : "+err))
})












































app.post("/api/checkUser",async (request,response)=>{
    userModel.findOne({email: request.body.email}).then((user)=>{
        try{
            if(user.email == request.body.email){
                if(user.password == request.body.password){
                    let listOfId = user.listEvents
                    // console.log(listOfId)
                    // return response.status(200).json(user)
                    try{
                        eventModel.find().where("_id").in(listOfId).exec((error,events)=>{
                            // console.log(events)
                            user.listEvents = events
                            return response.status(200).json(user)
                        })
                    }catch(error){
                        response.status(500).send(error)
                    }
                }else{
                    return response.status(400).json({msg : "mot de passe incorrect"})
                }
            }
        }catch(error){
            return response.status(400).json({msg:"adresse mail incorrect"})
        }
    })
})

// routes récupérer tous les utilisateurs
app.get("/api/getAllEvents", async (request, response) => {
    const events = await eventModel.find({});
    try {
      response.send(events);
    } catch (error) {
      response.status(500).send(error);
    }
  });

// route création d'un event
app.post("/api/createEvent",async (request,response)=>{
    const event = new eventModel(request.body)
    try{
        await event.save()
        response.send(event)
    }catch(error){
        response.status(500).json({msg:error})
    }
})

// route ajout event à un utilisateur
app.put("/api/addEventToUser",async(request,response)=>{
    // const filter = {_id : request.body.id}
    // const update = {toto : 89}
    let updates = request.body
    updates = {
        "id":updates.id,
        "$addToSet":{"listEvents":updates.listEvents}
    }
    userModel.findOneAndUpdate({_id: request.body.id},updates,{new: true,upsert: true})
        .then(updateUser => response.json(updateUser))
        .catch(err => response.status(400).json("Error : "+err))
})

// route supprimer event à un utilisateur
app.put("/api/deleteEventFromUser",async(request,response)=>{
    // const filter = {_id : request.body.id}
    // const update = {toto : 89}
    let updates = request.body
    updates = {
        "id":updates.id,
        "$pull":{"listEvents":updates.listEvents}
    }
    userModel.findOneAndUpdate({_id: request.body.id},updates,{new: true,upsert: true}).then((updateUser)=>{
            let listOfId=updateUser.listEvents
            try{
                    eventModel.find().where("_id").in(listOfId).exec((error,events)=>{

                        updateUser.listEvents = events
                        return response.status(200).json(updateUser)
                        // response.json(updateUser.listEvents)
                    })
                }catch(error){
                    response.status(500).send(error)
            }
        })})
// // route get events par user
app.get("/api/eventsByUserId", async (request, response) => {
    const users = await userModel.findOne({_id: request.query.id})
    const listOfId = users.listEvents
    try {
        const events = await eventModel.find().where("_id").in(listOfId).exec()
        response.send(events);
    } catch (error) {
      response.status(500).send(error);
    }
  });

// route get liste des sports
app.get("/api/getSportsCategories", async (request, response) => {
    const categories = await categoryModel.find({});
    try {
      response.send(categories);
    } catch (error) {
      response.status(500).send(error);
    }
  });

module.exports = app;