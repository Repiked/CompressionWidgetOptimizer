// Citations:
//  https://javascript.plainenglish.io/create-an-array-of-alphabet-characters-in-javascript-with-this-simple-trick-930033079dd3
//  for the alphabet generator

var emojis = ["☀", "☂", "☃", "☄", "★", "☆", "☇", "☈", "☉", "☊", "☋", "☌", "☍", "☎", "☏"];
var emojisSet = new Set(emojis);
var alpha1 = Array.from(Array(26)).map((e, i) => i + 97);
var alpha2 = Array.from(Array(26)).map((e, i) => i + 65);
var alphabet = alpha2.concat(alpha1).map((x) => String.fromCharCode(x)).concat(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "!"]);
var output = "";

function solveText(){
  var startObject = new Date;
  var startTime = startObject.getTime();
  var uncompressedText = standardizeText(document.querySelector("#uncompressedText").value);
  var textSelect = document.querySelector("#premadeTextDropdown").value;
  var includeList = document.querySelector("#suggestedSegments").value.split("\n");
  var heuristicRatio = parseFloat(document.querySelector("#heuristicRatio").value);
  var iterateRatio = parseFloat(document.querySelector("#iterateRatio").value);
  var minNodes = parseFloat(document.querySelector("#minNodes").value);
  var doDeeperSearch = document.querySelector("#doDeeperSearch").checked;
  
  window.sessionStorage.setItem('uncompressedText', uncompressedText);
  window.sessionStorage.setItem('textSelect', textSelect);
  window.sessionStorage.setItem('includeList', includeList.join("\n"));
  window.sessionStorage.setItem('heuristicRatio', heuristicRatio);
  window.sessionStorage.setItem('iterateRatio', iterateRatio);
  window.sessionStorage.setItem('minNodes', minNodes);
  window.sessionStorage.setItem('doDeeperSearch', doDeeperSearch);

  if (uncompressedText.length < 8){
    throw "Text must be at least 8 bytes!";
    document.querySelector("#output").innerHTML = "Text must be at least 8 bytes!";
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
          if (initialDictionary[segmentList[i]][j]){
            if (doDeeperSearch && segmentList[i].length == initialDictionary[segmentList[i]][j].length + 1){
              segmentList.push(initialDictionary[segmentList[i]][j]);
              initList.push(initialDictionary[segmentList[i]][j]);
            }
          }
        }
      }
    }
  }
  for (var i = 0; i < includeList.length; i++){
    if (!(segmentList.includes(includeList[i]))){
      segmentList.push(includeList[i]);
      initList.push(includeList[i]);
    }
  }
  var alphabetCounter = 0;
  for (var i = 0; i < segmentList.length; i++){
    for (var j = 0; j < Object.keys(indexDictionary).length; j++){
      if (isCyclic(Object.keys(indexDictionary)[j], segmentList[i], segmentDictionary)){
        indexDictionary[segmentList[i]] = indexDictionary[Object.keys(indexDictionary)[j]];
      }
    }
    if (!(indexDictionary[segmentList[i]])){
     indexDictionary[segmentList[i]] = alphabet[alphabetCounter];
     alphabetCounter++;
    }
  }
  segmentList.sort(function (a,b){
    return b.length - a.length;
  })
  console.log(indexDictionary);
  console.log(segmentList);
  console.log(segmentDictionary);
  var conflictDictionary = createConflictDict(slashedText, segmentList);
  var interferenceDictionary = createInterferenceDict(slashedText, segmentList);
  var maxDictionary = {};
  var conflictSegList = Object.keys(conflictDictionary)
  for (var i = 0; i < conflictSegList.length; i++){
    var conflictIndexDict = conflictDictionary[conflictSegList[i]];
    var conflictIndexList = Object.keys(conflictIndexDict);
    maxDictionary[conflictSegList[i]] = conflictIndexList.sort(function sortMaxDict (a,b){
      var firstAScore = conflictIndexDict[a];
      var secondAScore = conflictDictionary[a][conflictSegList[i]];
      var firstBScore = conflictIndexDict[b];
      var secondBScore = conflictDictionary[b][conflictSegList[i]]
      return Math.min(firstBScore, secondBScore) - Math.min(firstAScore, secondAScore);
    })
  }
  console.log(maxDictionary);
  console.log(conflictDictionary); 
  console.log(interferenceDictionary); 
  console.log(uncompressedText.length + "-byte input!");
  states.push([[], segmentList, 0, initializeInterferenceSets(slashedText, segmentList), slashedText, "", 0, 1000000]);
  console.log(states);
  while (states.length > 0){
    for (var i = 0; i < states.length; i++){
      for (var j = 0; j < states[i][1].length; j++){
        // Top priority: optimize core loop
        if (calcSetSavings(states[i], j) > 0){
          var usedSegment = states[i][1][j];
          var newPossibleSegments = substituteSegmentList(states[i][1].slice(0,j).concat(states[i][1].slice(j+1,states[i][1].length)), states[i][1][j], emojis[states[i][0].length]);
          var subbedText = substituteSegment(states[i][4], states[i][1][j], emojis[states[i][0].length]);
          var indexString = states[i][5].concat(indexDictionary[recursiveUnsubText(states[i][1][j], states[i][0])]).split("").sort().join("")
          var newSavings = createSetInstances(states[i], states[i][1][j], interferenceDictionary, true);
          nextStates.push([states[i][0].concat(states[i][1][j]), newPossibleSegments, states[i][2] + calcSetSavings(states[i], j), newSavings, subbedText, indexString, states[i][6], states[i][7]]);
        }
      }
    }
    totalStateNum += nextStates.length;
    console.log("Finished generating " + nextStates.length + " children nodes.");
    nextStates.sort(function sortDirect(a, b){
      return a[5].localeCompare(b[5], 'en', { sensitivity: 'base' });
    })
    for (var i = 0; i + 1 < nextStates.length; i++){
      if (nextStates[i][5] == nextStates[i+1][5]){
        if (nextStates[i][2] > nextStates[i+1][2]){
          nextStates.splice(i+1, 1);
        } else if (nextStates[i][2] < nextStates[i+1][2]) {
          nextStates.splice(i, 1);
        } else {
          continue;
        }
        i -= 1;
        console.log("Omitted by direct comparison!");
      }
    }
    for (i = 0; i < nextStates.length; i++){
      var maxCurVal = findMaxStateScore(nextStates[i], conflictDictionary, highestMin, maxDictionary)
      nextStates[i][7] = Math.min(nextStates[i][7], maxCurVal);
      if (nextStates[i][7] < highestMin){
        nextStates.splice(i, 1);
        i -= 1;
        console.log("Omitted by min/max because under " + highestMin + " max");
      }
    }
    var currentIterationLength = nextStates.length; 
    while (currentIterationLength > 0){
      for (i = 0; i < currentIterationLength; i++){
        var minCurVal = findMinStateScore(nextStates[i], interferenceDictionary);
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
    for (var i = 0; i < nextStates.length; i++){
      if (nextStates[i][7] < nextStates[i][6]){
        console.log("Calculated min is greater than max!");
      }
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
    var heuristicCount = Math.min(Math.floor(nextStates.length * heuristicRatio), Math.max(nextStates.length - minNodes, 0));
    var heuristicScore = Math.floor(calcStateScore(nextStates[heuristicCount][6], nextStates[heuristicCount][7], highestMin));
    nextStates = nextStates.slice(heuristicCount, nextStates.length);
    console.log(`(${heuristicCount}) Omitted by heuristic b/c under ${heuristicScore}`);
    for (var i = 0; i < nextStates.length; i++){
      for (var j = 0; j < nextStates[i][0].length; j++){
        var tempSegment = recursiveUnsubText(nextStates[i][0][j], nextStates[i][0]);
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
    console.log("Used segments out of deeper/suggested segments:\n" + usedSegmentListSorted.join("\n"));
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

  var compressionRatio = Math.round(leadingState[2]/uncompressedText.length * 10000)/100
  output = "Dictionary:<br>" + leadingState[0].join("<br>") + "<br><br>Total: " + (uncompressedText.length - leadingState[2]) + "<br>Original text size: " + uncompressedText.length + "<br>Compression ratio: " + compressionRatio + "%<br><br>Bytes saved: " + leadingState[2] + "<br>Took " + Math.floor((endTime - startTime)*10)/10000 + " seconds.";
  document.querySelector("#output").innerHTML = output;
  window.sessionStorage.setItem('output', output);
  return output;
}

function checkExistingResult(){
  if (window.sessionStorage.getItem('output')){
    document.querySelector("#output").innerHTML = window.sessionStorage.getItem('output');
    document.querySelector("#uncompressedText").value = window.sessionStorage.getItem('uncompressedText');
    document.querySelector("#premadeTextDropdown").value = window.sessionStorage.getItem('textSelect');
    document.querySelector("#suggestedSegments").value = window.sessionStorage.getItem('includeList');
    document.querySelector("#heuristicRatio").value = window.sessionStorage.getItem('heuristicRatio');
    document.querySelector("#iterateRatio").value = window.sessionStorage.getItem('iterateRatio');
    document.querySelector("#minNodes").value = window.sessionStorage.getItem('minNodes');
    if (window.sessionStorage.getItem('doDeeperSearch') == 'true'){
      document.querySelector("#doDeeperSearch").checked = 'true';
    }
  }
}

function changeUncompressedText(){
  var optionChosen = document.querySelector("#premadeTextDropdown").value;
  var prebuiltDict = {
      "soWakeMeUp" : "So_wake_me_up_when_it's_all_over_When_I'm_wiser_and_I'm_older_All_this_time_I_was_finding_myself_And_I_didn't_know_I_was_lost__Didn't_know_I_was_lost_I_didn't_know_I_was_lost_I_didn't_know_I_was_lost_I_didn't_know_(didn't_know,_didn't_know)",
      "iNeedADollar" : "I_Need_a_Dollar_by_Aloe_Blacc_I_need_a_dollar,_dollar_A_dollar_that's_what_I_need_Well_I_need_a_dollar,_dollar_A_dollar_that's_what_I_need_Said_I_said_I_need_dollar,_dollar_A_dollar_that's_what_I_need_And_if_I_share_with_you_my_story_would_you_share_your_dollar_with_me?",
      "theMan" : "The_Man_by_Aloe_Blacc_Well_you_can_tell_everybody_Yeah_you_can_tell_everybody_Go_ahead_and_tell_everybody_I'm_the_man,_I'm_the_man,_I'm_the_man_Well_you_can_tell_everybody_Yeah_you_can_tell_everybody_Go_ahead_and_tell_everybody_I'm_the_man,_I'm_the_man,_I'm_the_man_Yes_I_am,_yes_I_am,_yes_I_am_I'm_the_man,_I'm_the_man,_I'm_the_man",
      "pitterPatter" : "Pitter_patter_pitter_patter_listen_to_the_rain_pitter_patter_pitter_patter_on_the_window_pane",
      "tutorWhoTooted" : 'A_tutor_who_tooted_the_flute_Tried_to_tutor_two_tooters_to_toot_Said_the_two_to_their_tutor,_"Is_it_harder_to_toot_Or_to_tutor_two_tooters_to_toot?"',
      "sheSellsSeaShells" : "She_sells_sea_shells_on_the_sea_shore_The_shells_that_she_sells_are_sea_shells_I'm_sure_So_if_she_sells_sea_shells_on_the_sea_shore_I'm_sure_that_the_shells_are_sea_shore_shells_",
      "iKnowAnOldLady" : "I_know_an_old_lady_who_swallowed_a_bird_How_absurd!_She_swallowed_a_bird!_She_swallowed_the_bird_to_catch_the_spider_That_wriggled_and_jiggled_and_tickled_inside_her_She_swallowed_the_spider_to_catch_the_fly_I_don't_know_why_she_swallowed_a_fly_Perhaps_she'll_die",
      "peasePorridgeHot" : "Pease_porridge_hot_Pease_porridge_cold_Pease_porridge_in_the_pot_Nine_days_old._Some_like_it_hot_Some_like_it_cold_Some_like_it_in_the_pot_Nine_days_old.",
      "Aaaaaaaa" : "Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  }
  document.querySelector("#uncompressedText").value = prebuiltDict[optionChosen];
}

function calcByteSavings(a, b){
  return (a - 1)*(b - 1) - 2;
}

function calcStateScore(min, max, leading){
  return (min + leading)/2 + Math.cbrt(max-leading);
}

function calcSetSavings(array, index){
  return calcByteSavings(array[3][index].size, array[1][index].length);
}

// If text == segment, then return is 1
function countSegment(text, segment){
  var numOfSegments = 0;
  for (var i = 0; i <= text.length - segment.length; i++){
    if (text.substring(i, i+segment.length) == segment){
      numOfSegments += 1;
      i += segment.length - 1;
    }
  }
  return numOfSegments;
}

function createSegmentSavings(array, segment){
  var newList = array[3];
  var subbedSegment = recursiveUnsubText(segment, array[0]);
  for (var i = 0; i < array[1].length; i++){
    if (array[1][i] != segment){
      continue;
    }
  }
  return newList;
}

function createSetInstances(array, segment, interfereDict, doSub) {
  var newList = array[3].map(set => new Set(set));
  var newSegList, subbedSegment;

  if (doSub) {
    newSegList = array[1].map(a => recursiveUnsubText(a, array[0]));
    subbedSegment = recursiveUnsubText(segment, array[0]);
  } else {
    newSegList = [...array[1]];
    subbedSegment = segment;
  }

  for (var i = 0; i < array[1].length; i++) {
    if (array[1][i] !== segment) {
      var interfereSet = interfereDict[subbedSegment][newSegList[i]];
      for (var element of interfereSet) {
        newList[i].delete(element);
      }
    } else {
      newList[i] = null;
    }
  }

  var nullIndex = newList.findIndex(set => set === null);
  if (nullIndex !== -1) {
    newList.splice(nullIndex, 1);
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

function recursiveUnsubText(text, dictArray) {
  var subbedText = "";
  for (let i = 0; i < text.length; i++) {
    var char = text[i];
    if (emojisSet.has(char)) {
      var index = emojis.indexOf(char);
      var value = dictArray[index];
      subbedText += recursiveUnsubText(value, dictArray);
    } else {
      subbedText += char;
    }
  }
  return subbedText;
}

function recursiveSubText(text, dictArray, isFullySub){
  var newText = ""
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
  var newText = text;
  for (var i = 0; i <= text.length - segment.length; i++){
    if (newText.substring(i, i+segment.length) == segment){
      newText = newText.slice(0,i) + substitute + newText.slice(i + segment.length, newText.length);
    }
  }
  return newText;
}

function substituteSegmentList(textList, segment, substitute){
  var newList = [];
  for (var i = 0; i < textList.length; i++){
    var newText = textList[i];
    for (var j = 0; j <= newText.length - segment.length; j++){
      if (newText.substring(j, j+segment.length) == segment){
        newText = newText.slice(0,j) + substitute + newText.slice(j + segment.length, newText.length);
      }
    }
    newList.push(newText);
  }
  return newList;
}

// remake this, state slice isn't necessary
function findMinStateScore(arr, interferenceDict){
  var state = arr.slice(1, 5);
  var selectedIndex = 0;
  var counter = arr[0].length
  var isBreak = false;
  var usedSegmentList = [];
  // Fisher-Yates shuffle
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
      var maxVal = calcSetSavings([arr[0]].concat(state), 0);
      var selectedIndex = 0;
      for (var j = 0; j < state[2].length; j++){
        if (calcSetSavings([arr[0]].concat(state), j) > maxVal && Math.random() < 0.8){
          maxVal = calcSetSavings([arr[0]].concat(state), j);
          selectedIndex = j;
        }
      }
      if (calcSetSavings([arr[0]].concat(state), selectedIndex) <= 0){
        isBreak = true;
        break;
      }
      usedSegmentList.push(state[0][selectedIndex]);
      var newPossibleSegments = substituteSegmentList(state[0].slice(0,selectedIndex).concat(state[0].slice(selectedIndex+1, state[0].length)), state[0][selectedIndex], emojis[counter]);
      var subbedText = substituteSegment(state[3], state[0][selectedIndex], emojis[counter]);
      var newSavings = createSetInstances([arr[0].concat(usedSegmentList)].concat(state.slice(0, 4)), state[0][selectedIndex], interferenceDict, true)
      state = [newPossibleSegments, state[1] + calcSetSavings([arr[0].concat(usedSegmentList)].concat(state), selectedIndex), newSavings, subbedText];
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

function findMaxStateScore(arr, conflictDict, goal, maxDict){
  var sumTotal = 0;
  if (arr[3].length == 0){
    return arr[2];
  }
  for (var i = 0; i < arr[3].length; i++){
    if (calcSetSavings(arr, i) > 0){
      sumTotal += calcSetSavings(arr, i);
    }
  }
  // Fisher-Yates shuffle
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
  var diffTotal = 0
  var unusedList = [];
  for (var i = 0; i < arr[1].length; i++){
    unusedList.push(recursiveUnsubText(arr[1][i], arr[0]));
  }
  var referenceDictionary = {};
  for (var i = 0; i < unusedList.length; i++){
    referenceDictionary[unusedList[i]] = calcSetSavings(arr, i);
  }
  var firstIndex = 0;
  while (unusedList.length - 1 > 0){
    var firstSegment = unusedList[firstIndex];
    var firstScore = referenceDictionary[firstSegment];
    var greatestDiff = 0
    var secondCandidate = maxDict[firstSegment][0];
    for (var i = 0; i < maxDict[firstSegment].length; i++){
      var secondSegment = maxDict[firstSegment][i];
      if (unusedList.includes(secondSegment)){
        var secondScore = referenceDictionary[secondSegment];
        var firstValue = Math.min(conflictDict[firstSegment][secondSegment], secondScore);
        var secondValue = Math.min(conflictDict[secondSegment][firstSegment], firstScore);
        var greatestDiff = Math.min(firstValue, secondValue);
        break;
      }
    }
    diffTotal += greatestDiff;
    if (greatestDiff > 0){
      unusedList.splice(firstIndex, 1)
      unusedList.splice(unusedList.indexOf(secondCandidate), 1);
      firstIndex = 0;
      if (arr[2] + sumTotal - diffTotal < goal){
        break;
      }
    } else {
      if (firstIndex + 1 < unusedList.length){
        firstIndex++;
      } else {
        break;
      }
    }
    if (firstIndex + 1 >= unusedList.length || arr[2] + sumTotal - diffTotal < goal){
      break;
    }
  }
  return arr[2] + sumTotal - diffTotal;
}

function findAllSegmentIndices(text, segment, mode){
  var indicesOfSegments = [];
  for (var i = 0; i <= text.length - segment.length; i++){
    if (text.substring(i, i+segment.length) == segment){
      if (mode == true){
        indicesOfSegments.push(i);
        i += segment.length - 1;
      } else {
        for (var j = 0; j < segment.length; j++){
          indicesOfSegments.push(i + j);
        }
      }
    }
  }
  return indicesOfSegments;
}

function findIndicesInterference(targetList, conflictList, targetSeg, conflictSeg){
  var interfereSet = new Set();
  for (var i = 0; i < conflictList.length; i++){
    for (var j = 0; j < targetList.length; j++){
      var indexi = conflictList[i];
      var indexj = targetList[j];
      var endi = conflictList[i] + conflictSeg.length;
      var endj = targetList[j] + targetSeg.length;
      if (indexj <= indexi && endj >= endi) {} 
      else if (indexi <= indexj && endi > indexj) {
        interfereSet.add(j);
      } else if (indexj <= indexi && endj > indexi) {
        interfereSet.add(j);
      }
    }
  }
  return interfereSet;
}

function standardizeText(text){
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
  var sortedArray = array.sort(function (a, b) {return a.length - b.length});
  var conflictDict = {};
  for (var i = 0; i < sortedArray.length; i++){
    conflictDict[sortedArray[i]] = {};
  }
  for (var i = 0; i < sortedArray.length; i++){
    for (var j = 0; j < sortedArray.length; j++){
      if (i != j){
        var nextSegment = substituteSegment(sortedArray[i], sortedArray[j], "♞");
        var subbedText = substituteSegment(text, sortedArray[j], "♞");
        var initialScore = calcByteSavings(countSegment(text, sortedArray[i]), sortedArray[i].length)
        var finalScore = calcByteSavings(countSegment(subbedText, nextSegment), nextSegment.length)
        var interferenceScore = initialScore - finalScore;     
        conflictDict[sortedArray[j]][sortedArray[i]] = interferenceScore;
      }
    }
  }
  return conflictDict;
}

function initializeInterferenceSets(text, array){
  var newList = [];
  for (var i = 0; i < array.length; i++){
    var repsOfSegment = countSegment(text, array[i]);
    newList.push(new Set());
    for (var j = 0; j < repsOfSegment; j++){
      newList[i].add(j);
    }
  }
  return newList;
}

function createInterferenceDict(text, array){
  var sortedArray = array.sort(function (a,b){
    return b.length - a.length
  })
  var interferenceDict = {};
  for (var i = 0; i < sortedArray.length; i++){
    interferenceDict[sortedArray[i]] = {};
  }
  for (var i = 0; i < sortedArray.length; i++){
    for (var j = 0; j < sortedArray.length; j++){
      if (i != j){
        var targetIndices = findAllSegmentIndices(text, sortedArray[i], true);
        var conflictIndices = findAllSegmentIndices(text, sortedArray[j], true);
        var interfereIndices = findIndicesInterference(targetIndices, conflictIndices, sortedArray[i], sortedArray[j]);
        interferenceDict[sortedArray[j]][sortedArray[i]] = interfereIndices
      }
    }
  }
  return interferenceDict;
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

function isCyclic(seg1, seg2, dict){
  if (dict[seg1] != dict[seg2] || seg1.length != seg2.length){
    return false;
  }
  var newSegment = seg1;
  for (var i = 0; i < seg1.length - 1; i++){
    newSegment = newSegment.slice(newSegment.length - 1, newSegment.length).concat(newSegment.slice(0, newSegment.length - 1))
    if (newSegment == seg2){
      return true;
    }
  }
  return false;
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
            var nestedDictContents = initDict[newText.substring(i, i + len - 1)];
            var newSegment = newText.substring(i, i + len - 1);
            if (initDict[newText.substring(i, i + len)]){
              initDict[newText.substring(i, i + len)] = initDict[newText.substring(i, i + len)].concat([newSegment]).concat(nestedDictContents);
            } else {
              initDict[newText.substring(i, i + len)] = [newText.substring(i, i + len - 1)].concat(nestedDictContents);
            }
            delete dictionary[newText.substring(i, i + len - 1)];
            delete initDict[newText.substring(i, i + len - 1)];
          }
          if (newText.substring(i + 1, i + len) in dictionary && repsOfSegment == dictionary[newText.substring(i + 1, i + len)]){
            list.splice(list.indexOf(newText.substring(i + 1, i + len)), 1);
            var nestedDictContents = initDict[newText.substring(i + 1, i + len)];
            var newSegment = newText.substring(i + 1, i + len);
            if (initDict[newText.substring(i, i + len)]){
              initDict[newText.substring(i, i + len)] = initDict[newText.substring(i, i + len)].concat([newSegment]).concat(nestedDictContents);
            } else {
              initDict[newText.substring(i, i + len)] = [newSegment].concat(nestedDictContents);
            }
            delete dictionary[newText.substring(i + 1, i + len)];
            delete initDict[newText.substring(i + 1, i + len)];
          }
        }
        // Number every index where the segment appeared
        var tempList = findAllSegmentIndices(newText, newText.substring(i, i + len), false);
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