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
  <li><a href="APRI.html">APRI</a></li>
  <li><a href="Fib-4.html">Fib-4</a></li>
  <li><a href="Lille.html">Lille model</a></li>
  <li><a href="MDF.html">Maddrey score</a></li>
  <li><a href="MELD.html">MELD score</a></li>
  <li><a href="VocalPenn.html">VOCAL-Penn calculator</a></li>
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

/**********/
/** APRI **/
/**********/

function getApri(ast, astUln, platelets) {
  return ast / astUln / platelets
}

function getApriInterpretation(apri) {
  let interpretation = ''
  if (apri >= 2) {
	interpretation = 'F4 (46% sensitive, 91% specific)<br />F3-F4 (36% sensitive, 93% specific)'
  } else if (apri >= 1.5) {
	interpretation = 'F4 (76% sensitive, 72% specific)<br />F3-F4 (50% sensitive, 87% specific)'
  } else if (apri >= 1) {
	interpretation = 'F4 (76% sensitive, 72% specific)<br />F3-F4 (61% sensitive, 64% specific)<br />F2-F4 (62% sensitive, 45% specific)'
  } else if (apri >= 0.7) {
	interpretation = 'F2-F4 (77% sensitive, 72% specific)'
  } else {
	interpretation = 'F0-F1'
  }
  return interpretation
}

function calculateApri() {
  let ast = parseFloat(document.getElementById('ast').value) || -1;
  let astUln = parseFloat(document.getElementById('ast-uln').value) || -1;
  let platelets = parseFloat(document.getElementById('platelets').value) || -1;

  if (ast < 0 || astUln < 0 || platelets < 0) return setResult();

  let apri = getApri(ast, astUln, platelets)
  let apriInterpretation = getApriInterpretation(apri)

  setResult(`
	<ul>
	  <li>APRI: ${apri.toFixed(3)}
		<ul><li>${apriInterpretation}</li></ul>
	  </li>
	</ul>`)
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
	interpretation += '<br />(low accuracy in individuals aged <35)'
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
  let fib4Interpretation = getFib4Interpretation(fib4, age, isMasld)

  setResult(`
	<ul>
	  <li>Fib-4: ${fib4.toFixed(3)}
		<ul><li>${fib4Interpretation}</li></ul>
	  </li>
	</ul>`)
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
	<ul>
	  <li>Lille Score:</td><td>${lille.toFixed(3)}
		<ul><li>6-month survival:</td><td>${toPercent(lilleMortality)}</li></ul>
	  </li>
	</ul>`)
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
	<ul>
	  <li>Maddrey score: ${mdf.toFixed()}
		<ul><li>${mdfInterpretation}</li></ul>
	  </li>
	</ul>`)
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
  let isFemale = document.querySelector('input[name="sex"][value="female"]').checked
  let isRrt = document.querySelector('input[name="rrt"][value="yes"]').checked

  if ((creatinine < 0 && !isRrt) || bilirubin < 0 || inr < 0) return setResult()

  let meld = getMeld(creatinine, bilirubin, inr, isRrt)
  let meldMortality = getMeldMortality(meld)
  let meldNa = getMeldNa(creatinine, bilirubin, inr, sodium, isRrt)
  let meld3 = getMeld3(creatinine, bilirubin, inr, sodium, albumin, isRrt, isFemale)

  let html = `
	<ul>
	  <li>MELD: ${meld}
		<ul><li>90-day mortality: ${toPercent(meldMortality, 1)}</li></ul>
	  </li>`

  if (sodium >= 0)
	html += `<li>MELD-Na: ${meldNa}</li>`;

  if (sodium >= 0 && albumin >= 0)
	html += `
	  <li>MELD 3.0: ${meld3}
	  <ul>
		<li>15-day survival: ${toPercent(getMeld3Survival(meld3, 15), 1)}</li>
		<li>30-day survival: ${toPercent(getMeld3Survival(meld3, 30), 1)}</li>
		<li>45-day survival: ${toPercent(getMeld3Survival(meld3, 45), 1)}</li>
		<li>60-day survival: ${toPercent(getMeld3Survival(meld3, 60), 1)}</li>
		<li>75-day survival: ${toPercent(getMeld3Survival(meld3, 75), 1)}</li>
		<li>90-day survival: ${toPercent(getMeld3Survival(meld3, 90), 1)}</li>
	  </ul>
	  </li>`

  html += `</ul>`

  setResult(html);
}

/**********************/
/** VOCAL-Penn score **/
/**********************/

