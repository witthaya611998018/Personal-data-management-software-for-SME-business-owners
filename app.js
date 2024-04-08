const express = require('express');
const body = require('body-parser');
const cookie = require('cookie-parser');
const session = require('express-session');
const mysql = require('mysql');
const connection = require('express-myconnection');
const path = require('path');
const fileUpload = require('express-fileupload');

const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(cookie());
app.use('/assets', express.static('assets'));
app.use('/dist', express.static('dist'));
const folderFileUpload = process.env.FOLDER_FILESUPLOAD;
app.use(`/${folderFileUpload}`, express.static(`${folderFileUpload}`));

app.use(express.static(path.join(__dirname, '/public')));
app.use(fileUpload());
// setting
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(body.json({ limit: '50mb' }));
app.use(body.urlencoded({ limit: '50mb', extended: true }));
// app.set('views' , 'views');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(`${__dirname}/public`));

// middlewares
app.use(session({
  secret: 'Passw0rd',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 60000000 },
}));

config = {
  host: `${process.env.DB_HOST}`,
  user: `${process.env.DB_USER}`,
  password: `${process.env.DB_PASSWORD}`,
  port: 3306,
  database: `${process.env.DB_NAME}`,
  timezone: 'utc'
}

app.use(connection(mysql, config, 'single'));

app.get('/', function (req, res) {
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM TB_TR_ACCOUNT', (err, data) => {
      console.log("data", data);
      //res.json(data);
      if (data !=undefined || data !="") {
        res.render('login', { session: req.session });
      } else {
        res.render('./account/wizard', { session: req.session });
      }
    });
  });
});
app.get('/logout', (req, res) => {
  const id = req.session.userid;
  console.log(id);
  console.log(`session: ${id}`);
  req.getConnection((err, conn) => {
    conn.query('UPDATE TB_TR_ACCOUNT set session_id = null where acc_id = ?', [id], (err, accountupdate) => {
    });
    req.session.destroy((error) => {
      if (error) console.log(error);
      res.redirect('/');
    });
  });
});

const logRoutes = require('./routes/log_routes');

app.use('/', logRoutes);
const groupRoutes = require('./routes/group_routes');

app.use('/', groupRoutes);
const deviceRoutes = require('./routes/device_routes');

app.use('/', deviceRoutes);
const settingRoutes = require('./routes/setting_routes');

app.use('/', settingRoutes);
const accountRoutes = require('./routes/account_routes');

app.use('/', accountRoutes);
const blockRoutes = require('./routes/block_routes');

app.use('/', blockRoutes);
const viewsRoutes = require('./routes/views_routes');

app.use('/', viewsRoutes);
const importdataRoutes = require('./routes/importdata_routes');

app.use('/', importdataRoutes);
const getdataRoutes = require('./routes/getdata_routes');

app.use('/', getdataRoutes);
const exportdataRoutes = require('./routes/exportdata_routes');

app.use('/', exportdataRoutes);
const boardSystem = require('./routes/board_system');

app.use('/', boardSystem);

const routeConsentManagement = require('./routes/route_consent_management/route_consent_management');

app.use('/', routeConsentManagement);

const routeCookieManagemet = require('./routes/route_cookie_managemet/route_cookie_managemet');

app.use('/', routeCookieManagemet);

const routeCookietype = require('./routes/route_cookietype/route_cookietype');

app.use('/', routeCookietype);

const routeDomain = require('./routes/route_domain/route_domain');

app.use('/', routeDomain);

const routeReportAppeal = require('./routes/route_report/route_report_appeal');

app.use('/', routeReportAppeal);

const routeAppealInfraction = require('./routes/route_appeal/route_appeal_infraction');

app.use('/', routeAppealInfraction);

const routeReportPolicy = require('./routes/route_report/route_report_policy');

app.use('/', routeReportPolicy);

const routeReportPattern = require('./routes/route_report/route_report_pattern');

app.use('/', routeReportPattern);

const routeReportClassification = require('./routes/route_report/route_report_classification');

app.use('/', routeReportClassification);

const routeReportCookieconsent = require('./routes/route_report/route_report_cookieconsent');

app.use('/', routeReportCookieconsent);

const routeReportEmailconsent = require('./routes/route_report/route_report_emailconsent');

app.use('/', routeReportEmailconsent);

const routeReportPaperconsent = require('./routes/route_report/route_report_paperconsent');

app.use('/', routeReportPaperconsent);

const routeEmailconsent = require('./routes/route_report/route_report_emailconsent');

app.use('/', routeEmailconsent);


const routeCookieconsent = require('./routes/route_cookieconsent/route_cookieconsent');

app.use('/', routeCookieconsent);

const routeEmail = require('./routes/route_email/route_email');
app.use('/', routeEmail);

const routeemailboard = require('./routes/route_email/route_email_board');
app.use('/', routeemailboard);

const routeOwnerPersonal = require('./routes/route_email/route_email_owner_personal');
app.use('/', routeOwnerPersonal);

const routeAppeal = require('./routes/route_appeal/route_appeal');

app.use('/', routeAppeal);


const rout_security_section = require('./routes/route_security_section/rout_security_section');

app.use('/', rout_security_section);

const routeAnnounce = require('./routes/route_policy/route_policy_announce');

app.use('/', routeAnnounce);

const routeWarn = require('./routes/route_policy/route_policy_warn');

app.use('/', routeWarn);

const routeActivity = require('./routes/route_policy/route_activity_ropa');

app.use('/', routeActivity);

const indexRoute = require('./routes/indexRoute');

app.use('/', indexRoute);
// Agent
const agentRoute = require('./routes/agentsRoute');

app.use('/', agentRoute);
// Pattern
const patternRoute = require('./routes/patternRoute');

app.use('/', patternRoute);
// Classification
const classificationRoute = require('./routes/classificationRoute');

app.use('/', classificationRoute);
// dataOut
const dataoutRoute = require('./routes/dataoutRoute');

app.use('/', dataoutRoute);
// apiToken
const apicheckverifyRoute = require('./routes/apicheckverifyRoute');

app.use('/', apicheckverifyRoute);

const PORT = process.env.PORT || 30000;
app.listen(PORT, () => console.log(`Server Listen PORT ${PORT}`));
