const { getAddress } = require('@harmony-js/crypto')

//test account address, keys under
//one1eryvceds3v47qvn72a2jyj79x3fey3h3v4wcmc
const testAccount = "0xc8c8cc65b08b2be0327e5755224bc534539246f1";

module.exports = function() {
    async function getBUSDInformation() {

        let addr = getAddress(testAccount).bech32;

        console.log("one address = ", addr);

        process.exit(0);

    }
    getBUSDInformation();
};
