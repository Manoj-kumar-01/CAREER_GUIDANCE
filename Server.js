const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const User = require('./models/Employee'); 
const path = require('path');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

mongoose.connect(process.env.mongo_url)
    .then(() => {
        console.log('Database Connected');
    })
    .catch((err) => {
        console.log(err);
    });

const store = new MongoStore({
    uri: process.env.mongo_url,
    collection: 'Sessions'
});

app.use(session({
    secret: 'This is a secret',
    resave: false,
    saveUninitialized: true,
    store: store
}));

const checkAuth = (req, res, next) => {
    if (req.session.isAuth) {
        next();
    } else {
        res.redirect('/login');
    }
};


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/reg', (req, res) => {
    res.render('register');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/dashboard', checkAuth, (req, res) => {
    const user = {
        username: req.session.user,
        email: req.session.email || 'user@example.com',
        profilePhoto:req.session.profilePhoto || 'profilePic1.png'
    };
    res.render('welcome', { user });
});

app.get('/updateProfilePage', checkAuth, (req, res) => {
    const user = {
        username: req.session.user,
        email: req.session.email || 'user@example.com',
        profilePhoto: req.session.profilePhoto || '/images/default-profile.png', // Fetch from session
    };
    res.render('Profile', { user }); // Pass the user object to the template
});

app.get('/career-quiz', (req, res) => {
    res.render('career-quiz');
});
app.get('/counselor',(req,res)=>{
    res.render('counselor');
})
app.get('/creative-writer',(req,res)=>{
    res.render('creative-writer');
})
app.get('/data-scientist',(req,res)=>{
    res.render('data-scientist');
})
app.get('/entrepreneur',(req,res)=>{
    res.render('entrepreneur');
})
app.get('/graphic-designer',(req,res)=>{
    res.render('graphic-designer');
})
app.get('/manager',(req,res)=>{
    res.render('manager');
})
app.get('/mechanical-engineer',(req,res)=>{
    res.render('mechanical-engineer');
})
app.get('/project-manager',(req,res)=>{
    res.render('project-manager');
})
app.get('/research-scientist',(req,res)=>{
    res.render('research-scientist');
})
app.get('/social-worker',(req,res)=>{
    res.render('social-worker');
})
app.get('/software-engineer',(req,res)=>{
    res.render('software-engineer');
})
// backend (Node.js + Express)
app.get('/jobRoleSelection', (req, res) => {
    const branch = req.query.branch;
    res.render('jobRoleSelection', { branch }); // renders jobRoleSelection.ejs
});

app.get('/companiesHiring', (req, res) => {
    const jobRole = req.query.jobRole;
    res.render('companiesHiring', { jobRole });
});

app.post('/selectProfilePic', (req, res) => {
    const { profilePhoto } = req.body; 
    
    req.session.profilePhoto = profilePhoto;
    res.json({ success: true, profilePhoto });
});
// Example: For companiesHiring.ejs
app.get('/companiesHiring', (req, res) => {
    const jobRole = req.query.jobRole; // Access query param
    res.render('companiesHiring', { jobRole }); // Render the EJS
});


app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.send('User already exists');
        }
        const hashPass = await bcrypt.hash(password, 12);
        user = new User({
            username,
            email,
            password: hashPass
        });
        await user.save();
        res.redirect('/login');
    } catch (err) {
        console.error(err);
    }
});


app.post('/user-login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.send('Invalid Email');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.send('Invalid Password');
    }
    req.session.user = user.username;
    req.session.email = user.email;
    req.session.isAuth = true;
    res.redirect('/dashboard');
});


app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/login');
    });
});


app.post('/updateProfile', async (req, res) => {
    const { name, bio, college, skills, interests, careerGoal, profilePhoto } = req.body;
    const email = req.session?.email;

    if (!email) {
        return res.status(401).json({ message: "User not logged in or session expired!" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

       
        const updatedSkills = Array.isArray(skills) ? skills : [];
        const updatedInterests = Array.isArray(interests) ? interests : [];

   
        user.name = name || user.name;
        user.bio = bio || user.bio;
        user.college = college || user.college;
        user.skills = [...new Set([...user.skills, ...updatedSkills])]; // Merge and avoid duplicates
        user.interests = [...new Set([...user.interests, ...updatedInterests])]; // Merge and avoid duplicates
        user.careerGoal = careerGoal || user.careerGoal;

   
        if (profilePhoto) {
            user.profilePhoto = profilePhoto; // Save the profile photo path in the database
            req.session.profilePhoto = profilePhoto; // Update session with new profile photo
        }

        await user.save();
        res.status(200).json({ success: true, message: "Profile updated successfully!", user });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: "An error occurred while updating the profile." });
    }
});
app.post('/getUserProfile', async (req, res) => {
    const email = req.session?.email;

    if (!email) {
        return res.status(401).json({ message: "User not logged in or session expired!" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.status(200).json({
            name: user.name || '<%= user.username %>',
            bio: user.bio || 'No bio available',
            college: user.college || 'College not added',
            profilePhoto: user.profilePhoto || 'profilePic1.png',
            skills: user.skills || [],
            interests: user.interests || [],
            careerGoal: user.careerGoal || 'No career goal added.'
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Error fetching user profile!" });
    }
});

// Delete Skill
app.post('/deleteSkill', async (req, res) => {
    const { skill } = req.body;
    const email = req.session?.email;

    if (!email) {
        return res.status(401).json({ message: "User not logged in or session expired!" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        user.skills = user.skills.filter(s => s !== skill);
        await user.save();

        res.status(200).json({ message: "Skill deleted successfully!", user });
    } catch (error) {
        console.error("Error deleting skill:", error);
        res.status(500).json({ message: "An error occurred while deleting the skill." });
    }
});

app.post('/deleteInterest', async (req, res) => {
    const { interest } = req.body;
    const email = req.session?.email;

    if (!email) {
        return res.status(401).json({ message: "User not logged in or session expired!" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // Remove the interest
        user.interests = user.interests.filter(i => i !== interest);
        await user.save();

        res.status(200).json({ message: "Interest deleted successfully!", user });
    } catch (error) {
        console.error("Error deleting interest:", error);
        res.status(500).json({ message: "An error occurred while deleting the interest." });
    }
});

// Add Work Experience
app.post('/addWorkExperience', async (req, res) => {
    const { jobTitle, company, duration, description } = req.body;
    const email = req.session?.email;

    if (!email) {
        return res.status(401).json({ message: "User not logged in or session expired!" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // Add work experience
        user.workExperience.push({ jobTitle, company, duration, description });
        await user.save();

        res.status(200).json({ message: "Work experience added successfully!", user });
    } catch (error) {
        console.error("Error adding work experience:", error);
        res.status(500).json({ message: "An error occurred while adding work experience." });
    }
});



// Start Server
app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});
