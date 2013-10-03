var Stream = require('stream');

module.exports = function reducio(fold, acc, options) {
    'use strict';
    var stream = new Stream(),
        emitProgress = (options && options.emitProgress) || false,
        progressFreq = (options && options.progressFreq) || 1,
        writeCount = 0;
    stream.readable = stream.writable = true;
    stream.paused = false;
    stream.acc = acc;

    stream.write = function (data) {
        if (acc === undefined) {
            acc = data;
        } else {
            stream.acc = fold.apply(stream, [stream.acc, data]);
        }
        if (stream.emitProgress && (progressFreq === 1 || writeCount % progressFreq === 0)) {
            stream.emit('data', stream.acc);
        }
        return !stream.paused;
    };

    stream.end = function (data) {
        if (data) {
            stream.write(data);
        }
        stream.emit('data', stream.acc);
        stream.emit('end');
        return true;
    };

    return stream;
}
