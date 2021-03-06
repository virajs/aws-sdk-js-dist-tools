

window.AWS.Glacier = window.AWS.Service.defineService('glacier', ['2012-06-01'], {
  setupRequestListeners: function setupRequestListeners(request) {
    request.on('validate', this.validateAccountId);
    request.on('build', this.addGlacierApiVersion);
    request.on('build', this.addTreeHashHeaders);
  },

  validateAccountId: function validateAccountId(request) {
    if (request.params.accountId !== undefined) return;
    request.params = window.AWS.util.copy(request.params);
    request.params.accountId = '-';
  },

  addGlacierApiVersion: function addGlacierApiVersion(request) {
    var version = request.service.api.apiVersion;
    request.httpRequest.headers['x-amz-glacier-version'] = version;
  },

  addTreeHashHeaders: function addTreeHashHeaders(request) {
    if (request.params.body === undefined) return;

    var hashes = request.service.computeChecksums(request.params.body);
    request.httpRequest.headers['x-amz-content-sha256'] = hashes.linearHash;

    if (!request.httpRequest.headers['x-amz-sha256-tree-hash']) {
      request.httpRequest.headers['x-amz-sha256-tree-hash'] = hashes.treeHash;
    }
  }
});

window.AWS.util.update(window.AWS.Glacier.prototype, {



  computeChecksums: function computeChecksums(data) {
    if (!window.AWS.util.Buffer.isBuffer(data)) data = new window.AWS.util.Buffer(data);

    var mb = 1024 * 1024;
    var hashes = [];
    var hash = window.AWS.util.crypto.createHash('sha256');

    for (var i = 0; i < data.length; i += mb) {
      var chunk = data.slice(i, Math.min(i + mb, data.length));
      hash.update(chunk);
      hashes.push(window.AWS.util.crypto.sha256(chunk));
    }

    return {
      linearHash: hash.digest('hex'),
      treeHash: this.buildHashTree(hashes)
    };
  },


  buildHashTree: function buildHashTree(hashes) {
    while (hashes.length > 1) {
      var tmpHashes = [];
      for (var i = 0; i < hashes.length; i += 2) {
        if (hashes[i+1]) {
          var tmpHash = new window.AWS.util.Buffer(64);
          tmpHash.write(hashes[i], 0, 32, 'binary');
          tmpHash.write(hashes[i+1], 32, 32, 'binary');
          tmpHashes.push(window.AWS.util.crypto.sha256(tmpHash));
        } else {
          tmpHashes.push(hashes[i]);
        }
      }
      hashes = tmpHashes;
    }

    return window.AWS.util.crypto.toHex(hashes[0]);
  }
});


