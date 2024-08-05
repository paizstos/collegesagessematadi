// load the things we need
var express = require('express');
var session = require('express-session');
var app = express ();
var bodyParser = require("body-parser");
var https = require('https');
var fs = require('fs');
var vm = require('vm');
const Bcrypt = require("bcryptjs");




// loading and using sessions
app.use(bodyParser.urlencoded({ extended: true })); 
var session = require('express-session');
app.use(session({
    secret: "Christos1101",
    resave: false,
    saveUninitialized: true,
    cookie: { 
      path: '/', 
      httpOnly: true, 
    }
  }));

// Loading DataBase 

const dbs = require("./database.js");
const { Op } = dbs; // Get Op from dbs


// Testing connection on DB

try {
    dbs.sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', __dirname + '/static');
app.use(express.static(__dirname + '/static'));

var ajd = new Date();
var months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]; 
var date =" "+ajd.getDate() + " "+ months[ajd.getMonth()] + " "+ ajd.getFullYear();

//home page
app.get('/', async (req, res) => {

    let noti = req.session.notif;

    const dtitle = await dbs.eleve.findAll({
        attributes: ['nom']
    });
    const dtitle2 = await dbs.eleve.findAll({
        attributes: ['prenom']
    });
    const ddescr = await dbs.eleve.findAll({
        attributes: ['classe']
    });
    const dloc = await dbs.eleve.findAll({
        attributes: ['age']
    });
    const ddate = await dbs.eleve.findAll({
        attributes: ['solde1']
    });
    const ddate2 = await dbs.eleve.findAll({
        attributes: ['solde2']
    });
    const ddate3 = await dbs.eleve.findAll({
        attributes: ['solde3']
    });

    let titleEvents = dtitle.map(eleve => eleve.nom);
    let titleEvents2 = dtitle2.map(eleve => eleve.prenom);
    let descrEvents = ddescr.map(eleve => eleve.classe);
    let locEvents = dloc.map(eleve => eleve.age);
    let dateEvents1 = ddate.map(eleve => eleve.solde1);
    let dateEvents2 = ddate2.map(eleve => eleve.solde2);
    let dateEvents3 = ddate3.map(eleve => eleve.solde3);

    if (req.session.username) {
        res.render('home', {
            year: date,
            logine: req.session.username + " (Disconnect)",
            notif: noti,
            tevents: titleEvents,
            tevents2: titleEvents2,
            devents: descrEvents,
            levents: locEvents,
            daevents1: dateEvents1,  
            daevents2: dateEvents2,
            daevents3: dateEvents3          
        });
    } else {
        res.render('login', { 
            year: date,
            logine : "Login/Register"
        });
    }
});

//login page/Deconnexion
app.get('/login', function(req, res) {
    if(req.session.username){
        req.session.username = null
    }
    res.render('login', {
        year: date,
        logine:  "Login/Register",
        });
});

//Connexion
app.post('/connect', async (req, res) => {
    
    let user = await dbs.user.findOne({ where : { name: req.body.username }});
    //Verify username
    if (user !== null){
        //verify password
        const isMatch = await Bcrypt.compare(req.body.password, user.pswd);
        if (isMatch){
            req.session.username = req.body.username;
                req.session.notif = "Bon retour, "+req.session.username+" !";
                res.redirect('/');
        }else{
            //Message of error
            console.log( "Nom d'utilisateur ou/et mot de passe érroné. 0");
            res.redirect("/login");
        }
    }else{
        //Message of error
        console.log("Nom d'utilisateur ou/et mot de passe érroné. 1");
        res.redirect("/login");
    }
    
});

//Regitering
app.post('/newUser', async (req, res) =>{

    const user = await dbs.user.findOne({where : { name: req.body.username }});
    console.log(user);
    const email = await dbs.user_email.findOne({where : {mail : req.body.email}});
    console.log(email);

    //Verify username
    if (user === null){

        //Verify Email
        if (email === null){
            try {
                const hashedPassword = await Bcrypt.hash(req.body.password, 10);
                let newUser = await dbs.user.create({name : req.body.username, pswd : hashedPassword});
                console.log("c est bon 2 : " + newUser.name );
                await dbs.user_email.create({mail : req.body.email , user_name : newUser.name});
                req.session.username = req.body.username;
                req.session.notif = "Bienvenue sur notre site "+req.session.username+" !";
                console.log('connected')
                res.redirect('/');
            } catch (error) {
                console.error('Error registering user:', error);
                res.status(500).send('Error registering user');
            }
        }else{
            req.session.notif = "L'e-mail que vous avez choisi: '"+req.body.mail+"' est déjà Utilisée.";
            console.log('email error');
            res.redirect("/login");
        }
    }else{
        req.session.notif = "Le nom d'utilisateur que vous avez choisi: '"+req.body.fname+"' est déjà pris, veuillez en choisir un nouveau.";
        console.log('name error');
        res.redirect("/login");
    }

});

