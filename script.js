// Add function desc and in/out

var text = "I_Need_a_Dollar_by_Aloe_Blacc_I_need_a_dollar,_dollar_A_dollar_that's_what_I_need_Well_I_need_a_dollar,_dollar_A_dollar_that's_what_I_need_Said_I_said_I_need_dollar,_dollar_A_dollar_that's_what_I_need_And_if_I_share_with_you_my_story_would_you_share_your_dollar_with_me?"
//text = "";
var segmentDictionary = {};
var segmentList = [];
var emojis = ["☀", "☂", "☃", "☄", "★", "☆", "☇", "☈", "☉", "☊", "☋", "☌", "☍", "☎", "☏", "☐", "☑", "☒", "☓", "☖", "☗", "☚", "☛", "☜", "☝", "☞", "☟", "☠", "☡", "☢", "☣"];
var alpha1 = Array.from(Array(26)).map((e, i) => i + 97);
var alpha2 = Array.from(Array(26)).map((e, i) => i + 65);
var alphabet = alpha2.concat(alpha1).map((x) => String.fromCharCode(x)).concat(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "_", "+", "=", "{", "[", "}", "]"]);

function calcByteSavings(a, b){
  return (a - 1)*(b - 1) - 2;
}

if (text.length > 300){
  throw "Text must not be over 300-bytes long!";
}

// If text == segment, then return is 1
function countSegment(text, segment){
  var numOfSegments = 0;
  var newText = standardizeText(text);
  for (var i = 0; i <= newText.length - segment.length; i++){
    if (newText.substring(i, i+segment.length).toLowerCase() == segment.toLowerCase()){
      numOfSegments += 1;
      i += segment.length - 1;
    }
  }
  return numOfSegments;
}

function segmentListAppearances(array, segment, conflictDict){
  var newList = [];
  var currentDict = conflictDict[replaceSubbedText(segment, array[0])];
  var selectedIndex = 0;
  // console.log(segment);
  // console.log(array[3]);
  // console.log(currentDict);
  // console.log(array[0]);
  for (var i = 0; i < array[1].length; i++){
    if (array[1][i] != segment){
      for (var j = 0; j - 1 < currentDict.length; j++){
        // console.log("Match?")
        // console.log(currentDict[j][0]);
        // console.log(array[1][i]);
        // console.log(replaceSubbedText(array[1][i], array[0]));
        if (currentDict[j][0] == replaceSubbedText(array[1][i], array[0])){
          selectedIndex = j;
          break;
        }
      }
      // console.log(array[1][i]);
      // console.log(currentDict[selectedIndex]);
      appendItem(newList, array[3][i] - currentDict[selectedIndex][1]);
    }
  }
  // console.log(newList);
  return newList;
}

function initializeAppearances(text, segList){
  var newList = [];
  for (var i = 0; i < segList.length; i++){
    appendItem(newList, calcByteSavings(countSegment(text, segList[i]), segList[i].length));
  }
  return newList;
}

function replaceSubbedText(text, dictArray){
  var subbedText = "";
  for (var i = 0; i < text.length; i++){
    if (emojis.includes(text.substring(i, i+1))){
      subbedText = subbedText.concat(replaceSubbedText(dictArray[emojis.indexOf(text.substring(i, i+1))], dictArray))
    } else {
      subbedText = subbedText.concat(text.substring(i, i+1));
    }
  }
  return subbedText;
}


function substituteSegment(text, segment, substitute){
  var newText = standardizeText(text);
  var standardSegment = standardizeText(segment);
  for (var i = 0; i <= text.length - standardSegment.length; i++){
    if (newText.substring(i, i+standardSegment.length).toLowerCase() == standardSegment.toLowerCase()){
      newText = newText.slice(0,i) + substitute + newText.slice(i + segment.length, newText.length);
    }
  }
  return newText;
}

function substituteSegmentList(textList, segment, substitute){
  var newList = [];
  var standardSegment = standardizeText(segment);
  for (var i = 0; i < textList.length; i++){
    var newText = standardizeText(textList[i]);
    for (var j = 0; j <= newText.length - standardSegment.length; j++){
      if (newText.substring(j, j+standardSegment.length).toLowerCase() == standardSegment.toLowerCase()){
        newText = newText.slice(0,j) + substitute + newText.slice(j + standardSegment.length, newText.length);
      }
    }
    appendItem(newList, newText);
  }
  return newList;
}

function minPosValue(arr){
  //console.log(arr);
  if (arr[3].length == 0){
    return arr[2];
  }
  var maxVal = 0;
  var chosenIndex = 0;
  for (var i = 0; i < arr[3].length; i++){
    if (arr[3][i] > maxVal){
      maxVal = arr[3][i];
      chosenIndex = i
    }
  }

  return maxVal + arr[2];
}

