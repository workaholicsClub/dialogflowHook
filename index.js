const Koa = require('koa');
const { dialogflow } = require('actions-on-google');
const KoaBody = require('koa-body');
const KoaActionsOnGoogle = require('koa-aog');
const fs = require('fs');
const path = require('path');
const https = require('https');

const app = new Koa();
const action = dialogflow({ debug: true });

action.intent('Каксла деласла?', async (conv, input) => {
    conv.ask('Да вотсла, плюшкамисла балуемсла!');
});

action.intent('Каксла деласла? - fallback', async (conv, input) => {
    let phrase = conv
                    .query.split(' ')
                    .map( word => word+'сла' )
                    .join(' ');

    conv.ask(phrase);
});

app
    .use(KoaBody())
    .use(KoaActionsOnGoogle({ action: action }));

const config = {
    https: {
        port: 3000,
        options: {
            key: fs.readFileSync(path.resolve(process.cwd(), 'cert/humanistic.tech/privkey1.pem'), 'utf8').toString(),
            cert: fs.readFileSync(path.resolve(process.cwd(), 'cert/humanistic.tech/fullchain1.pem'), 'utf8').toString(),
        },
    },
};

const serverCallback = app.callback();
try {
    const httpsServer = https.createServer(config.https.options, serverCallback);

    httpsServer
        .listen(config.https.port, function(err) {
            if ( Boolean(err) ) {
                console.error('HTTPS server FAIL: ', err, (err && err.stack));
            }
            else {
                console.log(`HTTPS server OK: 0.0.0.0:${config.https.port}`);
            }
        });
}
catch (ex) {
    console.error('Failed to start HTTPS server\n', ex, (ex && ex.stack));
}