// Route de recherche
app.get('/search', async (req, res) => {
    const query = req.query.query.toLowerCase();

    // Recherche dans la base de données
    const results = await dbs.eleve.findAll({
        where: {
            [Op.or]: [
                { nom: { [Op.like]: '%' + query + '%' } },
                { prenom: { [Op.like]: '%' + query + '%' } },
                { classe: { [Op.like]: '%' + query + '%' } }
            ]
        }
    });

    let titleEvents = results.map(eleve => eleve.nom);
    let titleEvents2 = results.map(eleve => eleve.prenom);
    let descrEvents = results.map(eleve => eleve.classe);
    let locEvents = results.map(eleve => eleve.age);
    let dateEvents1 = results.map(eleve => eleve.solde1);
    let dateEvents2 = results.map(eleve => eleve.solde2);
    let dateEvents3 = results.map(eleve => eleve.solde3);

    res.render('home', {
        year: date,
        logine: req.session.username ? req.session.username + " (Disconnect)" : "Login/Register",
        notif: req.session.notif,
        tevents: titleEvents,
        tevents2: titleEvents2,
        devents: descrEvents,
        levents: locEvents,
        daevents1: dateEvents1,
        daevents2: dateEvents2,
        daevents3: dateEvents3
    });
});





//addEleve page
app.get('/addEleve', function(req, res) {
    if(req.session.username === "admin" || req.session.username === "secretary" ){
        res.render('addEleve', {
            year: date,
            logine: req.session.username + " (Disconnect)",
            });
    }else{
        res.redirect('/');
    }
});

// adding eleve to the db
app.post('/newEleve', async (req, res) => {
    try {
        console.log(req.body); // Ajoutez ceci pour vérifier ce qui est envoyé
        console.log('ok 243')
        const eleve = await dbs.eleve.findOne({ where: { noma: req.body.noma } });
        console.log(eleve);
        console.log('ok 244')
        if (req.session.username) {
            console.log('ok 254')
            if (eleve === null) {
                console.log('ok 264')
                let newEleve = await dbs.eleve.create({
                    noma: req.body.noma,
                    nom: req.body.nom,
                    prenom: req.body.prenom,
                    classe: req.body.classe,
                    age: req.body.age,
                    solde1: req.body.solde1,
                    solde2: req.body.solde2,
                    solde3: req.body.solde3
                });
                console.log('Elève ajouté');
                req.session.notif = "Elève ajouté avec succès.";
                res.redirect('/');
            } else {
                req.session.notif = "L'élève existe déjà.";
                res.redirect("/addEleve");
            }
        } else {
            req.session.notif = "Vous n'êtes pas connecté.";
            res.redirect("/login");
        }
    } catch (error) {
        console.error(error);
        req.session.notif = "Erreur lors de l'ajout de l'élève.";
        res.redirect("/addEleve");
    }
});

// Route pour afficher le formulaire de modification
app.get('/edit/:index', async (req, res) => {
    const index = req.params.index;
    const eleves = await dbs.eleve.findAll();

    if (req.session.username === "admin" || req.session.username === "secretary") {
        if (eleves[index]) {
            res.render('edit', {
                index: index,
                eleve: eleves[index],
                year: date,
                logine: req.session.username + " (Disconnect)"
            });
        } else {
            req.session.notif = "Élève non trouvé.";
            res.redirect('/');
        } 
    } else {
        res.redirect("/");
    }
});

// Route pour mettre à jour les informations de l'élève
app.post('/update/:index', async (req, res) => {
    const index = req.params.index;
    const { noma, nom, prenom, classe, age, solde1, solde2, solde3 } = req.body;
    const eleves = await dbs.eleve.findAll();

    if (eleves[index]) {
        await eleves[index].update({ noma, nom, prenom, classe, age, solde1, solde2, solde3 });
        req.session.notif = "Informations mises à jour avec succès!";
    } else {
        req.session.notif = "Erreur lors de la mise à jour des informations.";
    }

    res.redirect('/');
});


// Route pour supprimer un élève
app.post('/delete/:index', async (req, res) => {
    if (req.session.username === "admin"){
        const index = req.params.index;
        try {
            const eleves = await dbs.eleve.findAll();

            if (eleves[index]) {
                await eleves[index].destroy();
                req.session.notif = "Élève supprimé avec succès!";
            } else {
                req.session.notif = "Erreur lors de la suppression de l'élève.";
            }
        } catch (error) {
            console.error(error);
            console.log("Erreur lors de la suppression de l'élève.");
        }
    }else{
        req.session.notif = "Vous ne pouvez pas effectuer cette action."
    }

    res.redirect('/');
});




//create the server
https.createServer({
    key: fs.readFileSync('static/key/key.pem'),
    cert: fs.readFileSync('static/key/cert.pem'),
    passphrase: 'ingi'
  }, app).listen(process.env.PORT);
console.log('Go to https://localhost:8080');