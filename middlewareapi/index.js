const express = require('express');
const cors = require('cors')
const https = require('https');
const querystring = require('querystring');
const morgan = require("morgan");
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const bodyParser = require('body-parser');

const adminToken = 'xyz';

let authorizerUsersDatabase = {} //stores Customer ID
let authorizerShoppingCartsDatabase = {} //stores Cart ID

// Create Express Server
const app = express();

// Configuration
const PORT = 82;
const HOST = "localhost";
const API_SERVICE_URL = "https://magento.local/rest/default/V1";

// Logging
app.use(morgan('dev'));
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Authorization
app.use('', (req, res, next) => {
  if (req.headers.authorization) {
    //Here should go authorization with Okta (or other service)

    next();
  } else {
    res.sendStatus(403);
  }
});

// Proxy endpoints
app.all('/*', createProxyMiddleware({
  target: API_SERVICE_URL,
  changeOrigin: true,
  secure: false,
  pathRewrite: async function(path, req) {

    let email = req.headers.authorization.substr(7)
    //rewrite API path for customer
    if (path.indexOf('customers/me') !== -1) {
      if (!authorizerUsersDatabase.hasOwnProperty(email)) {
        let id = await makeSynchronousUserRequest(email);
        let cart = await makeSynchronousCartRequest(id);
        authorizerUsersDatabase[email] = id;
        authorizerShoppingCartsDatabase[email] = cart;
      }
      return path.replace('customers/me', 'customers/' + authorizerUsersDatabase[email])
    }
    //rewrite API path for customer's shopping cart
    if (path.indexOf('carts/mine') !== -1) {
      if (!authorizerShoppingCartsDatabase.hasOwnProperty(email)) {
        let id = await makeSynchronousUserRequest(email);
        let cart = await makeSynchronousCartRequest(id);
        authorizerUsersDatabase[email] = id;
        authorizerShoppingCartsDatabase[email] = cart;
      }
      return path.replace('carts/mine', 'carts/' + authorizerShoppingCartsDatabase[email])
    }
    return path
  },
  onProxyReq: async function onProxyReq(proxyReq, req, res) {
    proxyReq.setHeader('Authorization', 'Bearer ' + adminToken)
    if (req.method == 'POST' && req.body) {

      //rewrite POST data for shopping cart
      let email = req.headers.authorization.substr(7)
      // Make any needed POST parameter changes
      if (req.body.cartItem && req.body.cartItem.quote_id) {
        if (!authorizerUsersDatabase.hasOwnProperty(email)) {
          let id = await makeSynchronousUserRequest(email);
          let cart = await makeSynchronousCartRequest(id);
          authorizerUsersDatabase[email] = id;
          authorizerShoppingCartsDatabase[email] = cart;
        }
        req.body.cartItem.quote_id = authorizerShoppingCartsDatabase[email]
      }
      let bodystring = JSON.stringify(req.body);
      proxyReq.setHeader('content-length', bodystring.length);
      proxyReq.write(JSON.stringify(req.body));
      proxyReq.end();
    }
  },
}));

// Start the Proxy
app.listen(PORT, HOST, () => {
  console.log(`Starting Proxy at ${HOST}:${PORT}`);
});

function getUserID(email) {
  return new Promise((resolve, reject) => {
    let url = API_SERVICE_URL + '/customers/search?' + querystring.stringify({
      'searchCriteria[filter_groups][0][filters][0][field]': 'email',
      'searchCriteria[filter_groups][0][filters][0][value]': email,
      'searchCriteria[filter_groups][0][filters][0][condition_type]': 'like'
    })
    https.get(url,{
      rejectUnauthorized: false,
      headers: {'Authorization': 'Bearer ' + adminToken}
    }, (response) => {
      let chunks_of_data = [];
      response.on('data', (fragments) => {
        chunks_of_data.push(fragments);
      });
      response.on('end', () => {
        let response_body = Buffer.concat(chunks_of_data);
        resolve(JSON.parse(response_body.toString()));
      });
      response.on('error', (error) => {
        reject(error);
      });
    });
  });
}

function getUserCart(id) {
  return new Promise((resolve, reject) => {
    let url = API_SERVICE_URL + '/customers/'+ id + '/carts'
    const agent = new https.Agent({
      rejectUnauthorized: false
    });
    axios({
      method: 'post',
      url: url,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: {'Authorization': 'Bearer ' + adminToken}
    })
      .then(function (response) {
        // handle success
        resolve(response)
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .then(function () {
        // always executed
      });
  });
}

async function makeSynchronousUserRequest(email) {
  try {
    let response = await getUserID(email);
    return response.items[0].id;
  }
  catch(error) {
    // Promise rejected
    console.log(error);
  }
}

async function makeSynchronousCartRequest(userId) {
  try {
    let response = await getUserCart(userId);
    console.log('res2',response.data)
    return response.data
  }
  catch(error) {
    // Promise rejected
    console.log(error);
  }
}