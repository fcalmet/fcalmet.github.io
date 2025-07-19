/*
  Copyright (C) 2025 by Fernando Calmet

  Author: Fernando Calmet

  This program is free software; you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

/**********************************************/
/** Create Footer Navigation Programatically **/
/**********************************************/

document.getElementById('footer-nav').innerHTML = `<ul>
		<li><a href="index.html">Home</a></li>
		<li><a href="Fib-4.html">Fib-4</a></li>
		<li><a href="Lille.html">Lille model</a></li>
		<li><a href="MDF.html">Maddrey score</a></li>
		<li><a href="MELD.html">MELD score</a></li>
	  </ul>`

/**********************/
/** Global Functions **/
/**********************/
function toPercent(p, decimals = 0) {
	return (p * 100).toFixed(decimals) + "%"
}

function error(message, id) {
	alert(message);
	document.getElementById(id).focus();
}

function setResult(html = '') {
	document.getElementById('result').innerHTML = html;
}

/***********/
/** Fib-4 **/
/***********/

function getFib4(age, platelets, ast, alt) {
	return (age * ast) / (platelets * Math.sqrt(alt))
}

function getFib4Interpretation(fib4, age, isMasld = true) {
	let uln = isMasld ? 2.67 : 3.25
	let lln = isMasld ? (age < 65 ? 1.3 : 2.0) : 1.45
	let interpretation = ''
	if (fib4 < lln) {
		interpretation = 'No advanced fibrosis'
	} else if (fib4 > uln) {
		interpretation = 'Advanced fibrosis'
	} else {
		interpretation = 'Indeterminate result'
	}
	if (isMasld && age < 35) {
		interpretation += ' (low accuracy in individuals aged <35)'
	}
	return interpretation
}

function calculateFib4() {
	let age = parseFloat(document.getElementById('age').value) || -1;
	let platelets = parseFloat(document.getElementById('platelets').value) || -1;
	let ast = parseFloat(document.getElementById('ast').value) || -1;
	let alt = parseFloat(document.getElementById('alt').value) || -1;
	let isMasld = document.querySelector('input[name="isMasld"][value="masld"]').checked;

	if (age < 0 || platelets < 0 || ast < 0 || alt < 0) return setResult();

	let fib4 = getFib4(age, platelets, ast, alt)
	let fib4interpretation = getFib4Interpretation(fib4, age, isMasld)

	setResult(`
		 <table class="results">
		   <tr><td>Fib-4: ${fib4.toFixed(3)}</td></tr>
		   <tr><td>${fib4interpretation}</td></tr>
		 </table>`)
}

/*****************/
/** Lille model **/
/*****************/

function getLille(age, albumin, bilirubin0, bilirubin7, creatinine, pt) {
	let r = 3.19 - 0.101 * age
        + 0.147 * albumin
        + 0.0165 * (bilirubin0 - bilirubin7)
        - 0.206 * (creatinine > 1.3 ? 1 : 0)
        - 0.0065 * bilirubin0
        - 0.0096 * pt
	let lille = Math.exp(-r) / (1 + Math.exp(-r))
	return lille
}

function getLilleMortality(lille) {
	return lille > 0.45 ? 0.25 : 0.85
}

function calculateLille() {
	let age = parseFloat(document.getElementById('age').value) || -1;
	let albumin = parseFloat(document.getElementById('albumin').value) || -1;
	let bilirubin0 = parseFloat(document.getElementById('bilirubin0').value) || -1;
	let bilirubin7 = parseFloat(document.getElementById('bilirubin7').value) || -1;
	let creatinine = parseFloat(document.getElementById('creatinine').value) || -1;
	let pt = parseFloat(document.getElementById('pt').value) || -1;

	if (age < 0 || albumin < 0 || bilirubin0 < 0 || bilirubin7 < 0 || creatinine < 0 || pt < 0) return setResult()

	let lille = getLille(age, albumin, bilirubin0, bilirubin7, creatinine, pt)
	let lilleMortality = getLilleMortality(lille)

	setResult(`
		 <table class="results">
		   <tr><td>Lille Score:</td><td>${lille.toFixed(3)}</td></tr>
		   <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;6-month survival:</td><td>${toPercent(lilleMortality)}</td></tr>
		   <tr><td colspan="2"><hr></td></tr>
		   <tr><td colspan="2">6-month predicted survival</td></tr>
		   <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;Score &lt;0.45</td><td>85%</td></tr>
		   <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;Score &gt;0.45</td><td>25%</td></tr>
		 </table>`)
}

/*******************/
/** Maddrey score **/
/*******************/

function getMdf(pt, ptRef, bilirubin) {
	return mdf = 4.6 * (pt - ptRef) + bilirubin
}

function getMdfInterpretation(mdf) {
	return (mdf > 32 ? 'Poor' : 'Good') + ' prognosis'
}

