var bcrypt = require('bcrypt');
// Keep salt in env file so that key to the code is secure
var salt = process.env.bcryptSalt;

// Handles simple hashing of inputs
function hashThis(input) {
    const hash = bcrypt.hashSync(input, salt);
    return hash
}

// Handles hash comparisons
function compareHash(plainTxt, hash) {
    return bcrypt.compare(plainTxt, hash)
}

// export both functions
module.exports = { hashThis, compareHash }