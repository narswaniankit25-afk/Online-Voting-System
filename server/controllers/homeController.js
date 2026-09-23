// Function that handles the Home page request
const home = (req, res) => {
    res.send("Server is running...");
};

// Export the function
module.exports = {
    home,
};