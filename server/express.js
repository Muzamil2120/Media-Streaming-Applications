const express = require("express")
const path = require("path")
const Template = require("./../template")

const app = express()

// Serve static files
const CURRENT_WORKING_DIR = process.cwd()
app.use("/dist", express.static(path.join(CURRENT_WORKING_DIR, "dist")))

// Serve template for all routes
app.get("*", (req, res) => {
  console.log("Request received for:", req.url)
  res.send(Template())
})

module.exports = app