function calculateMdf() {
	let pt = parseFloat(document.getElementById('pt').value) || -1;
	let ptRef = parseFloat(document.getElementById('pt-ref').value) || -1;
	let bilirubin = parseFloat(document.getElementById('bilirubin').value) || -1;

	if (pt < 0 || ptRef < 0 || bilirubin < 0) return setResult()

	let mdf = getMdf(pt, ptRef, bilirubin)
	let mdfInterpretation = getMdfInterpretation(mdf)

	setResult(`
		 <table class="results">
		   <tr><td>Maddrey score: ${mdf.toFixed()}</td></tr>
		   <tr><td>${mdfInterpretation}</td></tr>
		 </table>`)
}

/****************/
/** MELD score **/
/****************/

function getMeld(creatinine, bilirubin, inr, isRrt) {
	if (isRrt) creatinine = 4.0
	let meld = 9.57 * Math.log(Math.max(creatinine, 1.0))
		+ 3.78 * Math.log(Math.min(Math.max(bilirubin, 1.0), 4.0))
		+ 11.2 * Math.log(inr)
		+ 6.43
	return Math.round(meld)
}

function getMeldMortality(meld) {
	return meld < 10 ? 0.019
		: meld < 20 ? 0.060
		: meld < 30 ? 0.196
		: meld < 40 ? 0.526 : 0.713
}

function getMeldNa(creatinine, bilirubin, inr, sodium, isRrt) {
	let meldNa = getMeld(creatinine, bilirubin, inr, isRrt)
	if (meldNa > 11) {
		meldNa = meldNa + 1.32 * (137 - sodium) - (0.033 * meldNa * (137 - sodium))
	}
	return Math.round(meldNa)
}

function getMeld3(creatinine, bilirubin, inr, sodium, albumin, isRrt, isFemale) {
	if (isRrt) creatinine = 3.0
	let logBilirubin = Math.log(Math.max(bilirubin, 1.0))
	let logCreatinine = Math.log(Math.min(Math.max(creatinine, 1.0), 3.0))
	let logInr = Math.log(Math.max(inr, 1.0))
	let nSodium = 137 - Math.min(Math.max(sodium, 125), 137)
	let nAlbumin = 3.5 - Math.min(Math.max(albumin, 1.5), 3.5)
	let meld3 = (isFemale ? 1.33 : 0.0)
		+ 4.56 * logBilirubin
		+ 0.82 * nSodium
		- 0.24 * nSodium * logBilirubin
		+ 9.09 * logInr
		+ 11.14 * logCreatinine
		+ 1.85 * nAlbumin
		- 1.83 * nAlbumin * logCreatinine
		+ 6
	return Math.round(meld3)
}

function getMeld3Survival(meld3, days) {
	let s0 = 0
	switch (days) {
	case 15: s0 = 0.991; break;
	case 30: s0 = 0.981; break;
	case 45: s0 = 0.971; break;
	case 60: s0 = 0.963; break;
	case 75: s0 = 0.955; break;
	case 90: s0 = 0.946; break;
	}
	return s0 ** Math.exp(0.17698 * meld3 - 3.56)
}

function calculateMeld() {
	let creatinine = parseFloat(document.getElementById('creatinine').value) || -1;
	let bilirubin = parseFloat(document.getElementById('bilirubin').value) || -1;
	let inr = parseFloat(document.getElementById('inr').value) || -1;
	let sodium = parseFloat(document.getElementById('sodium').value) || -1;
	let albumin = parseFloat(document.getElementById('albumin').value) || -1;

	if (creatinine < 0 || bilirubin < 0 || inr < 0) return setResult()

	let isFemale = document.querySelector('input[name="sex"][value="female"]').checked
	let isRrt = document.querySelector('input[name="rrt"][value="yes"]').checked

	let meld = getMeld(creatinine, bilirubin, inr, isRrt)
	let meldMortality = getMeldMortality(meld)
	let meldNa = getMeldNa(creatinine, bilirubin, inr, sodium, isRrt)
	let meld3 = getMeld3(creatinine, bilirubin, inr, sodium, albumin, isRrt, isFemale)

	let html = `
		 <table class="results">
		   <tr><td>MELD:</td><td>${meld}</td></tr>
		   <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;90-day mortality:</td><td>${toPercent(meldMortality, 1)}</td></tr>`;

	if (sodium >= 0)
		html += `<tr><td colspan="2"><hr></td></tr>
		   <tr><td>MELD-Na:</td><td>${meldNa}</td></tr>`;

	if (sodium >= 0 && albumin >= 0)
		html += `<tr><td colspan="2"><hr></td></tr>
		   <tr><td>MELD 3.0:</td><td>${meld3}</td></tr>
		   <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;15-day survival:</td><td>${toPercent(getMeld3Survival(meld3, 15), 1)}</td></tr>
		   <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;30-day survival:</td><td>${toPercent(getMeld3Survival(meld3, 30), 1)}</td></tr>
		   <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;45-day survival:</td><td>${toPercent(getMeld3Survival(meld3, 45), 1)}</td></tr>
		   <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;60-day survival:</td><td>${toPercent(getMeld3Survival(meld3, 60), 1)}</td></tr>
		   <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;75-day survival:</td><td>${toPercent(getMeld3Survival(meld3, 75), 1)}</td></tr>
		   <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;90-day survival:</td><td>${toPercent(getMeld3Survival(meld3, 90), 1)}</td></tr>`

	html += `</table>`

	setResult(html);
}
