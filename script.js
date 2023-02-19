// Citations:
//  https://javascript.plainenglish.io/create-an-array-of-alphabet-characters-in-javascript-with-this-simple-trick-930033079dd3
//  for the alphabet generator

// Funny bugs:
//  [2, 3] is NOT equal to [2, 3]
//  😀 is a 2-character emoji

// Add function desc and in/out
// Does not find 137-byte solution to I Need a Dollar, finds only a 130-byte
// SegmentList pruning prunes out potentially good segments
// Takes long with very repetitive 233-byte input
var emojis = ["☀", "☂", "☃", "☄", "★", "☆", "☇", "☈", "☉", "☊", "☋", "☌", "☍", "☎", "☏", "☐", "☑", "☒", "☓", "☖", "☗", "☚", "☛", "☜", "☝", "☞", "☟", "☠", "☡", "☢", "☣"];
var alpha1 = Array.from(Array(26)).map((e, i) => i + 97);
var alpha2 = Array.from(Array(26)).map((e, i) => i + 65);
var alphabet = alpha2.concat(alpha1).map((x) => String.fromCharCode(x)).concat(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "_", "+", "=", "{", "[", "}", "]"]);
var output = "";

// So wake me up includeList
// var includeList = ['_i_was_']

// I need a dollar includeList
// var includeList = ['_dollar', 'i_need_', '_dollar_', '_i_need_', "_i_need_a_dollar,_dollar_a_dollar_that's_what_i_need_", '_a_dollar', '_said_i', '_you'];
function solveText(){
  var startObject = new Date;
  var startTime = startObject.getTime();
  var uncompressedText = document.querySelector("#uncompressedText").value;
  var includeList = document.querySelector("#suggestedSegments").value.split("\n");
  var heuristicRatio = parseFloat(document.querySelector("#heuristicRatio").value);
  var iterateRatio = parseFloat(document.querySelector("#iterateRatio").value);
  var doDeeperSearch = document.querySelector("#doDeeperSearch").checked;
  window.sessionStorage.setItem('uncompressedText', uncompressedText);
  window.sessionStorage.setItem('includeList', includeList.join("\n"));
  window.sessionStorage.setItem('heuristicRatio', heuristicRatio);
  window.sessionStorage.setItem('iterateRatio', iterateRatio);
  window.sessionStorage.setItem('doDeeperSearch', doDeeperSearch);

  console.log(includeList);
  if (uncompressedText.length < 8){
    throw "Text must be at least 8 bytes!";
  }
  for (var i = 0; i < includeList.length; i++){
    if (includeList[i].length < 2){
      includeList.splice(i, 1);
      i -= 1;
    } else {
      includeList[i] = standardizeText(includeList[i]);
    }
  }
  // declare variables just before they're used
  // Array: [dictionary, possibleSegments, currentSavings, possibleSegmentsSavings, subbedText, indexString, minScore, maxScore]
  var states = [];
  var nextStates = [];
  var leadingState = [];
  var tempState = [];
  var highestMin = 0;
  var totalStateNum = 1;
  var segmentList = [];
  var indexDictionary = {};
  var initialDictionary = {};
  var segmentDictionary = {};
  var usedSegmentDictionary = {};
  var slashedText = slashText(uncompressedText, segmentList, segmentDictionary, initialDictionary);
  var initList = [];
  if (doDeeperSearch){
    for (var i = 0; i < segmentList.length; i++){
      if (segmentList[i] in initialDictionary){
        for (var j = 0; j < initialDictionary[segmentList[i]].length; j++){
          segmentList.push(initialDictionary[segmentList[i]][j]);
          initList.push(initialDictionary[segmentList[i]][j]);
        }
      }
    }
  }
  for (var i = 0; i < includeList.length; i++){
    segmentList.push(includeList[i]);
  }
  for (var i = 0; i < segmentList.length; i++){
    indexDictionary[segmentList[i]] = alphabet[i];
  }
  var conflictDictionary = createConflictDict(slashedText, segmentList);
  console.log(segmentList);
  console.log(conflictDictionary);  
  console.log(uncompressedText.length + "-byte input!");
  states.push([[], segmentList, 0, initializeSegmentSavings(uncompressedText, segmentList), slashedText, "", 0, 1000000]);
  while (states.length > 0){
    for (var i = 0; i < states.length; i++){
      for (var j = 0; j < states[i][1].length; j++){
        // Top priority: optimize core loop
        if (states[i][3][j] >= 0){
          var usedSegment = states[i][1][j];
          var newPossibleSegments = substituteSegmentList(states[i][1].slice(0,j).concat(states[i][1].slice(j+1,states[i][1].length)), states[i][1][j], emojis[states[i][0].length]);
          var subbedText = substituteSegment(states[i][4], states[i][1][j], emojis[states[i][0].length]);
          nextStates.push([states[i][0].concat(states[i][1][j]), newPossibleSegments, states[i][2] + states[i][3][j], createSegmentSavings(states[i], usedSegment, conflictDictionary), subbedText, states[i][5].concat(indexDictionary[iterativeUnsubText(states[i][1][j], states[i][0])]).split("").sort().join(""), states[i][6], states[i][7]]);
        }
      }
    }
    totalStateNum += nextStates.length;
    console.log("Finished generating children nodes.");

    nextStates.sort(function (a, b){
      return a[5].localeCompare(b[5], 'en', { sensitivity: 'base' });
    })

    var nextStateScores = [];
    for (i = 0; i + 1 < nextStates.length; i++){
      if (nextStates[i][5] == nextStates[i+1][5]){
        if (nextStates[i][1] > nextStates[i+1][1]){
          nextStates.splice(i+1, 1);
        } else {
          nextStates.splice(i, 1);
        }
        i -= 1;
        console.log("Omitted by direct comparison!") 
      }
    }
    var currentIterationLength = nextStates.length;
    while (currentIterationLength > 0){
      for (i = 0; i < currentIterationLength; i++){
        var minCurVal = findMinStateScore(nextStates[i]);
        nextStates[i][6] = Math.max(nextStates[i][6], minCurVal[2]);
        if (nextStates[i][6] > highestMin){
          highestMin = minCurVal[2];
          leadingState = minCurVal;
          console.log("New highest min: " + highestMin);
        }
      }
      console.log("Min iteration loop");
      currentIterationLength = Math.floor(iterateRatio*currentIterationLength);
      nextStates.sort(function (a,b){
        return calcStateScore(b[6], b[7], highestMin) - calcStateScore(a[6], a[7], highestMin);
      })
    }
    for (i = 0; i < nextStates.length; i++){
      var maxCurVal = findMaxStateScore(nextStates[i], conflictDictionary)
      nextStates[i][7] = Math.min(nextStates[i][7], maxCurVal);
      if (nextStates[i][7] < highestMin){
        nextStates.splice(i, 1);
        i -= 1;
        console.log("Omitted by min/max because under " + highestMin + " max");
      }
    }
    if (nextStates.length == 0){
      break;
    }
    nextStates.sort(function (a,b){
      return calcStateScore(a[6], a[7], highestMin) - calcStateScore(b[6], b[7], highestMin);
    })
    var heuristicCount = Math.floor(nextStates.length * heuristicRatio);
    var heuristicScore = Math.floor(calcStateScore(nextStates[heuristicCount][6], nextStates[heuristicCount][7], highestMin));
    for (var i = 0; i < heuristicCount; i++){
      nextStates.splice(0, 1);
      console.log("Omitted by heuristic b/c under " + heuristicScore + " score");
    }
    for (var i = 0; i < nextStates.length; i++){
      for (var j = 0; j < nextStates[i][0].length; j++){
        var tempSegment = iterativeUnsubText(nextStates[i][0][j], nextStates[i][0]);
        if (!(initList.includes(tempSegment))){
          continue;
        }
        if (tempSegment in usedSegmentDictionary){
          usedSegmentDictionary[tempSegment] = Math.floor(100*(usedSegmentDictionary[tempSegment] + calcStateScore(nextStates[i][6], nextStates[i][7], highestMin)/highestMin))/100;
        } else {
          usedSegmentDictionary[tempSegment] = Math.floor(100*calcStateScore(nextStates[i][6], nextStates[i][7], highestMin)/highestMin)/100;
        }
      }
    }
    console.log(usedSegmentDictionary);
    var usedSegmentListSorted = Object.keys(usedSegmentDictionary).sort(function (a,b){
      return usedSegmentDictionary[b] - usedSegmentDictionary[a];
    })
    console.log("Used segments out of dictionary:\n" + usedSegmentListSorted.join("\n"));
    states = nextStates;
    nextStates = [];
    console.log("Stage complete!");
    console.log("Leading score: " + highestMin);
    console.log("Leading state:\n" + leadingState[0].join("\n"));
    console.log("Length: " + states.length);
  }
  var endObject = new Date;
  var endTime = endObject.getTime();
  // Make it show all segments to use
  console.log("Best state:\n" + leadingState[0].join("\n"));
  console.log("Highest score: " + highestMin);
  console.log("This compression iterated through " + totalStateNum + " states.");
  console.log("Took " + Math.floor((endTime - startTime)*10)/10000 + " seconds.");

  output = "Dictionary:<br>" + leadingState[0].join("<br>") + "<br><br>Bytes saved: " + leadingState[2] + "<br>Took " + Math.floor((endTime - startTime)*10)/10000 + " seconds.";
  document.querySelector("#compressedText").innerHTML = output;
  window.sessionStorage.setItem('output', output);
  return output;
}

