const express = require('express');
const NGORoutes = require("./models/NGO/user_ngo");
const FamilyRouter = require('./models/Family/user_family');
const SchoolRouter = require('./models/School/user_school');
const TeacherRouter = require('./models/Teacher/user_teacher');
const StudentRouter = require('./models/Student/user_student');
const db = require('./connections');
const app = express();
const morgan = require('morgan');


// port used by the server
const port = process.env.PORT || 3000;

app.use(express.urlencoded({extended: false}));
app.use(morgan('short'));

//app.use("/register", UserRoutes);
app.use(NGORoutes);
app.use(FamilyRouter);
app.use(SchoolRouter);
app.use(TeacherRouter);
app.use(StudentRouter);

//serving all files in public directory
app.use(express.static('./public'));

app.get("/", (req,res)=>{
    console.log("responding to root route");
    res.send("Welcome to Wasle");
})

app.listen(port, () => {
    console.log(`server started on port ${port}`);
});