

// E V E N T     A L E R T S     W H E N     A    C E R T I F I C A T E     I S     A D D E D 

const {
    Message,
    EventFilter,
    EventList,
    EventSubscription,
    ClientEventsSubscribeRequest,
    ClientEventsSubscribeResponse
  } = require('sawtooth-sdk/protobuf');

const {TextDecoder} = require('text-encoding/lib/encoding');

const { Stream } = require('sawtooth-sdk/messaging/stream');

var decoder = new TextDecoder('utf8');

const VALIDATOR_URL = "tcp://validator:4004";



// R E T U R N S     M E S S A G E     D A T A     A S     L I S T 
function getEventsMessage(message){
    let Eventlist =  EventList.decode(message.content).events
    Eventlist.map(function(event){
        if(event.eventType === 'Certificate/Commit') {
                console.log("\n \n \n");
                console.log("C E R T I F I C A T E     C O M M I T     E V E N T     F O U N D : ", event);
                console.log("\n \n \n");
                console.log("C O M M I T E D     C E R T I F I C A T E     D E T A I L S : ",event.data.toString());
        }
        else if(event.eventType === 'sawtooth/block-commit'){
                console.log("\n \n \n");
                console.log("B L O C K     C O M M I T     F O U N D : ", event);
        }
    })
}
    


// F U N C T I O N     R E T U R N S     S U B S C R I P T I O N     R E Q U E S T     S T A T U S
function checkStatus(response){
    let msg = ""
    if (response.status === 0){
            msg = ' S U B S C R I P T I O N : O K'
    }if (response.status === 1){
            msg = ' S U B S C R I P T I O N : G O O D '
    }else{
            msg= ' S U B S C R I P T I O N     F A I L E D     ! ! ! ! ! '}
    return msg
}



// F U N C T I O N     T O     C R E A T E     S U B S C R I P T I O N     F O R     C U S T O M     E V E N T S
function EventSubscribe(URL){
        let stream = new Stream(URL)

        // C R E A T I N G     A     B L O C K - C O M M I T     E V E N T     S U B S C R I P T I O N 
        const blockCommitSubscription  = EventSubscription.create({
                eventType: 'sawtooth/block-commit'
        })

        // C R E A T I N G     A     C U S T O M     S U B S C R I P T I O N
        const wordLengthSubscription  = EventSubscription.create({
                eventType: 'Certificate/Commit',
                filters: [EventFilter.create({
                        key: 'message_length',
                        matchString: '(CHDB|CEDB)[0-9][0-9]{3}$',
                        filterType: EventFilter.FilterType.REGEX_ALL
                })]
        })

        // C R E A T I N G     A     S U B S C R I P T I O N      R E Q U E S T
        const subscription_request = ClientEventsSubscribeRequest.encode({
                subscriptions : [blockCommitSubscription, wordLengthSubscription]
        }).finish()

        stream.connect(() => {
                stream.send(Message.MessageType.CLIENT_EVENTS_SUBSCRIBE_REQUEST,subscription_request)
                .then(function (response){
                   return ClientEventsSubscribeResponse.decode(response) 
                })
                .then(function (decoded_Response){
                   console.log(checkStatus(decoded_Response))
                })
                
                stream.onReceive(getEventsMessage)
        })

}


EventSubscribe(VALIDATOR_URL);