function checkExistingResult(){
  if (window.sessionStorage.getItem('output')){
    document.querySelector("#compressedText").innerHTML = window.sessionStorage.getItem('output');
    document.querySelector("#uncompressedText").value = window.sessionStorage.getItem('uncompressedText');
    document.querySelector("#includeList").value = window.sessionStorage.getItem('includeList');
    document.querySelector("#heuristicRatio").value = window.sessionStorage.getItem('heuristicRatio');
    document.querySelector("#iterateRatio").value = window.sessionStorage.getItem('iterateRatio');
    document.querySelector("#doDeeperSearch").value = window.sessionStorage.getItem('doDeeperSearch');
  }
}

function calcByteSavings(a, b){
  return (a - 1)*(b - 1) - 2;
}

function calcStateScore(min, max, leading){
  return (min + leading)/2 + Math.cbrt(leading-max);
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

function createSegmentSavings(array, segment, conflictDict){
  var newList = [];
  var currentDict = conflictDict[iterativeUnsubText(segment, array[0])];
  var selectedIndex = 0;
  for (var i = 0; i < array[1].length; i++){
    if (array[1][i] != segment){
      for (var j = 0; j < currentDict.length + 1; j++){
        if (currentDict[j][0] == iterativeUnsubText(array[1][i], array[0])){
          selectedIndex = j;
          break;
        }
      }
      newList.push(array[3][i] - currentDict[selectedIndex][1]);
    }
  }
  return newList;
}

function initializeSegmentSavings(text, segList){
  var newList = [];
  for (var i = 0; i < segList.length; i++){
    newList.push(calcByteSavings(countSegment(text, segList[i]), segList[i].length));
  }
  return newList;
}

function iterativeUnsubText(text, dictArray){
  var subbedText = "";
  for (var i = 0; i < text.length; i++){
    if (emojis.includes(text.substring(i, i+1))){
      subbedText = subbedText.concat(iterativeUnsubText(dictArray[emojis.indexOf(text.substring(i, i+1))], dictArray))
    } else {
      subbedText = subbedText.concat(text.substring(i, i+1));
    }
  }
  return subbedText;
}

function iterativeSubText(text, dictArray, isFullySub){
  var newText = standardizeText(text)
  for (var i = 0; i < dictArray.length; i++){
    newText = substituteSegment(newText, dictArray[i], emojis[i]);
    if (!isFullySub && newText.length == 1){
      newText = dictArray[i];
      break;
    }
  }
  return newText;
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
    newList.push(newText);
  }
  return newList;
}

