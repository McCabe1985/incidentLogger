const express = require("express");
const path = require("path");
const fs = require("fs");
const directoryRoutes = require("./routes/directoryRoutes");
const callRoutes = require("./routes/callRoutes");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Parse incoming request bodies with urlencoded data
app.use(express.urlencoded({ extended: true }));

// Use directoryRoutes for handling directory-related requests
app.use("/data", directoryRoutes);

// Use callRoutes for handling call-related requests
app.use("/calls", callRoutes);

// Route for the home page
app.get("/", (req, res) => {
  const dataDir = path.join(__dirname, "public/data");

  // Read contents of the data directory
  fs.readdir(dataDir, (err, files) => {
    if (err) {
      console.error("Error reading data directory:", err);
      return res.status(500).send("Error reading directory");
    }

    // Filter out only directories (years)
    const years = files.filter((file) =>
      fs.statSync(path.join(dataDir, file)).isDirectory()
    );

    // Render the home page with years
    res.render("home", { years });
  });
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
