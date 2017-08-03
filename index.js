var express = require('express');
var app = express();

// Port
app.set('port', (process.env.PORT || 5000));

app.use(express.static([__dirname, '/public'].join()));

// Routes
// app.set('index', [__dirname, '/index'].join());
app.set('view engine', 'html');

app.get('/', function(request, response) {
  response.render('index');
});
