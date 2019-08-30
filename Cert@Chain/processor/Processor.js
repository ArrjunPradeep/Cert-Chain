const { TransactionProcessor } = require('sawtooth-sdk/processor');
const CertificateHandler = require('./Handler');
const URL = 'tcp://validator:4004';
 
const transactionProcesssor = new TransactionProcessor(URL);
transactionProcesssor.addHandler(new CertificateHandler());
transactionProcesssor.start();
 