function findMinStateScore(arr){
  var state = arr.slice(1, 5);
  var selectedIndex = 0;
  var counter = arr[0].length
  var isBreak = false;
  var usedSegmentList = [];
  // Fischer-Yates shuffle
  for (var i = 0; i < state[2].length; i++){
    var randomNumber = Math.floor(Math.random() * (state[2].length - i))
    if (randomNumber != state[2].length - i - 1){
      var t = state[2][0];
      state[2][0] = state[2][randomNumber];
      state[2][randomNumber] = t;
      t = state[0][0];
      state[0][0] = state[0][randomNumber];
      state[0][randomNumber] = t;
    }
  }
  for (var i = 0; i < state[2].length; i++){
    if (state[2].length >= 0) {
      var maxVal = state[2][0];
      var selectedIndex = 0;
      for (var j = 0; j < state[2].length; j++){
        if (state[2][j] > maxVal && Math.random() < 0.5){
          maxVal = state[2][j];
          selectedIndex = j;
        }
      }
      if (state[2][selectedIndex] <= 0){
        isBreak = true;
        break;
      }
      usedSegmentList.push(state[0][selectedIndex]);
      var newPossibleSegments = substituteSegmentList(state[0].slice(0,selectedIndex).concat(state[0].slice(selectedIndex+1, state[0].length)), state[0][selectedIndex], emojis[counter]);
      var subbedText = substituteSegment(state[3], state[0][selectedIndex], emojis[counter]);
      state = [newPossibleSegments, state[1] + state[2][selectedIndex], initializeSegmentSavings(subbedText, newPossibleSegments), subbedText];
      counter++;
    } else {
      break;
    }
    if (isBreak){
      break;
    }
  }
  return [arr[0].concat(usedSegmentList)].concat(state);
}

