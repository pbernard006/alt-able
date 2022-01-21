/* eslint-disable */
const express = require('express')
const app = express()

const cors = require('cors')

const mongoose = require('mongoose')
const router = require('./routes/routes')

const Sentry = require('@sentry/node');
const Tracing = require("@sentry/tracing");

const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json');

const port = 8080

// Sentry
Sentry.init({
  dsn: "https://5662cf6bf96b4cba8a6468951331161e@o1059903.ingest.sentry.io/6048981",
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// Middlewares
app.use(express.json())
app.use(router)
app.use(cors({origin: '*'}));

// MongoDB
mongoose.connect('mongodb+srv://hugobarsacq:hugobarsacq@cluster0.rhjep.mongodb.net/altable?retryWrites=true&w=majority',{
  useNewUrlParser : true,
  useUnifiedTopology: true
})
const db = mongoose.connection;
db.on("error",console.error.bind(console, "Erreur de connexion à Mongo : "));
db.once("open", function () {
  console.log("Connexion à Mongo OK");
})


app.get('/hello', (req, res) => {
  res.send('Hello World!')
})


app.get('/error', (req, res) => {
  throw new Error('Oups, test error')
})


app.get('/Sentry', (req, res) => {
  throw new Error('Sentry is working V2')
})

// The error handler must be before any other error middleware and after all controllers
// Par défaut, errorHandlerne capture que les erreurs avec un code d'état 500supérieur ou égal à (voir doc pour modifier)
app.use(Sentry.Handlers.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});

app.use(
  swaggerUi.serve, 
  swaggerUi.setup(swaggerDocument)
);

app.listen(port, () => {
  console.log(`Run at http://localhost:${port}`)
})

module.exports = app;
