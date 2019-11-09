/* TODO ****************** 
 - when crawling dust data also crawl traffic data
 - add 1 (or as much as needed) field to row with traffic data 
*/
const GoogleSpreadsheet = require('google-spreadsheet')
const {promisify} = require ('util')
const fetch = require("node-fetch");
const creds = require('./client_secret.json')
let newRow

async function getDustData() 
//todo: noch richtigen Sensor auswaehlen
{ 
    try {
          //let res = await fetch(`http://data.sensor.community/airrohr/v1/filter/area=9.17218770000,48.77938010000,1000`);  
  let res = await fetch(`http://data.sensor.community/airrohr/v1/sensor/26714/`);  // 26715 to add
  let data = await res.json()    
  return data;
    } catch (error) {
        console.log(error)
    }

}

async function accessSpreadsheet() {
    try {
    const data = await getDustData()    
    console.log('got data:')
    //console.log(data)
    const doc = new GoogleSpreadsheet('1zeqER3VPvDQtGC9A3McVnOkpgAXBP0xAR1Y74pOZxgM')
    await promisify(doc.useServiceAccountAuth)(creds)
    const info = await promisify(doc.getInfo)()
    const sheet = info.worksheets[0]    
    

    
    data.forEach( async (row) => {        
        // only take data from our sensor - 19206 is tracking humidity and temperature at the same location and saves in similar fields like 19205 which tracks emissions of P1 and P2
        if(!(row.sensor.id !==  26715 || row.sensor.id !== 26716)){ // ..16 correct for 2nd sensor?
            return
         }
         
    console.log(row.sensor.id)
         const timestamp = row.timestamp
         let p1, p2

          row.sensordatavalues.forEach((sdv) =>{
            // in switch case umbauen 
            if (sdv.value_type === 'P1') {
                p1 = sdv.value
             } else if (sdv.value_type === 'P2') {
                p2 = sdv.value
             }
         } )

         newRow = {
            timestamp,
            p1,
            p2
        }
        console.log(`now adding newRow: ${newRow.timestamp}, ${newRow.p1}, ${newRow.p2}, `)
        await promisify(sheet.addRow)(newRow).catch((err) => {
            console.log('Error when adding rows', err);
        }) // needs to move somewhere else. maybe every action in own function since newRow is saved in RAM now                
    })            
    } catch (error) {
        console.log(error)
    }
    
}

setInterval(accessSpreadsheet, 5000);
console.log('running...')