//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require('dotenv').config();
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + "-" + new Date().toDateString() + path.extname(file.originalname))
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        var ext = path.extname(file.originalname);
        if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
            return cb(new Error("only images are allowed"))
        }
        cb(null, true)
    },
    limits: {
        fileSize: 1024 * 1024 * 1024
    }
});

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/testimonialDB", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });

mongoose.connect(process.env.MONGO_USERLINK, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"]
    },
    location: {
        type: String,
        required: [true, "Please add a location"]
    },
    stories: {
        type: String,
        required: [true, "Please share your story"]
    },
    img: {
        data: Buffer,
        contentType: String,
        // required: true
    }
});

const Testimony = mongoose.model("Testimony", clientSchema);


// inserting documents into the database manually

// const firstPerson = new Testimony({
//     name: "Uzor Mbah",
//     location: "Anambra",
//     stories: "I had the best experience working with VAAL DIGITAL. Usability of the website was great, very good customer service, an all round great experience. I would definitely be coming back!."
// });

// const secondPerson = new Testimony({
//     name: "Veronicaa",
//     location: "Anambra",
//     stories: "I had the best experience working with VAAL DIGITAL. Usability of the website was great, very good customer service, an all round great experience. I would definitely be coming back!."
// });

// const thirdPerson = new Testimony({
//     name: "Chidimma Nnaji",
//     location: "Anambra",
//     stories: "I had the best experience working with VAAL DIGITAL. Usability of the website was great, very good customer service, an all round great experience. I would definitely be coming back!."
// });

// const defaultPersons = [firstPerson, secondPerson, thirdPerson];


// app.get("/", function (req, res) {

//     Testimony.find({}, (err, testimonies) => {
//         // Check to see if Items collection is empty
//         if (testimonies.length === 0) {
//             // If empty, insert default items
//             Testimony.insertMany(defaultPersons, (err) => {
//                 if (err) {
//                     console.log(err);
//                 } else {
//                     console.log("Successfully saved default items to DB");
//                 }
//             });
//             res.redirect("/");
//         } else {

//             res.render("home", {
//                 testimonies: testimonies,
//                 smessage: ""

//             });
//         }

//     });

// });

app.get("/", function (req, res) {

    Testimony.find({}, (err, testimonies) => {

        if (err) {

            console.log(err);

        } else {
            console.log(testimonies);
            res.render("home", {
                testimonies: testimonies,
                smessage: ""

            });
        }

    });

});

app.post("/", upload.single("image"), function (req, res, next) {

    // saving to database without pictures

    // const story = new Testimony({
    //     name: req.body.fname,
    //     location: req.body.place,
    //     stories: req.body.story,
    // });

    // story.save((err) => {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         console.log("saved successfully");
    //         Testimony.find({}, (err, testimonies) => {

    //             res.render("home", {
    //                 testimonies: testimonies,
    //                 smessage: "Story shared successfully"

    //             });

    //         });
    //     }

    // });


    // saving to database with pictures

    const story = {
        name: req.body.fname,
        location: req.body.place,
        stories: req.body.story,
        img: {
            data: fs.readFileSync(path.join(__dirname + "/uploads/" + req.file.filename)),
            // contentType: "image/png"
        }
    }

    Testimony.create(story, function (err, eachtestimony) {
        if (err) {
            console.log(err);
        }
        else {
            eachtestimony.save((err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("saved successfully");
                    Testimony.find({}, (err, testimonies) => {

                        res.render("home", {
                            testimonies: testimonies,
                            smessage: "Story shared successfully"

                        });

                    });
                }

            });
        }
    });


});

app.listen(process.env.PORT || 4000, function () {
    console.log("Server started on port 4000");
});