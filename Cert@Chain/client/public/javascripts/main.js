// T O     R E N D E R     C H D     C E R T I F I C A T E
function cert_CHD(event){
    event.preventDefault();
    window.location.href='/cert_CHD';
}



// T O     R E N D E R     C E D     C E R T I F I C A T E
function cert_CED(event){
    event.preventDefault();
    window.location.href='/cert_CED';
}



// T O     R E N D E R     C E R T I F I C A T E     A D D I N G     P A G E
function cert_list(event){
    event.preventDefault();
    window.location.href='/cert_list';
}



// T O     R E N D E R     V E R I F I C A T I O N     P O R T A L    P A G E
function stu_portal(event){
    event.preventDefault();
    window.location.href='/cert_verify';
}



// T O     R E N D E R     C E R T I F I C A T E     D E L E T E     P A G E 
function del_portal(event){
    event.preventDefault();
    window.location.href='/cert_drop';
}



// F U N C T I O N     T O     D E L E T E     A     C E R T I F I C A T E 
function drop_cert(event){
    event.preventDefault();
    var usn = document.getElementById('del_usn').value;
    var regexusn = new RegExp("^(CHDB|CEDB)[0-9][0-9]{3}$");
    if((usn).length === 0 || !regexusn.test(usn)){
        alert("E N T E R     C O R R E C T     U S N    F O R M A T ");
    }
    else{
        $.post('/cert_drop',{c_usn: usn},(data, textStatus, jqXHR)=>{
         if(data.done = 1){
            alert(data.message+ "\n U S N : "+data.usn);
        }
        else{
            window.location.href='/';
        }
        }, 'json');
    }

}



// F U N C T I O N     T O     V E R I F Y     A     C E R T I F I C A T E 
function verify_portal(event){
    event.preventDefault();
    var v_usn = document.getElementById('cert_usn').value;
    if(v_usn.length === 0){
        alert(" E N T E R     A     V A L I D     U S N");
    }
}



// F U N C T I O N     T O     L O G I N     T O     C e r t @ C h a i n     S y s t e m
function login_cert(event){
    event.preventDefault();
    const Key = document.getElementById('login_id').value;
    if(Key.length !== 64){
        alert(" P L E A S E     E N T E R   A   K E Y ");
    }
    else{  
        $.post('/',{ privateKey : Key ,privateKey1 : this.data_key },(data, textStatus, jqXHR)=>{
            if(data.done =1){
                sessionStorage.clear();
                sessionStorage.setItem("privatekey",data.privatekey);
                alert(data.message);
                window.location.href='/cert_details';
            }
            else{
                window.location.href='/';
            }
            
        },'json');
    }
}  
  


// F U N C T I O N     T O     L O G O U T     O F     S E S S I O N 
function logout_cert(event){
    event.preventDefault();
    sessionStorage.clear();
    window.location.href='/';
}



// F U N C T I O N     T O     A D D     N E W     C E R T I F I C A T E S     T H R O U G H     L O G I N 
function list_cert(event){
    event.preventDefault();
    var regexgrade= new RegExp("^(S|A|B|C){1}$");
    var regexname= new RegExp("^[a-zA-Z .]{2,30}$");
    var regexusn = new RegExp("^(CHDB|CEDB)[0-9][0-9]{3}$");
    const p_key=sessionStorage.getItem('privatekey');
    const name = document.getElementById('cert_name').value;
    const usn = document.getElementById('cert_usn').value;
    const grade = document.getElementById('cert_grade').value;
    const date = document.getElementById('cert_date').value;
    if((name && usn && grade && date).length === 0 || !regexusn.test(usn) || !regexname.test(name) || !regexgrade.test(grade)){
    alert("P L E A S E     E N T E R     C O R R E C T     D E T A I L S ");

     }
    else{
        $.post('/cert_details',{pri_key: p_key, c_name: name, c_usn: usn, c_grade: grade, c_date: date},(data, textStatus, jqXHR)=>{
         if(data.done == 1){
            alert(data.message);
            window.location.href='/cert_list';
        }
        else if(data.done == 2){
            alert(data.message);
            window.location.href='/';
        }
        else{
            window.location.href='/';
        }
        }, 'json');
    }
}



// F U N C T I O N     T O     V A L I D A T E     U S N 
function validate_cert_usn(cert_usn){

    var usn = new RegExp("^(CHDB|CEDB)[0-9][0-9]{3}$");

    if (!usn.test(cert_usn.value))
    {
        document.getElementById("usn").innerHTML="INVALID USN FORMAT";
        document.getElementById("usn").style.visibility="visible";
        return false;
    }
    else{
        document.getElementById("usn").innerHTML=" ";
        document.getElementById("usn").style.visibility="visible";
        return true;

    }

}



// F U N C T I O N     T O     V A L I D A T E     N A M E     O F     S T U D E N T 
function validate_name(cert_name){

    var reg_fname= new RegExp("^[a-zA-Z .]{2,30}$");

    if (!reg_fname.test(cert_name.value))
    {
        document.getElementById("name").innerHTML="INVALID NAME FORMAT";
        document.getElementById("name").style.visibility="visible";
        return false;
    }
    else{
        document.getElementById("name").innerHTML=" ";
        document.getElementById("name").style.visibility="visible";
        return true;

    }

}



// F U N C T I O N     T O     V A L I D A T E     G R A D E 
function validate_grade(cert_grade){

    var reg_grade= new RegExp("^(S|A|B|C){1}$");

    if (!reg_grade.test(cert_grade.value))
    {
        document.getElementById("grade").innerHTML="INVALID GRADING PATTERN";
        document.getElementById("grade").style.visibility="visible";
        return false;
    }
    else{
        document.getElementById("grade").innerHTML=" ";
        document.getElementById("grade").style.visibility="visible";
        return true;

    }

}



