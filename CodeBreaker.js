var secretWord;
var guessNumber;
var currentLetter;

function setupBoard() {
	guessNumber = 0;
	currentLetter = 0;
	clearGuessList();
	clearButtonStyles();
	if (getPopup().style.display == "block") {
		getPopup().style.display = "none";
	} else {
		setupButtonFunctions();
	}

	updateCheckButton();
	secretWord = chooseRandomElement(dictionary);
}

function clearButtonStyles() {
	var keys = document.getElementsByClassName("keyboard-key")
	for (var key of keys) {
		key.classList.remove("correct-letter");
		key.classList.remove("wrong-location");
		key.classList.remove("wrong-letter");
	}
}

function clearGuessList() {
	getGuessList().innerHTML = emptyGuessRowHtml();
}

function addGuessRow() {
	getGuessList().innerHTML += emptyGuessRowHtml();
}

function getGuessList() {
	return document.getElementById("guess-list");
}

function scrollToBottomOfGuessList() {
	var guessList = getGuessList();
	guessList.scrollTop = guessList.scrollHeight - guessList.clientHeight;
}

function chooseRandomElement(list) {
	return list[Math.floor(Math.random()*list.length)];
}

function checkGuessAndUpdateStyles(rowElement) {
	letterElements = rowElement.getElementsByClassName("letter-square");
	var unmatchedLetter = [];
	var unmatchedElements = [];

	for (var i = 0; i < letterElements.length; i++) {
		if (letterElements[i].innerHTML == secretWord[i]) {
			letterElements[i].classList.add("correct-letter");
			updateKeyboardKeyStyle(letterElements[i].innerHTML, "correct-letter");
		}
		else {
			unmatchedLetter.push(secretWord[i]);
			unmatchedElements.push(letterElements[i]);
		}
	}

	unmatchedLetter.sort();
	unmatchedElements.sort(function(a, b){return a.innerHTML.localeCompare(b.innerHTML)});

	var j = 0;
	for (var i = 0; i < unmatchedElements.length; i++) {
		// skip letters that were not guessed
		while (j < unmatchedLetter.length && unmatchedLetter[j] < unmatchedElements[i].innerHTML) {
			j++;
		}
		// Matches mean the letter was correct, but misplaced
		if (j < unmatchedLetter.length && unmatchedLetter[j] == unmatchedElements[i].innerHTML) {
			unmatchedElements[i].classList.add("wrong-location");
			updateKeyboardKeyStyle(unmatchedElements[i].innerHTML, "wrong-location");
			j++;	// If the same letter was guessed twice, but only matches once, show the second as a wrong letter
		} else {
			unmatchedElements[i].classList.add("wrong-letter");
			updateKeyboardKeyStyle(unmatchedElements[i].innerHTML, "wrong-letter");
		}
	}
}

function updateKeyboardKeyStyle(letter, newClass) {
	var keyElement = document.getElementById(letter+"-key");

	if (keyElement.classList.contains("correct-letter")) {
		return;
	} else if (newClass == "correct-letter") {
		keyElement.classList.remove("wrong-location");
		keyElement.classList.add(newClass);
	} else if (keyElement.classList.contains("wrong-location")) {
		return;
	} else if (newClass == "wrong-location") {
		keyElement.classList.add(newClass);
	} else {
		keyElement.classList.add(newClass);
	}
}

function emptyGuessRowHtml() {
	var html = '<div class="guess-row"><div class="guess-number">' + (guessNumber + 1) + '</div>';
	for (var j = 0; j < 5; j++) {
		html += '<div class="letter-square"></div>'
	}
	html += "</div>"
	return html;
}

function setupButtonFunctions() {
	var keyboardKeys = document.getElementsByClassName("keyboard-key");
	for (var key of keyboardKeys) {
		key.addEventListener("click", (e) => {
			handleKeyboardKey(e.target.id.replace("-key",""));
		});
	}

	document.addEventListener("keydown", (e) => {
		handleKeyboardKey(e.key);
	});
}

function handleKeyboardKey(keyValue) {
	if (getPopup().style.display == "block") {
		if (keyValue === "Enter") {
			setupBoard();
		}
		return;
	}

	if (keyValue === "Back" || keyValue === "Backspace") {
		if (currentLetter > 0) {
			currentLetter--;
			getCurrentGuessElements()[currentLetter].innerHTML = "";
		}
		scrollToBottomOfGuessList();
	}
	else if (keyValue === "Check" || keyValue === "Enter") {
		if (currentLetter === 5 && document.getElementById("Check-key").classList.contains("valid-word")) {
			checkGuessAndUpdateStyles(document.getElementsByClassName("guess-row")[guessNumber]);
			if (getCurrentGuess() === secretWord) {
				populatePopupFields();
				getPopup().style.display = "block";
				return;
			}
			currentLetter = 0;
			guessNumber++;
			addGuessRow();
		}
		scrollToBottomOfGuessList();
	}
	else {
		var upperValue = keyValue.toUpperCase();
		if (upperValue.length === 1 && upperValue.match(/[A-Z]/)) {
			if (currentLetter < 5) {
				getCurrentGuessElements()[currentLetter].innerHTML = upperValue;
				currentLetter++;
			}
			scrollToBottomOfGuessList();
		}
	}
	updateCheckButton();
}

function updateCheckButton() {
	var checkButton = document.getElementById("Check-key");
	if (currentLetter === 5 && dictionary.includes(getCurrentGuess())) {
		checkButton.classList.remove("not-valid-word");
		checkButton.classList.remove("too-short");
		checkButton.classList.add("valid-word");
		checkButton.innerHTML = "Check Guess";
	} else if (currentLetter === 5) {
		checkButton.classList.remove("valid-word");
		checkButton.classList.remove("too-short");
		checkButton.classList.add("not-valid-word");
		checkButton.innerHTML = "Not a Word";
	} else {
		checkButton.classList.remove("valid-word");
		checkButton.classList.remove("not-valid-word");
		checkButton.classList.add("too-short");
		checkButton.innerHTML = "Check Guess";
	}
}

function getCurrentGuess() {
	var guessString = "";
	for (var element of getCurrentGuessElements()) {
		guessString += element.innerHTML;
	}
	return guessString;
}

function getCurrentGuessElements() {
	return document.getElementsByClassName("guess-row")[guessNumber].getElementsByClassName("letter-square");
}

function getPopup() {
	return document.getElementById("popup");
}

function populatePopupFields() {
	document.getElementById("secret-word").innerHTML = secretWord;
	document.getElementById("number-of-guesses").innerHTML = guessNumber + 1;
	document.getElementById("number-of-used-letters").innerHTML = document.getElementById("on-screen-keyboard").querySelectorAll(".correct-letter,.wrong-location,.wrong-letter").length;
}