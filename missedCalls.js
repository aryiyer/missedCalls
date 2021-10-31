/*
Helper method which takes a full URL for a Google drive folder and returns the corresponding ID for that folder. 
*/
function scrapeId(urlString){
  var ind = urlString.indexOf('folders/');
  if (ind > -1){
    return urlString.substring(ind+8);
  } else {
    Logger.log('invalid url');
  }
}



/*
importXLS() takes in the ID of a folder which should contain the desired XLS file to be converted. It then finds the first XLS file in the folder
and performs the conversion, creating a new Google spreadsheet file in the destination folder.
*/
function importXLS(){
  var files = DriveApp.getFolderById('********').searchFiles('title contains "Call History"'); //original folder containing xls file
  if (files.hasNext()){
    var xFile = files.next();
    var name = xFile.getName();
    if (name.indexOf('Call History')>-1){ //checks if xls
      var xBlob = xFile.getBlob(); //gets data
      var newFileConfig = {
        title : name+'_converted',
        parents: [{id: '********'}],
        mimeType: MimeType.GOOGLE_SHEETS //  Added
      };
      spreadsheet = Drive.Files.insert(newFileConfig, xBlob);
    }
  } else {
    Logger.log("no file found named Call History");
  }
}



/*
getList() takes in the ID of the folder in which the converted XLS file, now a spreadsheet, should reside (same destination as above). It then finds the first spreadsheet in
the folder and then adds each number in column E starting from row 4 downwards to an array. It then deletes the spreadsheet file from the folder and returns the 
array.
*/
function getList(destinationId, rowStart, colStart){
  var folderId = destinationId;
  var convertedFolder =  DriveApp.getFolderById(folderId).searchFiles('mimeType = "' + MimeType.GOOGLE_SHEETS + '"'); //change search to tile = Call History
  if (convertedFolder.hasNext()) {
    const missedCalls = [];
    var spreadSheetFile = convertedFolder.next();
    var spreadsheet = SpreadsheetApp.open(spreadSheetFile);
    var sheet = spreadsheet.getSheets()[0];
    var range = sheet.getDataRange();
    var values = range.getValues();
    var hasNext = false;

    for (let i = rowStart; !hasNext; i ++){
      missedCalls.push(values[i][colStart]);
      var testRange = sheet.getRange("E"+(i+2)+":E"+(i+2));
      hasNext = testRange.isBlank()
    }
    return missedCalls;
  } else {
    Logger.log("no sheet file found in folder")
  }
}

function toObjectList(fromList, statusList){
  var calls = [];
  for(let i = 0; i < fromList.length; i ++){
    let call = {number: fromList[i], status: statusList[i]};
    calls.push(call);
  }
  return calls;
}

function refineList(fromList, statusList){
  var objectList = toObjectList(fromList, statusList);
  var refinedList = [];
  for(let i = 0; i < objectList.length; i ++){
    if (objectList[i].status == "Success") {
      objectList = removeFromList(objectList, objectList[i].number);
      i--;
    } else {
      refinedList.push(objectList[i].number);
    }
  }
  return refinedList;
}

function removeFromList(inputList, number){
  for(let i = 0; i<inputList.length; i++){
    if(inputList[i].number == number){
      inputList.splice(i,1);
      i--;
    }
  }
  return inputList;
}

//add function that removes Successful calls
//make sure no duplicates, e.g. number that is later attended to should not be in list
//ensure that the only numbers are 65 numbers with 8 digits



var rootIdVar = scrapeId('https://drive.google.com/drive/u/0/folders/********');
Logger.log(rootIdVar);
const destinationId = scrapeId('https://drive.google.com/drive/folders/********');
Logger.log(destinationId);
importXLS();

const fromList = getList(destinationId, 17, 2);
const statusList = getList(destinationId, 17, 4);

var objectList = toObjectList(fromList, statusList);

const refinedList = refineList(fromList, statusList);
for(let i = 0; i < refinedList.length; i++){
  Logger.log(refinedList[i]);
}
