const mysql =require('mysql');

const connection = mysql.createConnection({
    host : 'localhost',
    user: 'root',
    password: 'password',
    database: 'cricinshots_notes',
});

connection.connect((err)=>{
    if(!err){
        console.log('Connected!');
    }else{
        console.log("Connection failed!");
    }
})

module.exports = connection;
