var TAPS = {
    2: [2, 1],
    3: [3, 2],
    4: [4, 3],
    5: [5, 3],
    6: [6, 5],
    7: [7, 6],
    8: [8, 6, 5, 4],
    9: [9, 5],
    10: [10, 7],
    11: [11, 9],
    12: [12, 11, 10, 4],
    13: [13, 12, 11, 8],
    14: [14, 13, 12, 2],
    15: [15, 14],
    16: [16, 14, 13, 11],
    17: [17, 14],
    18: [18, 11],
    19: [19, 18, 17, 14],
    20: [20, 17],
    21: [21, 19],
    22: [22, 21],
    23: [23, 18],
    24: [24, 23, 22, 17],
    25: [25, 22],
    26: [26, 6, 2, 1],
    27: [27, 5, 2, 1],
    28: [28, 25],
    29: [29, 27],
    30: [30, 6, 4, 1],
    31: [31, 28]
};

function LFSR(n, seed) {
    this.n = n || this.DEFAULT_LENGTH;
    this.taps = TAPS[this.n];
    seed || (seed = this._defaultSeed(this.n));
    var mask = parseInt(Array(this.n + 1).join('1'), 2);

    this.register = seed & mask;
}

LFSR.prototype = {
    TAPS: TAPS,
    DEFAULT_LENGTH: 31,
    shift: function() {
        var tapsNum = this.taps.length,
            i,
            bit = this.register >> this.n - this.taps[0];

        for (i = 1; i < tapsNum; i++) {
            bit = bit ^ this.register >> this.n - this.taps[i];
        }

        bit = bit & 1;
        this.register = this.register >> 1 | bit << this.n - 1;

        return bit & 1;
    },
    seq: function(n) {
        var seq = 0;

        for (var i = 0; i < n; i++) {
            seq = seq << 1 | this.shift();
        }

        return seq;
    },
    seqString: function(n) {
        var seq = '';

        for (var i = 0; i < n; i++) {
            seq += this.shift();
        }

        return seq;
    },
    maxSeqLen: function() {
        var initialState = this.register,
            counter = 0;

        do {
            this.shift();
            counter++;
        } while (initialState != this.register);

        return counter;
    },
    _defaultSeed: function(n) {
        if (!n) {
            throw new Error('n is required');
        }

        var lfsr = new LFSR(8, 92914);

        return lfsr.seq(n);
    }
};

module.exports = LFSR;
