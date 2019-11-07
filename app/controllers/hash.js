const bcrypt = require('bcrypt');

// Keep salt in env file so that key to the code is secure
// const salt = process.env.bcryptSalt;
console.log("env salt:", process.env.salt);

const salt ="$2b$10$71a572gQNwnao9er1mIk8O";


// Handles simple hashing of inputs
function hashThis(input) {
    console.log("hashThis input:", input);
    console.log("hashThis salt:", salt);
    const hash = bcrypt.hashSync(input, salt);
    return hash
}

// Handles hash comparisons
function compareHash(plainTxt, hash) {
    console.log("compareHash plainTxt:", plainTxt);
    console.log("compareHash hash:", hash);
    return bcrypt.compare(plainTxt, hash)
}

// export both functions
module.exports = { hashThis, compareHash }