function minNewPosValue(arr, type){
  // console.log(arr);
  var state = arr.slice(1, 5);
  var selectedIndex = 0;
  var counter = arr[0].length
  var isBreak = false;
  for (var i = 0; i < state[2].length; i++){
    if (state[2].length >= 0) {
      //console.log(state);
      var maxVal = state[2][0];
      var selectedIndex = 0;
      for (var j = 0; j < state[2].length; j++){
        if (state[2][j] > maxVal){
          maxVal = state[2][j];
          selectedIndex = j;
        }
      }
      // console.log(state[0]);
      // console.log(state[2]);
      // console.log(state[2][selectedIndex]);
      // console.log(maxVal);
      // console.log(state[0][selectedIndex]);
      // console.log(emojis[counter])
      if (state[2][selectedIndex] <= 0){
        isBreak = true;
        break;
      }
      var newSegmentList = substituteSegmentList(state[0].slice(0,selectedIndex).concat(state[0].slice(selectedIndex+1, state[0].length)), state[0][selectedIndex], emojis[counter]);
      var subbedText = substituteSegment(state[3], state[0][selectedIndex], emojis[counter]);
      // console.log("newSegmentList: "+newSegmentList);
      // console.log("subbedText: "+subbedText);
      state = [newSegmentList, state[1] + state[2][selectedIndex], initializeAppearances(subbedText, newSegmentList), subbedText];
      // console.log(state);
      counter++;
    } else {
      break;
    }
    if (isBreak){
      break;
    }
  }
  // console.log("Initial score: " + arr[2]);
  // console.log("Final score: " + state[1]);
  if (type == "score"){
    return state[1];
  } else {
    return state;
  }
}

function maxPosValue(arr){
  var sumVal = 0;
  if (arr[3].length == 0){
    return arr[2];
  }
  for (var i = 0; i < arr[3].length; i++){
    if (arr[3][i] > 0){
      sumVal += arr[3][i];
    }
  }
  return arr[2] + sumVal
}

// Uses a heuristic, in order to make foolproof find max of min of two-way
function maxNewPosValue(arr, dictionary){
  var sumVal = 0;
  for (var i = 0; i < arr[3].length; i++){
    if (arr[3][i] > 0){
      sumVal += arr[3][i];
    }
  }
  if (arr[3].length == 0){
    return arr[2];
  }
  var usedList = [];
  var diffVal = 0;
  var currentSegmentList = [];
  for (var i = 0; i < arr[1].length; i++){
    appendItem(currentSegmentList, replaceSubbedText(arr[1][i], arr[0]));
  }
  var currentSegment = currentSegmentList[0];
  var nextSegment = "";
  var newIndex = 0;
  for (var i = 0; i < Math.floor(currentSegmentList.length/2); i++){
    var maxDiff = 0;
    currentSegment = currentSegmentList[i];
    newIndex = i;
    while (usedList.includes(currentSegment)){
      newIndex++;
      currentSegment = currentSegmentList[newIndex];
    }
    var dictArray = dictionary[currentSegment];
    for (var j = 0; j < dictArray.length; j++){
      var minOneVal = dictArray[j][1];
      var otherIndex = 0;
      for (var k = 0; k < dictionary[dictArray[j][0]].length; k++){
        if (dictionary[dictArray[j][0]][k][0] == currentSegment){
          otherIndex = k;
          break;
        }
      }
      var minBothVal = Math.min(minOneVal, dictionary[dictArray[j][0]][otherIndex][1]);
      if (minBothVal >= maxDiff && !(usedList.includes(dictionary[currentSegment][j][0]))){
        maxDiff = minBothVal;
        nextSegment = dictionary[currentSegment][j][0];
      }
    }
    appendItem(usedList, currentSegment);
    appendItem(usedList, nextSegment);
    diffVal += maxDiff;
    currentSegment = nextSegment;
  }
  return arr[2] + sumVal - diffVal;
}

function findAllSegments(text, segment){
  var newText = standardizeText(text, "string");
  var indicesOfSegments = [];
  for (var i = 0; i <= newText.length - segment.length; i++){
    if (newText.substring(i, i+segment.length) == segment){
      for (var j = 0; j < segment.length; j++){
        appendItem(indicesOfSegments, i + j);
      }
    }
  }
  return indicesOfSegments;
}

