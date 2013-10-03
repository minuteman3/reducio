var Stream = require('stream');

module.exports = function reducio(fold, acc, options) {
    'use strict';
    var stream = new Stream(),
        emitProgress = (options && options.emitProgress) || false,
        progressFreq = (options && options.progressFreq) || 1,
        writeCount = 0,
        partial = acc;
    stream.readable = stream.writable = true;
    stream.paused = false;

    stream.write = function (data) {
        if (acc === undefined) {
            partial = data;
        } else {
            partial = fold.apply(stream, [partial, data]);
        }
        if (stream.emitProgress && (progressFreq === 1 || writeCount % progressFreq === 0)) {
            stream.emit('data', partial);
        }
        return !stream.paused;
    };

    stream.end = function (data) {
        if (data) {
            stream.write(data);
        }
        stream.emit('data', partial);
        stream.emit('end');
        return true;
    };

    return stream;
};
