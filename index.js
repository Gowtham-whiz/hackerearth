const express = require("express");
const path = require("path");
const crypto = require("crypto");
const bodyParser = require("body-parser");

const app = express();
const secret = "your_shared_secret"; // Replace with your actual shared secret

// Middleware to parse form data (urlencoded)
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Route to generate the signed link based on form data
app.post("/generate-link", (req, res) => {
  const { email, course_path } = req.body; // Using course_path from request body
  const referer = "whizlabs";

  if (!email || !course_path) {
    return res
      .status(400)
      .json({ message: "Missing parameters: email or course_path" });
  }

  // Prepare URL parameters string
  const urlParams = `email=${encodeURIComponent(
    email
  )}&referer=${encodeURIComponent(referer)}`;

  // Generate HMAC using SHA-256
  const encryptData = `${email}${referer}`;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(encryptData);
  const generatedSignature = hmac.digest("hex"); // Finalize the HMAC to get the signature

  // Construct the final redirect URL with the course path
  const redirectUrl = `https://quality.whizlabs.org/${course_path}?${urlParams}&signature=${generatedSignature}`;

  // Send the generated URL as a response
  res.json({ redirectUrl });
});

// Export the app as a serverless function
module.exports = app;

// If you want to run it locally
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