function standardizeText(text, type){
  var newList = [];
  for (var i = 0; i < text.length; i++){
    appendItem(newList, text[i]);

    if (text[i] == " "){
      newList[i] = "_";
    }
  }
  if (type == "list"){
    return newList;
  } else {
    return newList.join("").toLowerCase();
  }
}

function findConflict(text, array){
  var standardText = standardizeText(text, "string");
  var sortedArray = array.sort(function (a, b) {return a.length - b.length});
  var conflictDict = {};
  for (var i = 0; i < sortedArray.length; i++){
    addPair(conflictDict, sortedArray[i], []);
  }
  for (i = 0; i < sortedArray.length; i++){
    for (var j = 0; j < sortedArray.length; j++){
      // Uses emojis[20]
      if (i == j){
        continue;
      }
      var firstSegment = substituteSegment(sortedArray[i], sortedArray[j], emojis[20]);
      var subbedText = substituteSegment(standardText, sortedArray[j], emojis[20])
      var interferenceScore = calcByteSavings(countSegment(standardText, sortedArray[i]), sortedArray[i].length) - calcByteSavings(countSegment(subbedText, firstSegment), firstSegment.length);
      addPair(conflictDict, sortedArray[j], conflictDict[sortedArray[j]].concat([[sortedArray[i], interferenceScore]]));
    }
  }
  return conflictDict;
}

// Works, test cases below
// 'the sus law exists in the uk' too much
// 'the sus law exists in thethe' too little
function splitText(text){
  var lastSplit = 0;
  var newList = [];
  for (var i = 1; i < text.length; i++){
    if ((text.substring(i,i+1) == "/" && text.substring(i-1,i) != "/")){
      appendItem(newList, text.substring(lastSplit, i));
    } else if (text.substring(i, i+1) != "/" && text.substring(i-1,i) == "/"){
      lastSplit = i;
    }
  }
  if (text.substring(text.length - 1, text.length) != "/"){
    appendItem(newList, text.substring(lastSplit, i));
  }
  return newList.sort(function(a,b){return b.length - a.length});
}

function slashText(text, list, dictionary){
  var textList = [];
  var slashList = [];
  var repsOfSegment = 0;

  for (var i = 0; i < text.length; i++){
    appendItem(textList, text[i]);
    appendItem(slashList, " ");

    if (text[i] == " "){
      textList[i] = "_";
    }
  }
  var newText = textList.join("").toLowerCase();

  var doesSegmentExist = true;
  // Checks if the last round finds anything, if not, aborts

  // finds all segments that meet the requirements
  // 2 bytes repeat 4+ times, 3 bytes repeat 3+ times, 4+ bytes repeat 2+ times
  for (var len = 2; doesSegmentExist || len < 5; len++){
    doesSegmentExist = false;
    for (i = 0; i + len <= text.length; i++){
      if (text.substring(i, i+len) in dictionary){
        continue;
      }
      repsOfSegment = countSegment(newText, newText.substring(i, i + len));
      if (repsOfSegment + len >= 6 && repsOfSegment >= 2){
        doesSegmentExist = true;
        if (typeof(dictionary) == "object" && !(newText.substring(i, i + len) in dictionary)){
          addPair(dictionary, newText.substring(i, i + len), repsOfSegment);
          appendItem(list, newText.substring(i, i + len));
          // If a 1-byte smaller string exists with the same repsOfSegment, delete the smaller string
          if (newText.substring(i, i + len - 1) in dictionary && repsOfSegment == getValue(dictionary, newText.substring(i, i + len - 1))){
            delete dictionary[newText.substring(i, i + len - 1)];
            removeItem(list, list.indexOf(newText.substring(i, i + len - 1)));
          }
          if (newText.substring(i + 1, i + len) in dictionary && repsOfSegment == getValue(dictionary, newText.substring(i + 1, i + len))){
            delete dictionary[newText.substring(i + 1, i + len)];
            removeItem(list, list.indexOf(newText.substring(i + 1, i + len)));
          }
        }
        // Number every index where the segment appeared
        var tempList = findAllSegments(newText, newText.substring(i, i + len));
        for (var j = 0; j < tempList.length; j++){
          slashList[tempList[j]] = len;
        }
      }
    }
    console.log("slashList: " + len + "-byte segments complete!");
  }
  console.log("slashList: All segments complete!");
  // If not marked, slash letters
  for (i = 0; i < newText.length; i++){
    if (slashList[i] == " "){
      textList[i] = "/";
    }
  }
  return textList.join("");
}
var slashedText = slashText(text, segmentList, segmentDictionary);
console.log(slashedText);
console.log(segmentDictionary);
console.log(segmentList);
var conflictDictionary = findConflict(slashedText, segmentList);
var indexDictionary = {};
for (i = 0; i < segmentList.length; i++){
  addPair(indexDictionary, segmentList[i], alphabet[i]);
}

