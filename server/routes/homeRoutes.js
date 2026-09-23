const homeController = require("../controllers/homeController");
// Import the Express module to create router
const express = require("express");

// Create a new router object.
const router = express.Router();

router.get("/", homeController.home);

// Export the router.
// This allows app.js to use these routes.
module.exports = router;