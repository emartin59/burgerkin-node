/**
 * 
 * Summary. 
 *
 * Desc
 *
 * @author Oren Zakay.
 */

const KinClient = require('@kinecosystem/kin-sdk-node').KinClient;
const Environment = require('@kinecosystem/kin-sdk-node').Environment;
const config = require('../config')

const client = new KinClient(Environment.Testnet);

let masterAccount

async function getMasterAccount() {
  if (!masterAccount) {
    masterAccount = await client.createKinAccount({
      seed: config.master_seed,
      appId: config.appId
    });
  }
  return masterAccount
}

async function isAccountExisting(wallet_address) {
  try {
    const result =  await client.isAccountExisting(wallet_address)
    return result
  }
  catch(error) {
    return false
  } 
}

async function validateTransaction(transactionId) {
  const data = await client.getTransactionData(transactionId)

  return  data 
          //check for correct amount
          && data.hasOwnProperty('amount') 
          && data.amount === config.game_fee 
          //check for transaction date
          && data.hasOwnProperty('timeStamp')
          &&  new Date() - Date(data.timestamp) < 10
}
async function createAccount(wallet_address) {
  console.log("buildCreateAccount -> " + wallet_address)
  // Sign the account creation transaction
  const masterAccount = await getMasterAccount()
  let createAccountBuilder = await masterAccount.buildCreateAccount({
    address: wallet_address,
    startingBalance: 100,
    fee: 100,
    memoText: "C" + createID(9)
  })

  console.log("submitTransaction createAccountTransaction -> " + wallet_address)
  // // Send the account creation transaction to blockchain
  const id = await masterAccount.submitTransaction(createAccountBuilder)
  console.log("createAccount transaction id  -> ", id)
}

async function payToUser(wallet_address, amount) {
  //console.log("payToUser -> " + wallet_address + " with amount = " + amount)
  const masterAccount = await getMasterAccount()
  const transactionBuilder = await masterAccount.buildSendKin({
    address: wallet_address,
    amount: amount,
    fee: 100,
    memoText: createID(10)
  })

  await masterAccount.submitTransaction(transactionBuilder)
  console.log("payToUser submitTransaction -> ", transactionBuilder)
}

function createID(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result
}

module.exports = {
  validateTransaction,
  isAccountExisting,
  createAccount,
  payToUser
}