/*
      Fisherman

      Query Network and build consensus on account balance

      Report any mis-reporting nodes
 */
require('dotenv').config()
require('dotenv').config({path:"../../../.env"})
require('dotenv').config({path:"./../../.env"})
require('dotenv').config({path:"../../../../.env"})

// console.log(process.env)

let packageInfo = require("../package.json")
const TAG = " | "+packageInfo.name+" | "
const log = require('@pioneer-platform/loggerdog')()
const {subscriber,publisher,redis,redisQueue} = require('@pioneer-platform/default-redis')
const blockbook = require('@pioneer-platform/blockbook')
const {baseAmountToNative,nativeToBaseAmount} = require('@pioneer-platform/pioneer-coins')

//Block-book (references)
let servers:any = {}
if(process.env['BTC_BLOCKBOOK_URL']) servers['BTC'] = process.env['BTC_BLOCKBOOK_URL']
if(process.env['ETH_BLOCKBOOK_URL']) servers['ETH'] = process.env['ETH_BLOCKBOOK_URL']
blockbook.init(servers)

let queue = require("@pioneer-platform/redis-queue")
let connection  = require("@pioneer-platform/default-mongo")
let wait = require('wait-promise');
let sleep = wait.sleep;

let phonebookDB = connection.get('foxchain')
let pubkeysDB = connection.get('pubkeys')
let reportsDB = connection.get('unspent')

phonebookDB.createIndex({accountOwner: 1}, {unique: true})
reportsDB.createIndex({txid: 1}, {unique: true})
pubkeysDB.createIndex({pubkey: 1}, {unique: true})

let do_work = async function(){
    let tag = TAG+" | do_work | "
    let work:any
    try{
        // console.time('start2mongo');
        // console.time('start2node');
        // console.time('start2end');

        //TODO normalize queue names
        let allWork = await queue.count("fisherman:reports:ingest")
        log.debug(tag,"allWork: ",allWork)

        work = await queue.getWork("fisherman:reports:ingest", 1)
        if(work){
            log.debug("work: ",work)
            if(!work.symbol && work.asset) work.symbol = work.asset
            if(!work.type && work.address) work.type = "address"
            if(!work.context) throw Error("100: invalid work! missing context")
            if(!work.symbol) throw Error("101: invalid work! missing symbol")
            if(!work.username) throw Error("102: invalid work! missing username")
            if(!work.pubkey) throw Error("103: invalid work! missing pubkey")
            if(!work.type) throw Error("105: invalid work! missing type")
            if(!work.queueId) throw Error("106: invalid work! missing queueId")
            if(work.type !== 'address' && work.type !== 'xpub' && work.type !== 'zpub' && work.type !== 'contract') throw Error("Unknown type! "+work.type)

            //for each registered unchained network
            let allUnchaineds = await phonebookDB.find()
            log.info(tag,"allUnchaineds: ",allUnchaineds)

            //filter for network of pubkey

            //if !unchained for network throw

            //if !references for network throw

            if(work.type === "xpub" || work.type === "zpub"){

            } else if(work.type === "address") {
                //Get balances



            }

        }
    } catch(e) {
        log.error(tag,"e: ",e)
        log.error(tag,"e: ",e.message)
        work.error = e.message
        queue.createWork("fisherman:reports:ingest:deadletter",work)
    }
    //dont stop working even if error
    do_work()
}

//start working on install
log.debug(TAG," worker started! ","")
do_work()
