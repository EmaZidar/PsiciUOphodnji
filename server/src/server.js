const express = require('express')

const app = express()

app.get('/', function(_req, res) {
  res.send('Hello World')
})

// TODO treba promijeniti port da slusa na 80 (za http) i/ili 443 (za https)
// korisno: https://stackoverflow.com/a/11745114
app.listen(3000)