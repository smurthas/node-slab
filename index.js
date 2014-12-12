var querystring = require('querystring');

var request = require('request');
var sodium = require('sodium').api;

module.exports = function(options, callback) {
  var url = options.uri || (options.host + options.path);
  if (options.qs && Object.keys(options.qs).length > 0) {
    url += '?' + querystring.stringify(options.qs);
    delete options.qs;
  }
  if (options.debug) console.error('url', url);
  options.uri = url;
  var message =  options.method.toUpperCase()+'\n'+url+'\n';

  if (options.body) {
    message += options.body;
  } else if (options.json) {
    message += JSON.stringify(options.json);
  }

  if (options.debug) console.error('message', message);
  if (options.debug) console.error('options', options);
  var signature = module.exports.signObject(message, options.secretKey);
  options.headers = options.headers || {};
  options.headers['X-Slab-Signature'] = signature;
  options.headers['X-Slab-PublicKey'] = options.publicKey;
  options.json = options.json || true;

  if (options.debug) console.error('options.uri', JSON.stringify(options.uri));
  if (options.debug) console.error('options', JSON.stringify(options, 2, 2));
  request(options, callback);
};

module.exports.get = function(options, callback) {
  options.method = 'get';
  module.exports(options, callback);
};

module.exports.post = function(options, callback) {
  options.method = 'post';
  module.exports(options, callback);
};

module.exports.put = function(options, callback) {
  options.method = 'put';
  module.exports(options, callback);
};

module.exports.delete = function(options, callback) {
  options.method = 'delete';
  module.exports(options, callback);
};

module.exports.signObject = function(object, secretKey) {
  var message = new Buffer(typeof object === 'string' ? object :JSON.stringify(object), 'utf8');
  var sealedMessage = sodium.crypto_sign(message, new Buffer(secretKey, 'hex'));
  return sealedMessage.slice(0, sodium.crypto_sign_BYTES).toString('hex');
};

