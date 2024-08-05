// Import Sequelize
const { name } = require('ejs');
const { Sequelize, DataTypes, Model, Op } = require('sequelize')
var db = {};

// Creation of database link
const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "preparatoryproject.sqlite"
})

class User extends Model{}

class User_Email extends Model{}

class Eleve extends Model{}



User.init({
    name: {
        type: DataTypes.TEXT,
        primaryKey: true,
        allowNull: false,
        unique: true
    },
    pswd: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'User'
});

User_Email.init({
    id : {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
    },
    mail: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
    },
    user_name: {
        type: DataTypes.TEXT,
        references: {
            model: User,
            key: 'name'
        }
    }
}, {
    sequelize,
    modelName: 'User_Email'
});

Eleve.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    noma: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    nom: {
        type: DataTypes.TEXT,
        allowNull: false,
        
    },
    prenom: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    classe: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    age: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    solde1: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    solde2: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    solde3: {
        type: DataTypes.FLOAT,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'Eleve'
});






db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.user = User;
db.user_email = User_Email;
db.eleve = Eleve;
db.Op = Op;




(async () => {
  await db.sequelize.sync({ force: true });
});
  

// db.sequelize.sync({force: true});  




module.exports = db;

