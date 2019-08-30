const {createHash} = require('crypto');  // P R O V I D E S     C R Y P T O G R A P H I C     F U N C T I O N A L I T I E S  (hash,cipher,decipher,sign,verify) 

const {CryptoFactory, createContext} = require('sawtooth-sdk/signing'); // F A C T O R Y     F O R     G E N E R A T I N G     S I G N E R S

const protobuf = require('sawtooth-sdk/protobuf');  // M E T H O D     F O R     S E R I A L I Z I N G     D A T A  

const fs = require('fs') ;   // A L L O W S     U S     T O     W O R K     W I T H     F I L E S     O N     O U R     C O M P U T E R

const fetch = require('node-fetch'); // F O R     M A K I N G     H T T P     R E Q U E S T S     W I T H     N O D E J S 

const {Secp256k1PrivateKey} = require('sawtooth-sdk/signing/secp256k1');

const {TextEncoder, TextDecoder} = require('text-encoding/lib/encoding'); // T O     E N C O D E    &     D E C O D E     D A T A 

var encoder = new TextEncoder('utf8');
  
FAMILY_NAME = 'certificate';

const CERTIFICATEKEY = '54763a5bfbbd80ab4b6dde1e86bea7e8dc6904719859f792ae215c31b9586696';
  


// C R E A T I N G     A     H A S H     V A L U E
function hash(data) {
  return createHash('sha512').update(data).digest('hex');
}
  


// F U N C T I O N     R E T U R N I N G     C H D     C E R T I F I C A T E     A D D R E S S     B A S E D     O N     U S N
function getHypCertificateAddress(usn){

  const context = createContext('secp256k1');
  let key = Secp256k1PrivateKey.fromHex(CERTIFICATEKEY.trim());
  let signer = new CryptoFactory(context).newSigner(key);
  let publicKeyHex = signer.getPublicKey().asHex();
  let keyHash = hash(publicKeyHex);
  let nameHash = hash("certificate");
  let HypHash = hash("CHD");
  let usnHash = hash(usn);
  return nameHash.slice(0,6) + HypHash.slice(0,6) + usnHash.slice(0,4) + keyHash.slice(0,54);

}



// F U N C T I O N     R E T U R N I N G     C E D     C E R T I F I C A T E     A D D R E S S     B A S E D     O N     U S N
function getEthCertificateAddress(usn){

  const context = createContext('secp256k1');
  let key = Secp256k1PrivateKey.fromHex(CERTIFICATEKEY.trim());
  let signer = new CryptoFactory(context).newSigner(key);
  let publicKeyHex = signer.getPublicKey().asHex();
  let keyHash = hash(publicKeyHex);
  let nameHash = hash("certificate");
  let EthHash = hash("CED");
  let usnHash = hash(usn);
  return nameHash.slice(0,6) + EthHash.slice(0,6) + usnHash.slice(0,4) + keyHash.slice(0,54);

}

// C R E A T I N G     T R A N S A C T I O N S  
function createTransaction(familyName, inputList, outputList, privateKey, payload, familyVersion = '1.0'){

  const context = createContext('secp256k1');
  const secp256k1pk = Secp256k1PrivateKey.fromHex(privateKey.trim());
  var signer = new CryptoFactory(context).newSigner(secp256k1pk);
  const payloadBytes = encoder.encode(payload);
  

  // C R E A T I N G     T R A N S A C T I O N     H E A D E R
  const transactionHeaderBytes = protobuf.TransactionHeader.encode({
    familyName: familyName,
    familyVersion: familyVersion,
    inputs: inputList,
    outputs: outputList,
    signerPublicKey: signer.getPublicKey().asHex(),
    nonce: "" + Math.random(),
    batcherPublicKey: signer.getPublicKey().asHex(),
    dependencies: [],
    payloadSha512: hash(payloadBytes),
  }).finish();
  

  // C R E A T I N G     T R A N S A C T I O N S
  const transaction = protobuf.Transaction.create({
    header: transactionHeaderBytes,
    headerSignature: signer.sign(transactionHeaderBytes),
    payload: payloadBytes
  });
  const transactions = [transaction];


  // C R E A T I N G     B A T C H     H E A D E R
  const  batchHeaderBytes = protobuf.BatchHeader.encode({
    signerPublicKey: signer.getPublicKey().asHex(),
    transactionIds: transactions.map((txn) => txn.headerSignature),
  }).finish();


  // C R E A T I N G     B A T C H E S
  const batchSignature = signer.sign(batchHeaderBytes);
  const batch = protobuf.Batch.create({
    header: batchHeaderBytes,
    headerSignature: batchSignature,
    transactions: transactions,
  });


  // C R E A T I N G     B A T C H     L I S T
  const batchListBytes = protobuf.BatchList.encode({
    batches: [batch]
  }).finish();

  sendTransaction(batchListBytes);	
}



