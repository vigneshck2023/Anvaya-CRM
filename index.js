const express = require("express");
const cors = require("cors");
require("dotenv").config();

const {initializeDatabase} = require("./db/db.connect");
const {SalesAgent, Lead} = require("./models/crm.models");
const {sources, statuses, priorities} = require("./constants.js");
const { default: mongoose } = require("mongoose");
const app = express()
app.use(express.json());
app.use(cors({origin: "*", optionsSuccessStatus: 200}));

initializeDatabase();

app.get("/", (req,res) => res.send("CRM Server Running"));

// create salesAgent
app.post("/api/agents", async(req,res) => {
    try{
        const agent = new SalesAgent(req.body);
        const savedAgent = await agent.save();
        res.status(201).json({message: "Sales Agent Created", data: savedAgent})
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
});

// list all salesAgent

app.get("/api/agent", async(req,res) => {
    try{
        const agents = await SalesAgent.find();
        res.status(201).json({data: agents});
    }
    catch(error){
        res.status(500).json({message: error.message});   
    }
});

// create Lead
app.post("/leads", async (req,res) => {
    try{
        const { name, source, salesAgent, status, timeToClose, priority } = req.body;
        if(!name || typeof name!== "string"){
            return res.status(400).json({message: `Invalid input: 'name' input is required.`});
        }
        if(!source || !sources.includes(source)){
            return res.status(400).json({message: `Invalid Input: 'source' input required`});
        }
        if(!salesAgent || !mongoose.Types.ObjectId.isValid(salesAgent)){
            return res.status(400).json({message: `Invalid Input: Invalid ID`});
        }
        if(!status || !statuses.includes(status)){
            return res.status(400).json({message: `Invalid Input: 'status' input required`})
        }
        if(timeToClose !== undefined && (!Number.isInteger(timeToClose) || timeToClose <= 0)){
            return res.status(400).json({message: `Invalid Input: Enter a valid Input`});
        }
        if(!priority || !priorities.includes(priority)){
             return res.status(400).json({message: `Invalid Input: 'priority' input required`});
        }

        const lead = new Lead(req.body);
        const savedLead = await lead.save();

        const populatedData = await Lead.findById(savedLead._id).populate("salesAgent", "id name");
        res.status(201).json({data: populatedData});
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
});

// list all leads
app.get("/leads", async (req,res) => {
    try{
        const leads = await Lead.find();
        res.status(201).json({data: leads});
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
})


app.get("/api/lead/:id", async (req,res) => {
    try{
        const lead = await Lead.findById(req.params.id).populate("salesAgent", "id name");

        if(!lead){
            return res.json(404).json({message: `Lead with ID '${lead_id}' not found`});   
        }
        res.status(200).json({data: lead});
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
})
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Running of port ${PORT}`);
})

module.exports = app;