"use strict";

// This is a test script to verify that token generation and verification work correctly
const jwt = require("jsonwebtoken");

// Simulating the environment variable
const secret = "CPPMbuUUC8IP8Lml9vOFLnuheGuQ5t2HCjc0dktQ+O4=";
// Remove quotes if they exist
const cleanedSecret = secret.replace(/"/g, "").trim();

console.log(
  "Testing JWT with secret (first 5 chars):",
  cleanedSecret.substring(0, 5) + "..."
);

// Create a test payload
const payload = {
  id: "test-user-id",
  email: "test@example.com",
  name: "Test User",
};

try {
  // Generate a token
  console.log("Generating token...");
  const token = jwt.sign(payload, cleanedSecret, { expiresIn: "1h" });
  console.log(
    "Token generated (first 20 chars):",
    token.substring(0, 20) + "..."
  );

  // Verify the token
  console.log("Verifying token...");
  const decoded = jwt.verify(token, cleanedSecret);
  console.log("Token verified successfully:", decoded);

  console.log(
    "✅ JWT test passed! Token generation and verification work with this secret."
  );
} catch (error) {
  console.error("❌ JWT test failed:", error);
  console.error("Please check your secret and JWT implementation.");
}
