const express = require("express");
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT || 5000;
const corsOptions = {
  origin: process.env.FRONTEND_URL?.split(",") || "*",  // Allow only your front-end domain
  methods: ["GET", "POST", "PUT", "DELETE"],  // Allow only necessary methods
  allowedHeaders: ["Content-Type", "Authorization"],  // Allow only necessary headers
  credentials: true,  // Enable cookies/auth tokens to be sent
  preflightContinue: false,  // Don't allow preflight requests to be passed along
  optionsSuccessStatus: 204,  // Some legacy browsers choke on 204 status
};
// Middleware
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json()); // Allow JSON request bodies

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d^@$!%*?&(){}:;<>,.?~_+\\/-]{10,}$/;



const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");  // Extract token from the header
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach user info to the request object
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    res.status(400).json({ message: "Invalid token" });
  }
};

const validatePassword = (password) => {
  return PASSWORD_REGEX.test(password)
}

// Create a new todo for the authenticated user
app.post("/todos", verifyToken, async (req, res) => {
  const { description } = req.body;
  const userId = req.user.userId; // Get the user ID from the decoded token

  try {
    const result = await pool.query(
      "INSERT INTO todo (user_id, description, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *",
      [userId, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Detailed Error:", err.message);
    res.status(500).json({ error: "An unexpected error occurred. Please try again later." });
    
  }
});

// Get all todos for the authenticated user
app.get("/todos", verifyToken, async (req, res) => {
  const userId = req.user.userId; // Get the user ID from the decoded token

  try {
    const result = await pool.query("SELECT * FROM todo WHERE user_id = $1 ORDER BY todo_id", [userId]);
    res.json(result.rows); // Send the todos of the authenticated user
  } catch (err) {
    console.error("Detailed Error:", err.message);
    res.status(500).json({ error: "An unexpected error occurred. Please try again later." });

  }
});

// Update a todo by ID for the authenticated user
// Update todo (mark as completed)
// Update a todo by ID for the authenticated user (Only for description change)
app.put("/todos/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { description, completed } = req.body;  // Get the description (if editing)
  const userId = req.user.userId; // Get the user ID from the decoded token


  try {
    // Update the description for the todo in the database (without completed)
    const result = await pool.query(
     "UPDATE todo SET description = $1, completed = $2 WHERE todo_id = $3 AND user_id = $4 RETURNING *",
      [description, completed, id, userId]  // Only updating description
    );

    // If no rows were updated, it means the todo was not found
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(result.rows[0]);  // Return the updated todo
  } catch (err) {
    console.error("Error updating todo:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});


// Delete a todo by ID for the authenticated user
app.delete("/todos/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId; // Get the user ID from the decoded token

  try {
    const result = await pool.query(
      "DELETE FROM todo WHERE todo_id = $1 AND user_id = $2 RETURNING *",
      [id, userId]  // Ensure the user can only delete their own todos
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({ message: "Todo deleted!", deletedTodo: result.rows[0] });
  } catch (err) {
    console.error("Detailed Error:", err.message);
res.status(500).json({ error: "An unexpected error occurred. Please try again later." });

  }
});

// Route to register a new user
app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;

  const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  if (userExists.rows.length > 0) {
    return res.status(400).json({ error: "Email already exists" });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      error:
        "Password must include at least:\n" +
        "- One uppercase letter (A)\n" +
        "- One lowercase letter (a)\n" +
        "- One number (5)\n" +
        "- One special character (*)\n" +
        "- Minimum 10 characters in total.",
    });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
      [username, email, hashedPassword]
    );

    const token = jwt.sign({ userId: newUser.rows[0].user_id }, process.env.JWT_SECRET, { expiresIn: "8h" });
    res.status(201).json({ message: "User created successfully", token });
    
  } catch (err) {
    console.error("Detailed Error:", err.message);
    res.status(500).json({ error: "An unexpected error occurred. Please try again later." });
    
  }
});

// Login route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Invalid user or email" });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ userId: user.rows[0].user_id }, process.env.JWT_SECRET, { expiresIn: "8h" });
    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Detailed Error:", err.message);
    res.status(500).json({ error: "An unexpected error occurred. Please try again later." });
    
  }
});


(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Connection successful:", res.rows[0]);
  } catch (err) {
    console.error("Connection error:", err.message);  // Display full error message
  }
})();


const cron = require("node-cron");

cron.schedule("0 0 * * *", async () => {
  try {
    const result = await pool.query(
      "DELETE FROM todo WHERE created_at < NOW() - INTERVAL '7 days'"
    );
    console.log(`Deleted ${result.rowCount} old todos`);

  } catch(err) {
    console.log("Error deleting old todos", err);
  }
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
