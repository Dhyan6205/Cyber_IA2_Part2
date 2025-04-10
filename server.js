// const express = require('express');
// const cors = require('cors');
// const app = express();
// const PORT = 3000;

// // Enable CORS for all routes
// app.use(cors());

// // Sample student data
// const students = [
//     { id: 1, name: "John Doe", percentage: 85 },
//     { id: 2, name: "Jane Doe", percentage: 92 },
//     { id: 3, name: "Alice", percentage: 78 }
// ];

// // API keys and owners
// const keyOwnerMap = {
//     "1234": "Admin",
//     "5678": "FrontendApp"
// };

// // Middleware to check API key
// app.use((req, res, next) => {
//     const apiKey = req.headers['x-api-key'];
//     if (!apiKey || !keyOwnerMap[apiKey]) {
//         return res.status(403).json({ error: "Unauthorized. Invalid API key." });
//     }
//     req.user = keyOwnerMap[apiKey]; // attach who made the request
//     next();
// });

// app.get('/students', (req, res) => {
//     res.json(students);
// });

// // Get student info by ID
// app.get('/students/:id', (req, res) => {
//     const student = students.find(s => s.id == req.params.id);
//     if (!student) {
//         return res.status(404).json({ error: "Student not found" });
//     }
//     console.log(`Request made by: ${req.user}`);
//     res.json(student);
// });

// // Optional test route
// app.get('/test', (req, res) => {
//     res.send(`API key owner: ${req.user}`);
// });

// // Start server
// app.listen(PORT, () => {
//     console.log(`Server running at http://localhost:${PORT}`);
// });


const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Security middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

const students = [
    { id: 1, name: "John Doe", percentage: 85 },
    { id: 2, name: "Jane Doe", percentage: 92 },
    { id: 3, name: "Alice", percentage: 78 }
];

const keyOwnerMap = {
    1234: { name: "Admin", role: "admin" },
    5678: { name: "User", role: "user" }
};

// Middleware for API key auth and RBAC
app.use((req, res, next) => {
    const apiKey = parseInt(req.headers['x-api-key']);
    if (!apiKey || !keyOwnerMap[apiKey]) {
        return res.status(403).json({ error: "Unauthorized. Invalid API key." });
    }
    console.log(`🔑 API Key used: ${apiKey}`);
    req.user = keyOwnerMap[apiKey];
    next();
});

// Validate student ID middleware
function validateStudentId(req, res, next) {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id < 1) {
        return res.status(400).json({ error: "Invalid student ID" });
    }
    next();
}

app.get('/students/:id', validateStudentId, (req, res) => {
    const student = students.find(s => s.id == req.params.id);
    if (!student) {
        return res.status(404).json({ error: "Student not found" });
    }
    res.json(student);
});

app.get('/admin', (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Admins only" });
    }
    res.send(`Welcome, ${req.user.name}. You have admin access.`);
});

app.get('/students', (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Only admin can view all students" });
    }
    res.json(students);
});

app.get('/me', (req, res) => {
    res.json({ name: req.user.name, role: req.user.role });
});

app.listen(PORT, () => {
    console.log(`✅ HTTP server running at http://localhost:${PORT}`);
});
