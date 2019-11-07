const bcrypt = require('bcrypt');

// Handles simple hashing of inputs
function hashThis(input) {
    // console.log("hashThis input:", input);
    // console.log("hashThis salt:", process.env.salt);
    const hash = bcrypt.hashSync(input, process.env.salt);
    return hash
}

// Handles hash comparisons
function compareHash(plainTxt, hash) {
    // console.log("compareHash plainTxt:", plainTxt);
    // console.log("compareHash hash:", hash);
    return bcrypt.compare(plainTxt, hash)
}

// export both functions
module.exports = { hashThis, compareHash }