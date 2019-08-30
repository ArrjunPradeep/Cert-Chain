# Design Decisions

* The **Cert@Chain** Sawtooth network consists of BEN Institutes.
* Only the approved Institutes can add certificate details. 
* Certificate with same USN cannot be added again once already added.
* The family name for adding certificate is **certificate**.
* The certificates can be dropped incase of any modification needed.
* The students who pursued these certification can verify their certiifcate credentials by simply entering the valid **USN**
* The system handles **Certificate Issuance and Verification Process**. The decision was taken to limit to two certificates due to time constraints while develeoping the project.
*  The application hs been tested primarily in Mozilla Firefox. 

## Certificate Adding Process
---
### BEN Certificate :
        When a certificate is added, address is generated (ie, CHD Certificates, CED Certificates).
    
***CHD Certificate Address Scheme :***

        First six characters sliced from hash of family name (certiifcate) +  First 6 characters sliced from hash of 'CHD' + First 4 characters sliced from hash of USN + First 54 characters sliced from hash of private key(hardcoded) used by the Institute.

***Reasons for choosing Address Scheme:***
        
        A CHD certificate of a particular USN can be added only once in the network, and there cannot be multiple entries of certificate for the same USN from different Institutes. To ensure this, when a new certificate is being added, the entire network is checked for existing certificate details of a particular USN using address created for CHD certificates. If a certificate with same USN exists, an alert is provided to user that certificate is already added. The CHD address scheme was designed using the USN (unique for a student), certificate type(ie,CHD), and private key(to identify which Institute added the certificate details).

        At the time of adding CHD certificate, events are generated.
                

***CED Certificate Address Scheme :***

        First six characters sliced from hash of family name (certiifcate) +  First 6 characters sliced from hash of 'CED' + First 4 characters sliced from hash of USN + First 54 characters sliced from hash of private key(hardcoded) used by the Institute.

***Reasons for choosing Address Scheme:***
        
        A CED certificate of a particular USN can be added only once in the network, and there cannot be multiple entries of certificate for the same USN from different Institutes. To ensure this, when a new certificate is being added, the entire network is checked for existing certificate details of a particular USN using address created for CED certificates. If a certificate with same USN exists, an alert is provided to user that certificate is already added. The CHD address scheme was designed using the USN (unique for a student), certificate type(ie,CED), and private key(to identify which Institute added the certificate details).

        At the time of adding CED certificates, events are generated.

## Certificate Deletion Process:
---

        The certificate details to be deleted are done using the certificate USN. If the USN doesn't exist, an error is shown in terminal. Else, the user can delete the certificate details of particular USN.

        At the time of Certificate deletion, events are generated.

## Certificate Verification Process:
---

        Certificate verification is done by entering the valid USN. If the USN doesn't exist, an error is shown in the terminal. Else the user can view the corresponding certificate of USN.