// Array: [dictionary, toBeUsed, currentSavings, toBeUsedCounts, subbedText, indexString]

var states = [];
var nextStates = [];
var leadingState = [];
var tempState = [];
var highestMin = 0;
var totalStateNum = 1;
appendItem(states, [[], segmentList, 0, initializeAppearances(text, segmentList), slashedText, ""]);
while (states.length > 0){
  for (var i = 0; i < states.length; i++){
    for (var j = 0; j < states[i][1].length; j++){
      // Top priority: optimize core loop
      if (states[i][3][j] >= 0){
        var usedSegment = states[i][1][j];
        var newSegmentList = substituteSegmentList(states[i][1].slice(0,j).concat(states[i][1].slice(j+1,states[i][1].length)), states[i][1][j], emojis[states[i][0].length]);
        var subbedText = substituteSegment(states[i][4], states[i][1][j], emojis[states[i][0].length]);
        appendItem(nextStates, [states[i][0].concat(states[i][1][j]), newSegmentList, states[i][2] + states[i][3][j], segmentListAppearances(states[i], usedSegment, conflictDictionary), subbedText, states[i][5].concat(indexDictionary[replaceSubbedText(states[i][1][j], states[i][0])]).split("").sort().join("")]);
      }
    }
  }
  totalStateNum += nextStates.length;
  //console.log(nextStates);
  nextStates.sort(function (a, b){
    return a[5].localeCompare(b[5], 'en', { sensitivity: 'base' });
  })
  for (i = 0; i + 1 < nextStates.length; i++){
    if (nextStates[i][5] == nextStates[i+1][5]){
      if (nextStates[i][1] > nextStates[i+1][1]){
        removeItem(nextStates, i+1);
      } else {
        removeItem(nextStates, i);
      }
      i -= 1;
      console.log("Omitted by dir comparison!") 
    }
  }
  for (i = 0; i < nextStates.length; i++){
    var minCurVal = minNewPosValue(nextStates[i], "score");
    if (minCurVal > highestMin){
      highestMin = minCurVal;
      leadingState = nextStates[i];
    }
    if (minCurVal == highestMin && leadingState[0].length < nextStates[i][0].length){
      leadingState = nextStates[i];
    }
    if (nextStates[i][1].length == 0){
      removeItem(nextStates[i][3], i);
      i -= 1;
    }
  }
  //console.log(highestMin);
  for (i = 0; i < nextStates.length; i++){
    //console.log(maxPosValue(nextStates[i], conflictDictionary));
    if (maxNewPosValue(nextStates[i], conflictDictionary) < highestMin){
      removeItem(nextStates, i);
      console.log("Omitted by min/max b/c under " + highestMin);
      i -= 1;
    }
  }
  //for (i = 0; i + 1 < nextStates.length; i++){
    //console.log(nextStates[i][5]);
    //console.log(nextStates[i][5] == nextStates[i+1][5]);
    //if (stateIndexList.includes(stateIndexList[i], i + 1)) {
      //var otherIndex = stateIndexList.indexOf(stateIndexList[i], i+1);
      //console.log(nextStates[i][5]);
      //console.log(nextStates[otherIndex][5]);
      //if (nextStates[i][1] >= nextStates[otherIndex][1]){
        //removeItem(nextStates, otherIndex);
      //} else {
        //removeItem(nextStates, i);
        //i -= 1;
      //}
      //console.log("Omitted by dir comparison!");
    //}
  //}
  states = nextStates;
  nextStates = [];
  console.log("Stage complete!");
  console.log("Highest score: " + highestMin);
  console.log("Highest state: " + leadingState.join("\n"));
  console.log("Length: " + states.length);
}
// Make it show all segments to use
console.log("First part of leading state: " + leadingState.join("\n"));
leadingState = minNewPosValue(leadingState, "other");
console.log("Leading state: " + leadingState.join("\n"));
console.log("Highest score: " + highestMin);
console.log("This compression iterated through " + totalStateNum + " states.");

function appendItem(list, item){
  list.push(item);
}

function removeItem(list, index){
  list.splice(index, 1);
}

function addPair(dictionary, key, value){
    dictionary[key] = value;
}

function getValue(dictionary, key){
    return dictionary[key];
}

function getTime() {
  var TimeNow = new Date();
  return TimeNow.getTime;
}

// Citations:
//  https://javascript.plainenglish.io/create-an-array-of-alphabet-characters-in-javascript-with-this-simple-trick-930033079dd3
//  for the alphabet generator