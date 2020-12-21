const express = require('express');
const nanoId = require('nano-id');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

//Путь к файлу БД
const fileDataBaseName = "./db.json";

//Если файла не существует, создаём его
if (!fs.existsSync(fileDataBaseName)) {
    fs.writeFileSync(fileDataBaseName, JSON.stringify({}));
}

//Читаем файл
const fileDataBase = fs.readFileSync(fileDataBaseName);
console.log(fileDataBase);

//Парсим в JSON
let jsonDB = JSON.parse(fileDataBase);

app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/getqr', (req, res) => {
    //Необходимо сформировать новый токен
    let newToken = nanoId(14);
    console.log(newToken);

    //И добавить его в базу данных
    jsonDB[newToken] = 'allow'

    //А затем сохранить в файле
    fs.writeFileSync(fileDataBaseName, JSON.stringify(jsonDB));

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(JSON.stringify({ token: newToken }))
})

app.post('/checkqr', function(req, res) {
    if (jsonDB.hasOwnProperty(req.body.code)) {
        //Удаляем из БД токен
        delete jsonDB[req.body.code];

        //А затем сохранить в файле
        fs.writeFileSync(fileDataBaseName, JSON.stringify(jsonDB));

        res.send(JSON.stringify({ allow: 'yes' }));
    } else {
        res.send(JSON.stringify({ allow: 'no' }));
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})