function findMaxStateScore(arr, dictionary){
  var sumTotal = 0;
  if (arr[3].length == 0){
    return arr[2];
  }
  for (var i = 0; i < arr[3].length; i++){
    if (arr[3][i] > 0){
      sumTotal += arr[3][i];
    }
  }
  // Fischer-Yates shuffle
  for (var i = 0; i < arr[3].length; i++){
    var randomNumber = Math.floor(Math.random() * (arr[3].length - i))
    if (randomNumber != arr[3].length - i - 1){
      var t = arr[3][0];
      arr[3][0] = arr[3][randomNumber];
      arr[3][randomNumber] = t;
      t = arr[1][0];
      arr[1][0] = arr[1][randomNumber];
      arr[1][randomNumber] = t;
    }
  }
  var usedList = [];
  var firstIndex = 0;
  var diffTotal = 0
  var firstSegment = iterativeUnsubText(arr[1][firstIndex], arr[0]);
  while (usedList.length + 1 < arr[3].length){
    while (usedList.includes(firstSegment)){
      if (firstIndex + 1 < arr[1].length){
        firstIndex++;
      } else {
        break;
      }
      firstSegment = iterativeUnsubText(arr[1][firstIndex], arr[0]);
    }
    var firstDict = dictionary[firstSegment]
    var firstScore = arr[3][firstIndex];
    var greatestDiff = 0
    var secondCandidate = firstDict[0][0];
    for (var i = 0; i < firstDict.length; i++){
      var secondSegment = firstDict[i][0];
      var replacedSecondSegment = iterativeSubText(secondSegment, arr[0], false);
      if (!(usedList.includes(secondSegment)) && firstSegment != secondSegment && !(arr[0].includes(replacedSecondSegment))){
        var secondDict = dictionary[secondSegment];
        var secondScore = 0;
        var j = 0;
        while (arr[1][j] != replacedSecondSegment){
          j++;
        }
        secondScore = arr[3][j];
        j = 0;
        while (secondDict[j][0] != firstSegment){
          j++;
        }
        firstDictIndex = j;
        var firstValue = Math.min(firstDict[i][1], secondScore);
        var secondValue = Math.min(secondDict[firstDictIndex][1], firstScore);
        var curDiff = Math.min(firstValue, secondValue);
        if (curDiff > greatestDiff){
          greatestDiff = curDiff;
          secondCandidate = secondSegment;
        }
      }
    }
    diffTotal += greatestDiff;
    if (greatestDiff != 0){
      usedList.push(firstSegment, secondCandidate);
      usedList.sort();
    } else {
      if (firstIndex + 1 < arr[1].length){
        firstIndex++;
      } else {
        break;
      }
    }
  }
  return arr[2] + sumTotal - diffTotal;
}

function findAllSegmentIndices(text, segment){
  var newText = standardizeText(text, "string");
  var indicesOfSegments = [];
  for (var i = 0; i <= newText.length - segment.length; i++){
    if (newText.substring(i, i+segment.length) == segment){
      for (var j = 0; j < segment.length; j++){
        indicesOfSegments.push(i + j);
      }
    }
  }
  return indicesOfSegments;
}

