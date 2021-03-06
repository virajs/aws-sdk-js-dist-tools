

window.AWS.STS = window.AWS.Service.defineService('sts', ['2011-06-15'], {

  credentialsFrom: function credentialsFrom(data, credentials) {
    if (!data) return null;
    if (!credentials) credentials = new window.AWS.TemporaryCredentials();
    credentials.expired = false;
    credentials.accessKeyId = data.Credentials.AccessKeyId;
    credentials.secretAccessKey = data.Credentials.SecretAccessKey;
    credentials.sessionToken = data.Credentials.SessionToken;
    credentials.expireTime = data.Credentials.Expiration;
    return credentials;
  }
});

window.AWS.STS.prototype.assumeRoleWithWebIdentity = function assumeRoleWithWebIdentity(params, callback) {
  return this.makeUnauthenticatedRequest('assumeRoleWithWebIdentity', params, callback);
};

window.AWS.STS.prototype.assumeRoleWithSAML = function assumeRoleWithSAML(params, callback) {
  return this.makeUnauthenticatedRequest('assumeRoleWithSAML', params, callback);
};


