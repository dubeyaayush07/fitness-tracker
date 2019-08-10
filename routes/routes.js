require('dotenv').config();
const router = require("express").Router();
const middleware = require("../middleware");
const bcrypt = require("bcrypt");
const passport = require("passport");
const Pool = require("pg").Pool;


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});


// landing page
router.get("/", (req, res) => {
    res.render("index");
});

// get all the logs
router.get("/exercise-logs", middleware.isLoggedIn, (req, res) => {
    pool.query('SELECT * FROM logs WHERE user_id = $1 ORDER BY ID DESC LIMIT 20', [req.user.id], (err, logs) => {
        if (err) {
            console.log(error);
        } else {
            res.status(200).json(logs.rows);
        }
    });
});

// post new log 
router.post("/exercise-logs", middleware.isLoggedIn, (req, res) => {
    log = req.body.log;
    pool.query('INSERT INTO logs (type, minutes, calories, heart_rate, user_id) VALUES ($1, $2, $3, $4, $5)', [log.type, log.minutes, log.calories, log.heart_rate, req.user.id], (err, user) => {
        if (err) {
            console.log(err);
        }
        res.redirect("/");
    });
});


router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/login",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login"
    })
);

router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", (req, res) => {
    pool.query('SELECT id, username, password FROM users WHERE username = $1', [req.body.username], (err, user) => {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else if (user.rows.length > 0) {
            res.redirect("/register");
        } else {
            var hash = bcrypt.hashSync(req.body.password, 12);
            pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [req.body.username, hash], (err, user) => {
                if (err) {
                    console.log(err);
                    res.redirect("/register");
                } else {
                    passport.authenticate("local", { failureRedirect: '/register' })(req, res, () => res.redirect("/"));
                }
            });
        }
    });
});

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

router.get("*", (req, res) => {
    res.redirect("/");
});

module.exports = router;