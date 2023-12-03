const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client } = require('pg');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

const client = new Client({
    user : process.env.POSTGRES_USER,
    host : process.env.POSTGRES_HOST,
    database : 'postgres',
    password : process.env.POSTGRES_PASSWORD,
    port : process.env.POSTGRES_PORT
});

client.connect();

app.post('/login', (req, res) => {
    let query = {
        text : 'select * from member where id = $1 and password = $2',
        values : [req.body.data.id, req.body.data.psw]
    }
    client.query(query)
        .then((response) => {
            if(response.rowCount === 0)
                return res.send('login fail')
        }).catch((e) => {console.error(e.stack)})

    query = {
        text : 'select * from gamemember where id = $1',
        values : [req.body.data.id]
    }
    client.query(query)
        .then((response) => {
            return res.send(response.rows[0])
        }).catch((e) => {console.error(e.stack)})
    return 'error';
})

app.post('/duplic', (req, res) => {

    const query = {
        text : 'select * from member where id = $1',
        values : [req.body.data.id]
    }
    client.query(query)
        .then((response) => {
            return res.send(response.rowCount > 0 ? 'fail' : 'sucess');
        }) 
    return 'error';
})

app.post('/sign', (req, res) => {
    let query = {
        text : 'insert into member values($1, $2, $3, $4, $5)',
        values : [req.body.data.id, req.body.data.psw, req.body.data.email, req.body.data.nickname, req.body.data.phone]
    }
    client.query(query)
        .then((response) => {

        }).catch((e) => {console.error(e.stack)})

    query = {
        text : 'insert into gamemember values($1, $2, 0, 0)',
        values : [req.body.data.id, req.body.data.nickname]
    }
    client.query(query)
        .then((response) => {
            return res.send('sucess')
        }).catch((e) => {console.error(e.stack)})
    return 'error';
})

app.post('/score', (req, res)=> {
    const query = {
        text : 'select * from gamemember order by score desc'
    };
    client.query(query)
        .then((response) => {
            return res.send(response.rows)
        })
    return 'error';
})

app.post('/exit', (req, res) => {
    let profile = req.body.data.profile;
    
    let query = {
        text : 'select * from gamemember where id = $1 order by score desc',
        values : [profile.id]
    }
    
    client.query(query)
        .then((response) =>{
            if(response.rowCount > 0){
                let target = response.rows[0]
                
                if(req.body.data.score <= target.score){
                    return res.send('low score')
                }else{
                    query = {
                        text : 'update gamemember set score=$1, levels=$2 where id=$3',
                        values : [req.body.data.score, profile.levels + 1, profile.id]
                    };
                
                    client.query(query)
                        .then((reponse)=>{
                            return res.send('sucess')
                        })
                }
            }else{
                return res.send('not information')
            }
        })
    return 'error';
})

app.post('/selectProfile', (req, res) => {
    const query = {
        text : 'select * from member where id = $1',
        values : [req.body.data.id]
    }
    client.query(query)
        .then((response) => {
            return res.send(response.rows[0])
        });
    return 'error';
})

app.post('/updateProfile', (req, res) => {
    let query = {
        text : 'update member set password=$1, email=$2, nickname=$3, phone=$4 where id=$5',
        values : [req.body.data.psw, req.body.data.email, req.body.data.nickname, req.body.data.phone, req.body.data.id]
    }
    client.query(query)
        .then((response) => {

        });
    query = {
        text : 'update gamemember set nickname=$1 where id=$2',
        values : [req.body.data.nickname, req.body.data.id]
    };
    client.query(query)
        .then((response) => {
            return res.send('sucess')
        })
    return 'error';
})

app.listen(PORT, ()=>console.log(`${PORT} Listenling!`));