function standardizeText(text, type){
  var newList = [];
  for (var i = 0; i < text.length; i++){
    newList.push(text[i]);

    if (text[i] == " "){
      newList[i] = "_";
    }
  }
  return newList.join("").toLowerCase();
}

function createConflictDict(text, array){
  var standardText = standardizeText(text, "string");
  var sortedArray = array.sort(function (a, b) {return a.length - b.length});
  var conflictDict = {};
  for (var i = 0; i < sortedArray.length; i++){
    conflictDict[sortedArray[i]] = [];
  }
  for (i = 0; i < sortedArray.length; i++){
    for (var j = 0; j < sortedArray.length; j++){
      if (i == j){
        continue;
      }
      var nextSegment = substituteSegment(sortedArray[i], sortedArray[j], "♞");
      var subbedText = substituteSegment(standardText, sortedArray[j], "♞");
      var interferenceScore = calcByteSavings(countSegment(standardText, sortedArray[i]), sortedArray[i].length) - calcByteSavings(countSegment(subbedText, nextSegment), nextSegment.length);
      conflictDict[sortedArray[j]] = conflictDict[sortedArray[j]].concat([[sortedArray[i], interferenceScore]]);
    }
  }
  return conflictDict;
}

function splitText(text){
  var lastSplit = 0;
  var newList = [];
  for (var i = 1; i < text.length; i++){
    if ((text.substring(i,i+1) == "/" && text.substring(i-1,i) != "/")){
      newList.push(text.substring(lastSplit, i));
    } else if (text.substring(i, i+1) != "/" && text.substring(i-1,i) == "/"){
      lastSplit = i;
    }
  }
  if (text.substring(text.length - 1, text.length) != "/"){
    newList.push(text.substring(lastSplit, i));
  }
  return newList.sort(function(a,b){return b.length - a.length});
}

function slashText(text, list, dictionary, initDict){
  var textList = [];
  var slashList = [];
  var repsOfSegment = 0;

  for (var i = 0; i < text.length; i++){
    textList.push(text[i]);
    slashList.push(" ");

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
          dictionary[newText.substring(i, i + len)] = repsOfSegment;
          list.push(newText.substring(i, i + len));
          // If a 1-byte smaller string exists with the same repsOfSegment, delete the smaller string
          if (newText.substring(i, i + len - 1) in dictionary && repsOfSegment == dictionary[newText.substring(i, i + len - 1)]){
            list.splice(list.indexOf(newText.substring(i, i + len - 1)), 1);
            if (initDict[newText.substring(i, i + len)]){
              initDict[newText.substring(i, i + len)] = initDict[newText.substring(i, i + len)].concat([newText.substring(i, i + len - 1)]);
            } else {
              initDict[newText.substring(i, i + len)] = [newText.substring(i, i + len - 1)];
            }
            delete dictionary[newText.substring(i, i + len - 1)];
            delete initDict[newText.substring(i, i + len - 1)]
          }
          if (newText.substring(i + 1, i + len) in dictionary && repsOfSegment == dictionary[newText.substring(i + 1, i + len)]){
            list.splice(list.indexOf(newText.substring(i + 1, i + len)), 1);
            if (initDict[newText.substring(i, i + len)]){
              initDict[newText.substring(i, i + len)] = initDict[newText.substring(i, i + len)].concat([newText.substring(i + 1, i + len)]);
            } else {
              initDict[newText.substring(i, i + len)] = [newText.substring(i + 1, i + len)];
            }
            delete dictionary[newText.substring(i + 1, i + len)];
            delete initDict[newText.substring(i + 1, i + len)];
          }
        }
        // Number every index where the segment appeared
        var tempList = findAllSegmentIndices(newText, newText.substring(i, i + len));
        for (var j = 0; j < tempList.length; j++){
          slashList[tempList[j]] = len;
        }
      }
    }
    console.log("slashList: " + len + "-byte segments complete!");
  }
  // If not marked, slash letters
  for (i = 0; i < newText.length; i++){
    if (slashList[i] == " "){
      textList[i] = "/";
    }
  }
  console.log("slashList: All segments complete!");
  return textList.join("");
}