function getVocalPenn(age, albumin, bilirubin, platelets, isObese, isMasld, isEmergency, asa, surgeryType) {
  let surgeryTypeMap = { "abdominalLap": 0, "abdominalOpen": 1, "abdominalWall": 2,
						 "vascular": 3, "majorOrthopedic": 4, "chestCardiac": 5 }
  let surgeryTypeId = surgeryTypeMap[surgeryType]
  let albuminSp = ((albumin > 2.7 ? (albumin - 2.7) ** 3 : 0) -
				   ((albumin > 3.7 ? 1.7 * (albumin - 3.7) ** 3 : 0) -
					(albumin > 4.4 ? (albumin - 4.4) ** 3 : 0)) / 0.7
				  ) / 2.89
  let plateletSp = ((platelets > 74 ? (platelets - 74) ** 3 : 0) -
					((platelets > 153 ? 195 * (platelets - 153) ** 3 : 0) -
					 (platelets > 269 ? 79 * (platelets - 269) ** 3 : 0)) / 116
				   ) / 38025
  let bilirubinSp = ((bilirubin > 0.39 ? (bilirubin - 0.39) ** 3 : 0) -
					 ((bilirubin > 0.75 ? 1.41 * (bilirubin - 0.75) ** 3 : 0) -
					  (bilirubin > 1.8 ? 0.36 * (bilirubin - 1.8) ** 3 : 0)) / 1.05
					) / 1.9881
  let logodds30 = 1.061725 * asa - 5.472096 + (isEmergency ? 0.927904 : 0) + [0, 1.56071, 0.7418021, 0.9165415, 1.464183, 1.893621][surgeryTypeId] - 0.0075185 * platelets + 0.0036657 * plateletSp - 0.5181509 * albumin - 1.000672 * albuminSp + 0.1448936 * bilirubin - (isObese ? 0.7541669 : 0) + (isMasld ? 0.8268748 : 0)
  let logodds90 = 0.6891587 * asa - 7.381628 + (isEmergency ? 0.6246303 : 0) + 0.0365738 * age + [0, 1.349889, 0.2480613, 1.054497, 1.067452, 1.26527][surgeryTypeId] - 0.4851036 * albumin - 0.9821122 * albuminSp + (isMasld ? 0.82691 : 0)
  let logodds180 = 0.850114 * asa - 6.169259 + 0.0293034 * age + [0, 0.8838124, 0.197697, 0.4630691, 0.1229086, 0.4320639][surgeryTypeId] - 0.003719 * platelets - 0.0004196 * plateletSp - 0.4560354 * albumin - 0.4166421 * albuminSp - (isObese ? 0.5176601 : 0)
  let p30 = Math.exp(logodds30) / (1 + Math.exp(logodds30))
  let p90u = Math.exp(logodds90) / (1 + Math.exp(logodds90))
  let p90 = 1 - (1 - p30) * (1 - p90u)
  let p180 = 1 - (1 - p30) * (1 - p90u) * (1 - Math.exp(logodds180) / (1 + Math.exp(logodds180)))
  let logOddsDecomp = 0.2988972 * asa - 2.287235 + (isEmergency ? 0.5076108 : 0) + [0, 0.6117639, -0.1508734, -0.4641384, -0.3442967, -0.1648213][surgeryTypeId] - 0.0054196 * platelets + 0.0021578 * plateletSp - 0.4460345 * albumin - 0.4612017 * albuminSp + 1.361681 * bilirubin - 1.746094 * bilirubinSp - (isObese ? 0.1820302 : 0) + (isMasld ? 0.2481661 : 0) + 0.0069088 * age
  let pDecomp = Math.exp(logOddsDecomp) / (1 + Math.exp(logOddsDecomp))
  p30 = (p30 * 100).toFixed(1)
  p90 = (p90 * 100).toFixed(1)
  p180 = (p180 * 100).toFixed(1)
  pDecomp = (pDecomp * 100).toFixed(1)
  return [p30, p90, p180, pDecomp]
}

function calculateVocalPenn() {
  let age = parseFloat(document.getElementById('age').value) || -1;
  let albumin = parseFloat(document.getElementById('albumin').value) || -1;
  let bilirubin = parseFloat(document.getElementById('bilirubin').value) || -1;
  let platelets = parseFloat(document.getElementById('platelets').value) || -1;
  let isObese = document.querySelector('input[name="isObese"][value="yes"]').checked;
  let isMasld = document.querySelector('input[name="isMasld"][value="yes"]').checked;
  let isEmergency = document.querySelector('input[name="isEmergency"][value="yes"]').checked;
  let asa = document.querySelector('input[name="asa"]:checked').value;
  // let surgeryType = document.querySelector('input[name="surgeryType"]:checked').value;
  let surgeryType = document.getElementById('surgeryType').value;

  if (age < 0 || albumin < 0 || bilirubin < 0 || platelets < 0) return setResult()

  let vp = getVocalPenn(age, albumin, bilirubin, platelets, isObese, isMasld, isEmergency, asa, surgeryType)

  setResult(`
  <ul>
    <li>VOCAL-Penn score}
   <ul><li>30-day mortality risk: ${vp[0]}</li></ul>
   <ul><li>90-day mortality risk: ${vp[1]}</li></ul>
   <ul><li>180-day mortality risk: ${vp[2]}</li></ul>
   <ul><li>90-day decompensation risk: ${vp[3]}</li></ul>
    </li>
  </ul>`)
}
