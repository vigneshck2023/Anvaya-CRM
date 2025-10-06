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

        // Validate multiple sales agents
        if (!salesAgent || !Array.isArray(salesAgent) || !salesAgent.every(id => mongoose.Types.ObjectId.isValid(id))) {
            return res.status(400).json({ message: `Invalid Input: Invalid ID` });
        }

        if(!status || !statuses.includes(status)){
            return res.status(400).json({message: `Invalid Input: 'status' input required`})
        }

        if(timeToClose !== undefined && (!Number.isInteger(timeToClose) || timeToClose <= 0)){
            return res.status(400).json({message: `Invalid Input: Enter a valid Input`});
        }

        // priorities should be an array of strings
if (!priority || !Array.isArray(priority) || priority.length === 0) {
    return res.status(400).json({message: `Invalid Input: 'priority' input required`});
}

// validate each value
const invalidPriority = priority.some(p => !priorities.includes(p));
if (invalidPriority) {
    return res.status(400).json({message: `Invalid Input: 'priority' contains invalid value`});
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


// get single lead by id
app.get("/leads/:id", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate("salesAgent", "id name");

    if (!lead) {
      return res.status(404).json({ message: `Lead with ID '${req.params.id}' not found` });
    }

    res.status(200).json({ data: lead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



app.put("/api/lead/:id", async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("salesAgent", "id name");

    if (!lead) {
      return res.status(404).json({ message: `Lead with ID '${req.params.id}' not found` });
    }

    res.status(200).json({ data: lead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// get single agent with leads
app.get("/api/agents/:id", async (req, res) => {
  try {
    const agent = await SalesAgent.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: "Agent not found" });

    // populate leads by this agent
    const leads = await Lead.find({ salesAgent: agent._id });

    res.status(200).json({ data: { ...agent.toObject(), leads } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Add comment to a lead
app.post("/leads/:id/comments", async (req, res) => {
  try {
    const { author, text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text required" });

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    lead.comments.unshift({ author, text, date: new Date() }); // newest on top
    await lead.save();

    res.status(201).json({ data: lead.comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Sales Agent
// Delete Sales Agent
app.delete("/api/agents/:id", async (req, res) => {
  try {
    const agent = await SalesAgent.findByIdAndDelete(req.params.id);
    if (!agent) return res.status(404).json({ message: "Agent not found" });

    // Remove this agent from all leads where salesAgent is an array
    await Lead.updateMany(
      { salesAgent: { $in: [agent._id] } }, // only leads where salesAgent contains this agent
      { $pull: { salesAgent: agent._id } }
    );

    res.status(200).json({ message: "Agent deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Delete Lead
app.delete("/leads/:id", async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.status(200).json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Running of port ${PORT}`);
})

module.exports = app;