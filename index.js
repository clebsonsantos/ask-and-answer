const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");
const Pergunta = require("./database/Pergunta");
const Resposta = require("./database/Resposta");

//databse connection -- promisse
connection
.authenticate()
.then(() =>{
    console.log("Conecção feita com o banco de dados")
})
.catch((msgErro) =>{
    console.log(msgErro);
})


app.set('view engine', 'ejs'); // estou dizendo ao express que quero usar o EJS view engine
app.use(express.static('public'));

//linkando o body parser no express
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Rota principal
app.get("/", (req, res) => {
    Pergunta.findAll({ raw: true, order:[
        ['id', 'DESC'] // ASC -> CRESCENTE E DESC -> DECRECENTE
    ] }).then(perguntas =>{
        res.render("index",{
            perguntas: perguntas
        });
    });
    
});

// Rota de perguntas
app.get("/perguntar", (req, res) =>{
    res.render("perguntar");
})

// Salvar pergunta
app.post("/salvarpergunta", (req, res) =>{
    var titulo = req.body.titulo;
    var descricao = req.body.descricao;
    Pergunta.create({
       titulo: titulo,
       descricao: descricao
    }).then(() =>{
        res.redirect("/");
    })
});

app.get("/pergunta/:id", (req, res) =>{
    var id = req.params.id;
    Pergunta.findOne({
        where: {id: id}
    }).then(pergunta => {
        if(pergunta != undefined){
            Resposta.findAll({
                where: {perguntaId: pergunta.id},
                order:[
                    ['id', 'DESC'] // ASC -> CRESCENTE E DESC -> DECRECENTE
                ]
            }).then(respostas =>{
                 //pergunta encontrada
                res.render("pergunta",{
                    pergunta: pergunta,
                    respostas: respostas
                });
            });
        }else{
            // não foi encontrada
            res.redirect("/");
        }
    });
});

app.post("/responder", (req, res) =>{
    var corpo = req.body.corpo;
    var perguntaId = req.body.pergunta;
    Resposta.create({
        corpo: corpo,
        perguntaId: perguntaId
    }).then(()=>{
        res.redirect("/pergunta/"+perguntaId);
    });
});

app.listen(8080, () => {
    console.log("App rodando!!");
})


// > mysql -h localhost -u root -p