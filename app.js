//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
require('dotenv').config();

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
    }
});

const Testimony = mongoose.model("Testimony", clientSchema);

const firstPerson = new Testimony({
    name: "Uzor Mbah",
    location: "Anambra",
    stories: "I had the best experience working with VAAL DIGITAL. Usability of the website was great, very good customer service, an all round great experience. I would definitely be coming back!."
});

const secondPerson = new Testimony({
    name: "Veronicaa",
    location: "Anambra",
    stories: "I had the best experience working with VAAL DIGITAL. Usability of the website was great, very good customer service, an all round great experience. I would definitely be coming back!."
});

const thirdPerson = new Testimony({
    name: "Chidimma Nnaji",
    location: "Anambra",
    stories: "I had the best experience working with VAAL DIGITAL. Usability of the website was great, very good customer service, an all round great experience. I would definitely be coming back!."
});

const defaultPersons = [firstPerson, secondPerson, thirdPerson];


app.get("/", function (req, res) {

    Testimony.find({}, (err, testimonies) => {
        // Check to see if Items collection is empty
        if (testimonies.length === 0) {
            // If empty, insert default items
            Testimony.insertMany(defaultPersons, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully saved default items to DB");
                }
            });
            res.redirect("/");
        } else {

            res.render("home", {
                testimonies: testimonies,
                smessage: ""

            });
        }

    });

    // Testimony.find({}, (err, testimonies) => {

    //     res.render("home", {
    //         testimonies: testimonies,
    //         smessage: ""

    //     });
    // });
});

app.post("/", function (req, res) {
    const story = new Testimony({
        name: req.body.fname,
        location: req.body.place,
        stories: req.body.story
    });

    // story.save((err) => {
    //     if(err) throw err;

    //         res.render("home", {
    //             smessage: "Story shared successfully"
    //         });
    //         // res.redirect("/");

    //     }
    // });

    story.save((err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("saved successfully");
            Testimony.find({}, (err, testimonies) => {

                res.render("home", {
                    testimonies: testimonies,
                    smessage: "Story shared successfully"

                });
                // res.redirect("/");

            });
        }

    });

    // story.save((err) => {
    //     if (!err) {
    //         // const smessage = "Story shared successfully"


    //         res.redirect("/");
    //         res.render("home", {
    //             smessage: "Story shared successfully"
    //         });
    //     }
    // });

});

app.listen(process.env.PORT || 3000, function () {
    console.log("Server started on port 3000");
});