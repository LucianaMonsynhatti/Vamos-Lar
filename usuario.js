const express = require('express');
const expressMongoDb = require('express-mongo-db');
const bodyParser = require('body-parser');
const cors = require('cors');
const ObjectID = require('mongodb').ObjectID;

const app = express();

app.use(expressMongoDb('mongodb://localhost/client'));
app.use(bodyParser.json());
app.use(cors());


function fichaCadastro(dados){
    let usuario = {
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone,
        endereço: dados.endereço,
        senha: dados.senha,
    
    }

    return usuario;
}

function fichaLogin(dados){
    let usuario = {
        email: dados.email,
        senha: dados .senha
    }

    return usuario;
}

function validarEmail(email) {
    if(email.indexOf('@') == -1){
        return false;
    }
    return true
}

function validarSenha(senha){
    let senhaValida = /^[a-zA-Z0-9]{8,}$ /; //Cria uma RegExp para a senha
    senhaValida.compile();
    return senhaValida.test(senha)
}


app.post('/entrada', (req, res) => {
    let cadastro = req.body.cadastro;
    
    // Executa o if caso o atributo cadastro, que é booleano, for verdadeiro, caso falso, executa o else 
    if (cadastro) {
        let novoUsuario =  fichaCadastro(req.body); // Garante que o objeto está formatado corretamente

        // Valida o email 
        if(validarEmail(novoUsuario.email)){

            // Valida a senha
            if(validarSenha(novoUsuario.senha)){
                let email = {
                    "email": novoUsuario.email
                };
                // Procura um registro do email, caso não encontre, registra o usuário, se encontrar, não o registra 
                req.db.collection('usuarios').find(email).toArray((error, data) => {
                    if(error){
                        res.status(500).send('Erro ao acessar o servidor.');
                    }
                    if(!Boolean(data[0])){
                        req.db.collection('usuarios').insert(novoUsuario, (err) =>{
                            if(err){
                                res.status(500).send('Erro ao acessar o servidor.');
                                return;
                            }
                            res.send('cadastrado');
                        });
                       
                    }
                    else{
                        res.status(409).send('Email já utilizado anteriormente');
                    }
                });
            }
            else{
                res.status(400).send('Senha inválida');
            }
        }
        else{
            res.status(400).send('Email inválido');
        }
    }
    else{
        let usuarioEntrando = fichaLogin(req.body);
        req.db.collection('usuarios').findOne(usuarioEntrando, (error, data) =>{
            if(error){
                res.status(500).send('Erro ao acessar o banco de dados');
            }
            if(!data){
                res.status(401).send('Email ou senha não encontrados, tente novamente');
            }
            else{
                res.send(data);
            }
        });
    }
    
});

app.get('/usuarios', (req, res) => {
    req.db.collection('usuarios').find().toArray((error, data) =>{
        if(error){
            res.status(500).send('Erro ao acessar o banco de dados');
            return;
        }
        res.send(data);
    });
});

app.get("/buscar/:id", (req, res) => {
    let query = {
        _id: ObjectID(req.params.id)
    };

    req.db.collection('usuarios').findOne(query, (error, data) => {

        if(error){
            res.status(500).send('usuário não existe');
            return;
        }

        if(!data){
            res.status(404).send('não encontrado');
            return;
        }

        res.send(data);
    });
});

app.get("/buscar/nome/:nome", (req, res) => {
    let query = {
        nome: req.params.nome
    };

    req.db.collection('usuarios').find(query).toArray((error, data) => {

        if(error){
            res.status(500).send('usuário não existe');
            return;
        }

        if(data === []){
            res.status(404).send('não encontrado');
            return;
        }

        res.send(data);
    });
});

app.put("/atualizar/:id", (req, res) => {
    let query = {
        _id: ObjectID(req.params.id)
    };

    let atualizacaoUsuario = fichaCadastro(req.body);

    req.db.collection('usuarios').updateOne(query, atualizacaoUsuario, (error, data) => {
        
        if(error){
            res.status(500).send('Erro ao atualizar usuario');
            return;
        }

        res.send(data);
    });
});


app.delete("/excluir/:id", (req, res) => {
    let query = {
        _id: ObjectID(req.params.id)
    };
    req.db.collection('usuarios').findOne(query, (error, data) => {

        if(error){
            res.status(500).send('usuário não existe');
            return;
        }

        if(!data){
            res.status(404).send('não encontrado');
            return;
        }
    });
    req.db.collection('usuarios').deleteOne(query, (error, data) => {
        
        if(error){
            res.status(500).send('Erro ao deletar ususario');
            return;
        }
    });
});

app.listen(3001);