// S U B M I T     B A T C H L I S T B Y T E S     T O     V A L I D A T O R
async function sendTransaction(batchListBytes){
  
  let resp =await fetch('http://rest-api:8008/batches', {
     method: 'POST',
     headers: { 'Content-Type': 'application/octet-stream'},
     body: batchListBytes
     })
        console.log("response", resp);
}



// C E R T I F I C A T E     C L A S S 
class CertificateClient{

  // F U N C T I O N     T O     A D D     N E W     C H D     C E R T I F I C A T E S
  addHypCertificate(key, name, usn, grade, date){

    var f_name = FAMILY_NAME;
    var address = getHypCertificateAddress(usn);
    var payload = [name,usn,grade,date].join(',');
    createTransaction(f_name,[address],[address],key,payload);

  }

  // F U N C T I O N     T O     A D D     N E W     C E D     C E R T I F I C A T E S
  addEthCertificate(key, name, usn, grade, date){
    var f_name = FAMILY_NAME;
    var address = getEthCertificateAddress(usn);
    var payload = [name,usn,grade,date].join(',');
    createTransaction(f_name,[address],[address],key,payload);

  }



// F U N C T I O N     T O     D R O P     I N D I V I D U A L     C E R T I F I C A T E     B A S E D     O N     U S N 
  async dropCertificate(usn){
    
    // C H E C K I N G     W H E T H E R     U S N     I S     S T O R E D     I N     S T A T E 
    var state = await this.getCertificateListings(usn); //  G E T T I N G     T H E     S T A T E 
   
    if(state.data.length===0){
      console.log("\n\n\n U S N    : "+usn+"     I S     N O T     F O U N D  \n\n\n");
    }
   
    state.data.forEach(certs => {
      if(!certs.data){
        console.log(" U S N     D A T A     N O T     M A  T C H I N G ");
        return;  // I F     T H E     S T A T E     I S     E M P T Y   ,   T H E N     R E T U R N
      }  
      
      let decodeddata = Buffer.from(certs.data,'base64').toString();
      var certificates = decodeddata.split(',');

      var reg_chd = /^(CHD)/;
      var reg_ced = /^(CED)/;
      if(reg_chd.test(usn)){
        var f_name = FAMILY_NAME;
        var key = CERTIFICATEKEY;
        var address = getHypCertificateAddress(usn);
        var payload = [usn];
        createTransaction(f_name,[address],[address],key,payload);
      }
      if(reg_ced.test(usn)){
        var f_name = FAMILY_NAME;
        var key = CERTIFICATEKEY;
        var address = getEthCertificateAddress(usn);
        var payload = [usn];
        createTransaction(f_name,[address],[address],key,payload);
      }


    });   
  }



  // G E T     S T A T E     F R O M     R E S T _ A P I
  async getState (address, isQuery) {
    let stateRequest = 'http://rest-api:8008/state';
    if(address) {
      if(isQuery) {
        stateRequest += ('?address=')
      } else {
        stateRequest += ('/address/');
      }
      stateRequest += address;
    }
    let stateResponse = await fetch(stateRequest);
    let stateJSON = await stateResponse.json();
    return stateJSON;
  }



  // G E T     T H E     S T A T E     O F     C H D     C E R T I F I C A T E S     F R O M     C O R R E S P O N D I N G     A D D R E S S     
  async getHypCertificateListings(){
    
    var certificateAddress = hash(FAMILY_NAME).substr(0,6)+hash("CHD").substr(0,6);
    return this.getState(certificateAddress,true);
  }



  // G E T     T H E     S T A T E     O F     C E D     C E R T I F I C A T E S     F R O M     C O R R E S P O N D I N G     A D D R E S S     
  async getEthCertificateListings(){
    
    var certificateAddress = hash(FAMILY_NAME).substr(0,6)+hash("CED").substr(0,6);
    return this.getState(certificateAddress,true);
  }



  // G E T     T H E     S T A T E     O F     B E N     C E R T I F I C A T E S     F R O M     C O R R E S P O N D I N G     A D D R E S S     
  async getCertificateListingss(){
    
    var certificateAddress = hash(FAMILY_NAME).substr(0,6);
    return this.getState(certificateAddress,true);
  }



  // G E T     T H E     S T A T E     O F     C E R T I F I C A T E S     U S I N G     U S N     F R O M     C O R R E S P O N D I N G     A D D R E S S     
  async getCertificateListings(USN){
    var reg_chd = /^(CHD)/;
    var reg_ced = /^(CED)/;
    if(reg_chd.test(USN)){
      var certificateAddress = hash(FAMILY_NAME).substr(0,6) + hash("CHD").substr(0,6) + hash(USN).substr(0,4);
      return this.getState(certificateAddress,true);
    }
    if(reg_ced.test(USN)){
      var certificateAddress = hash(FAMILY_NAME).substr(0,6) + hash("CED").substr(0,6) + hash(USN).substr(0,4);
      return this.getState(certificateAddress,true);
    }
  }

}

module.exports = { CertificateClient };