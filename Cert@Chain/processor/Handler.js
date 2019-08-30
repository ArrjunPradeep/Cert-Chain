


// T R A N S A C T I O N    P R O C E S S O R
const {TextDecoder,TextEncoder} = require('text-encoding/lib/encoding');

const { TransactionHandler } = require('sawtooth-sdk/processor/handler');

const { TransactionProcessor } = require('sawtooth-sdk/processor');

const crypto = require('crypto');

const {Secp256k1PrivateKey} = require('sawtooth-sdk/signing/secp256k1');

const {createContext,CryptoFactory} = require('sawtooth-sdk/signing');

const CERTIFICATEKEY = '54763a5bfbbd80ab4b6dde1e86bea7e8dc6904719859f792ae215c31b9586696';

const FAMILY_NAME = "certificate"

const NAMESPACE = hash(FAMILY_NAME).substring(0, 6);

var decoder = new TextDecoder('utf8');

var encoder = new TextEncoder('utf8');

const {
    InvalidTransaction,
    InternalErrorpayloadActions
  } = require('sawtooth-sdk/processor/exceptions');

function hash(data) {
    return crypto.createHash('sha512').update(data).digest('hex');
}



// F U N C T I O N     T O     W R I T E     D A T A     T O     S T A T E
function writeToStore(context, address, data){

        //message bytes
        let msgB = encoder.encode(data)

        // C U S T O M     E V E N T     A T T R I B U T E
        attribute = [['certificate',data[1].toString()]]
        
        // A D D I N G     C U S T O M     E V E N T S 
        context.addEvent('Certificate/Commit',attribute,msgB)
   
        // T R A N S A C T I O N     R E C E I P T     D A T A { http://localhost:8008/receipts?id=txnid&limit=100} 
        context.addReceiptData(Buffer.from("CERTIFICATE_USN :"+data[1]+"USN :"+address,'utf-8'));

        dataBytes = encoder.encode(data)
        let entries = {
        [address]: dataBytes
      }
    return context.setState(entries);
    
}



// F U N C T I O N     T O     R E T R E I V E     T H E     A D D R E S S     O F     C H D     C E R T I F I C A T E S
function getHypCertAddress(usn){
    const context = createContext('secp256k1');
    let key = Secp256k1PrivateKey.fromHex(CERTIFICATEKEY);
    let signer = new CryptoFactory(context).newSigner(key);
    let publicKeyHex = signer.getPublicKey().asHex();    
    let keyHash  = hash(publicKeyHex);
    let nameHash = hash("certificate");
    let HypHash = hash("CHD");
    let usnHash = hash(usn);
    return nameHash.slice(0,6) + HypHash.slice(0,6) + usnHash.slice(0,4) + keyHash.slice(0,54)

}
   


// F U N C T I O N     T O     S T O R E     C H D      C E R T I F I C A T E S 
function addHypCertificate(context,name,usn,grade,date) {
    let cert_adrs = getHypCertAddress(usn);
    let cert_detail =[name,usn,grade,date];
    return writeToStore(context,cert_adrs,cert_detail);
}



// F U N C T I O N     T O     R E T R E I V E     T H E     A D D R E S S     O F     C E D     C E R T I F I C A T E S
function getEthCertAddress(usn){
    const context = createContext('secp256k1');
    let key = Secp256k1PrivateKey.fromHex(CERTIFICATEKEY);
    let signer = new CryptoFactory(context).newSigner(key);
    let publicKeyHex = signer.getPublicKey().asHex();    
    let keyHash  = hash(publicKeyHex);
    let nameHash = hash("certificate");
    let EthHash = hash("CED");
    let usnHash = hash(usn);
    return nameHash.slice(0,6) + EthHash.slice(0,6) + usnHash.slice(0,4) + keyHash.slice(0,54)

}
   



// F U N C T I O N     T O     S T O R E     C E D      C E R T I F I C A T E S 
function addEthCertificate(context,name,usn,grade,date) {
    let cert_adrs = getEthCertAddress(usn);
    let cert_detail =[name,usn,grade,date];
    return writeToStore(context,cert_adrs,cert_detail);
}



// T R A N S A C T I O N     H A N D L E R    C L A S S
class CertificateHandler extends TransactionHandler{
    constructor(){
        super(FAMILY_NAME, ['1.0'], [NAMESPACE]);
    

    }


    // A P P L Y    F U N C T I O N
    apply(transactionProcessRequest, context){

        // D E C O D I N G     P A Y L O A D     F R O M     T R A N S A C T I O N     P R O C E S S     R E Q U E S T
        let PayloadBytes = decoder.decode(transactionProcessRequest.payload);
        let Payload = PayloadBytes.toString().split(',');


        if(Payload.length === 1 && Payload[0].includes("CHD")){
            let address = getHypCertAddress(Payload[0]);
            
            // D R O P P I N G     C H D     C E R T I F I C A T E S
            console.log("\n\n\n C H D     C E R T I F I C A T E     D R O P P E D :",Payload[0],"\n\n\n");
            return context.deleteState([address]);
        }
        else if(Payload.length === 1 && Payload[0].includes("CED")){
            let address = getEthCertAddress(Payload[0]);
            
            // D R O P P I N G     C E D     C E R T I F I C A T E S
            console.log("\n\n\n C E D     C E R T I F I C A T E     D R O P P E D :",Payload[0],"\n\n\n");
            return context.deleteState([address]);
        }
        else if(Payload[1].includes("CHD")){
            // A D D I N G     C H D     C E R T I F I C A T E S 
            return addHypCertificate(context,Payload[0],Payload[1],Payload[2],Payload[3])
        }
        else if(Payload[1].includes("CED")){
            // A D D I N G     C E D     C E R T I F I C A T E S 
            return addEthCertificate(context,Payload[0],Payload[1],Payload[2],Payload[3])
        }
        else{
            throw new InvalidTransaction("\n\n\n I N V A L I D     T R A N S A C T I O N \n\n\n");
        }
    }
}


module.exports = CertificateHandler
