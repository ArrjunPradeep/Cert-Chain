var express = require('express'); // R E Q U I R E     E X P R E S S     M O D U L E 

var router = express.Router();

var { CertificateClient } = require('./CertificateClient'); // R E Q U I R E     C E R T I F I C A T E C L I E N T.js
 


// G E T     H O M E     P A G E     O R     L O G I N     P A G E
router.get('/', function(req, res, next) {
  res.render('dash');
});



// R E N D E R I N G    C E R T _ D A T A     W H E R E     C E R T I F I C A T I O N     D E T A I L S     A R E     T O     B E     A D D E D
router.get('/cert_details',function(req,res) {
  res.render('cert_data');
});



// R E N D E R I N G     C E R T I F I C A T E     V E R I F I C A T I O N     P O R T A L     P A G E 
router.get('/cert_verify',function(req,res) {
  res.render('cert_verify');
});



// R E N D E R I N G     C E R T I F I C A T E     D E L E T I N G     P O R T A L     P A G E 
router.get('/cert_drop',function(req,res) {
  res.render('cert_del');
});



// D R O P     T H E     C E R T I F I C A T E     D E T A I L S 
router.post('/cert_drop',async(req,res,next)=>{
  var d_usn = req.body.c_usn;
  var certificate_client = new CertificateClient();
  if(d_usn.includes("CHD") || d_usn.includes("CED")){
    await certificate_client.dropCertificate(d_usn);
    res.send({ done:1, usn : d_usn , message: " C E R T I F I C A T E     D E T A I L S     D R O P P E D  \n "});
  }
});



// G E T    C E R T I F I C A T E      D E T A I L S     O F     I N D I V I D U A L S
router.post('/cert_verify',async(req,res,next)=>{
  var usn = req.body.V_USN;
  var certificate_client = new CertificateClient();
  var stateData = await certificate_client.getCertificateListings(usn);
  if(stateData.data.length!==0){  
    console.log(" D A T A     G O T     F R O M     R E S T _ A P I \n",stateData);

    let certificates_list = [];
    stateData.data.forEach(certs => {
        
      if(!certs.data) return;
      let decodeddata = Buffer.from(certs.data,'base64').toString();
      certificates = decodeddata.split(',');

      certificates_list.push({
        name : certificates[0],
        usn : certificates[1],
        grade : certificates[2],
        date : certificates[3]
      });
    });
    if(usn.includes("CED") && usn === certificates[1]){
      console.log("\n\n\n V E R I F Y I N G ",certificates[1]," C E R T I F I C A T E \n\n\n");
      res.render('cert_ced',{listings : certificates_list });
    }
    else if(usn.includes("CHD") && usn === certificates[1]){
      console.log("\n\n\n V E R I F Y I N G ",certificates[1]," C E R T I F I C A T E \n\n\n");
      res.render('cert_chd',{listings : certificates_list });
    }
    else{
      console.log("\n\n\n I N V A L I D     C R E D E N T I A L S  \n\n\n");
    }
  }
  else{
    console.log("\n\n\n U S N     I S     N O T     V A L I D\n\n\n");
    res.redirect('/');
  }
});



// G E T     E V E R Y     C E R T I F I C A T E      D E T A I L S 
router.get('/cert_list', async (req,res)=>{
  var certificate_client = new CertificateClient();
  var stateData = await certificate_client.getCertificateListingss();  
  console.log(" D A T A     G O T     F R O M     R E S T _ A P I \n",stateData);
  let certificates_list = [];
  stateData.data.forEach(certs => {
      
    if(!certs.data) return;
    let decodeddata = Buffer.from(certs.data,'base64').toString();
    let certificates = decodeddata.split(',');

    certificates_list.push({
      name : certificates[0],
      usn : certificates[1],
      grade : certificates[2],
      date : certificates[3]
    });
  });
  res.render('cert_list',{listings : certificates_list });
});



// G E T     C H D     C E R T I F I C A T E      D E T A I L S     I N     S E S S I O N
router.get('/cert_CHD', async (req,res)=>{
  var certificate_client = new CertificateClient();
  var stateData = await certificate_client.getHypCertificateListings();
  console.log(" D A T A     G O T     F R O M     R E S T _ A P I \n",stateData);
  let certificates_list = [];
  stateData.data.forEach(certs => {
      
    if(!certs.data) return;
    let decodeddata = Buffer.from(certs.data,'base64').toString();
    let certificates = decodeddata.split(',');

    certificates_list.push({
      name : certificates[0],
      usn : certificates[1],
      grade : certificates[2],
      date : certificates[3]
    });
  });
  res.render('cert_list',{listings : certificates_list });
});



// G E T     C E D     C E R T I F I C A T E      D E T A I L S     I N     S E S S I O N
router.get('/cert_CED', async (req,res)=>{
  var certificate_client = new CertificateClient();
  var stateData = await certificate_client.getEthCertificateListings();
  console.log(" D A T A     G O T     F R O M     R E S T _ A P I \n",stateData);
  let certificates_list = [];
  stateData.data.forEach(certs => {
      
    if(!certs.data) return;
    let decodeddata = Buffer.from(certs.data,'base64').toString();
    let certificates = decodeddata.split(',');

    certificates_list.push({
      name : certificates[0],
      usn : certificates[1],
      grade : certificates[2],
      date : certificates[3]
    });
  });
  res.render('cert_list',{listings : certificates_list });
});



// S I G N I N G     W I T H     H A R D C O D E D     P R I V A T E   K E Y
router.post('/',(req,res)=>{
  var c_usn = req.body.usn;
  var Key = req.body.privateKey;
  var certificate_client = new CertificateClient();
  res.send({ done:1, privatekey: Key, message: " P R I V A T E     K E Y \n "+ Key });
});

   

// F I L L I N G     T H E     C E R T I F I C A T E     D E T A I L S
router.post('/cert_details',async(req,res,next)=>{
  var key= req.body.pri_key;
  var NAME = req.body.c_name;
  var USN = req.body.c_usn;
  var GRADE = req.body.c_grade;
  var DATE = req.body.c_date;
  var certificate_client = new CertificateClient();
  var stateData = await certificate_client.getCertificateListings(USN);
  if(stateData.data.length!==0){
    console.log("\n\n\n C E R T I F I C A T E     "+USN+"     A L R E A D Y     A D D E D \n\n\n");
    res.send({ done:2,message: " C E R T I F I C A T E     "+USN+"     A L R E A D Y     A D D E D  \n "});
  }
  else if(USN.includes("CHD")){
    certificate_client.addHypCertificate(key,NAME,USN,GRADE,DATE);
    res.send({ done:1, privatekey: key, name : NAME, usn : USN,grade : GRADE, date : DATE ,message: " C E R T I F I C A T E     D E T A I L S     A D D E D  \n "});
  }
  else if(USN.includes("CED")){
    certificate_client.addEthCertificate(key,NAME,USN,GRADE,DATE);
    res.send({ done:1, privatekey: key, name : NAME, usn : USN,grade : GRADE, date : DATE ,message: " C E R T I F I C A T E     D E T A I L S     A D D E D  \n "});
  }
  
});

module.exports = router;

