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
  <li><a href="CPT.html">Child-Pugh-Turcotte</a></li>
  <li><a href="CLIF.html">CLIF-C OF/AD/ACLF</a></li>
  <li><a href="Fib-4.html">Fib-4</a></li>
  <li><a href="Lille.html">Lille model</a></li>
  <li><a href="MDF.html">Maddrey score</a></li>
  <li><a href="MayoPostop.html">Mayo post-operative risk calculator</a></li>
  <li><a href="MELD.html">MELD score</a></li>
  <li><a href="NFS.html">NAFLD fibrosis score</a></li>
  <li><a href="VocalPenn.html">VOCAL-Penn calculator</a></li>
</ul>`

document.querySelectorAll('input').forEach(input => {
  input.setAttribute('autocomplete', 'off');
});

/**********************/
/** Global Functions **/
/**********************/
function toPercent(p, decimals = 0) {
  return (p * 100).toFixed(decimals) + "%"
}

function setResult(html = '') {
  document.getElementById('result').innerHTML = html;
}

/**********/
/** APRI **/
/**********/

function getApri(ast, astUln, platelets) {
  return ast / astUln / platelets * 100
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
  return `<ul>
	  <li>APRI: ${apri.toFixed(3)}
		<ul><li>${interpretation}</li></ul>
	  </li>
	</ul>`
}

function calculateApri() {
  const ast = parseFloat(document.getElementById('ast').value) || -1;
  const astUln = parseFloat(document.getElementById('ast-uln').value) || -1;
  const platelets = parseFloat(document.getElementById('platelets').value) || -1;
  if (ast < 0 || astUln < 0 || platelets < 0) return setResult();
  const apri = getApri(ast, astUln, platelets)
  const interpretation = getApriInterpretation(apri)
  setResult(interpretation)
}

/*************************/
/** Child-Pugh-Turcotte **/
/*************************/

function getCpt(bilirubin, albumin, inr, ascites, encephalopathy) {
  return bilirubin + albumin + inr + ascites + encephalopathy
}

function getCptInterpretation(cpt) {
  const cptClass = (cpt <= 6 ? "A" : (cpt <= 9 ? "B" : "C"))
  return `
	<ul>
	  <li>Child-Pugh-Turcotte score: ${cpt} (class ${cptClass})</li>
	</ul>`
}

function calculateCpt() {
  const bilirubin = parseInt(document.querySelector('input[name="bilirubin"]:checked').value);
  const albumin = parseInt(document.querySelector('input[name="albumin"]:checked').value);
  const inr = parseInt(document.querySelector('input[name="inr"]:checked').value);
  const ascites = parseInt(document.querySelector('input[name="ascites"]:checked').value);
  const encephalopathy = parseInt(document.querySelector('input[name="encephalopathy"]:checked').value);
  const cpt = getCpt(bilirubin, albumin, inr, ascites, encephalopathy)
  const interpretation = getCptInterpretation(bilirubin + albumin + inr + ascites + encephalopathy)
  setResult(interpretation)
}

/***********/
/** Fib-4 **/
/***********/

function getFib4(age, platelets, ast, alt) {
  return (age * ast) / (platelets * Math.sqrt(alt))
}

function getFib4Interpretation(fib4, age, isMasld = true) {
  const uln = isMasld ? 2.67 : 3.25
  const lln = isMasld ? (age < 65 ? 1.3 : 2.0) : 1.45
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
  return `
	<ul>
	  <li>Fib-4: ${fib4.toFixed(3)}
		<ul><li>${interpretation}</li></ul>
	  </li>
	</ul>`
}

function calculateFib4() {
  const age = parseFloat(document.getElementById('age').value) || -1;
  const platelets = parseFloat(document.getElementById('platelets').value) || -1;
  const ast = parseFloat(document.getElementById('ast').value) || -1;
  const alt = parseFloat(document.getElementById('alt').value) || -1;
  const isMasld = document.querySelector('input[name="isMasld"][value="masld"]').checked;
  if (age < 0 || platelets < 0 || ast < 0 || alt < 0) return setResult();
  const fib4 = getFib4(age, platelets, ast, alt)
  const interpretation = getFib4Interpretation(fib4, age, isMasld)
  setResult(interpretation)
}

/*****************/
/** Lille model **/
/*****************/

function getLille(age, albumin, bilirubin0, bilirubin7, creatinine, pt) {
  const r = 3.19 - 0.101 * age
		+ 0.147 * albumin
		+ 0.0165 * (bilirubin0 - bilirubin7)
		- 0.206 * (creatinine > 1.3 ? 1 : 0)
		- 0.0065 * bilirubin0
		- 0.0096 * pt
  return Math.exp(-r) / (1 + Math.exp(-r))
}

function getLilleInterpretation(lille) {
  const lilleMortality = lille > 0.45 ? 0.25 : 0.85
  return `<ul>
	  <li>Lille Score:</td><td>${lille.toFixed(3)}
		<ul><li>6-month survival:</td><td>${toPercent(lilleMortality)}</li></ul>
	  </li>
	</ul>`
}

function calculateLille() {
  const age = parseFloat(document.getElementById('age').value) || -1;
  const albumin = parseFloat(document.getElementById('albumin').value) || -1;
  const bilirubin0 = parseFloat(document.getElementById('bilirubin0').value) || -1;
  const bilirubin7 = parseFloat(document.getElementById('bilirubin7').value) || -1;
  const creatinine = parseFloat(document.getElementById('creatinine').value) || -1;
  const pt = parseFloat(document.getElementById('pt').value) || -1;
  if (age < 0 || albumin < 0 || bilirubin0 < 0 || bilirubin7 < 0 || creatinine < 0 || pt < 0) return setResult()
  const lille = getLille(age, albumin, bilirubin0, bilirubin7, creatinine, pt)
  const interpretation = getLilleInterpretation(lille)
  setResult(interpretation)
}

/*******************/
/** Maddrey score **/
/*******************/

function getMdf(pt, ptRef, bilirubin) {
  return 4.6 * (pt - ptRef) + bilirubin
}

function getMdfInterpretation(mdf) {
  const interpretation = (mdf > 32 ? 'Poor' : 'Good') + ' prognosis'
  return `
	<ul>
	  <li>Maddrey score: ${mdf.toFixed()}
		<ul><li>${interpretation}</li></ul>
	  </li>
	</ul>`
}

function calculateMdf() {
  const pt = parseFloat(document.getElementById('pt').value) || -1;
  const ptRef = parseFloat(document.getElementById('pt-ref').value) || -1;
  const bilirubin = parseFloat(document.getElementById('bilirubin').value) || -1;
  if (pt < 0 || ptRef < 0 || bilirubin < 0) return setResult()
  const mdf = getMdf(pt, ptRef, bilirubin)
  const interpretation = getMdfInterpretation(mdf)
  setResult(interpretation)
}

/********************************************/
/** Mayo post-op mortality risk calculator **/
/********************************************/

function getMayoPostop(age, creatinine, bilirubin, inr, asa, isAlcoholCholestasis) {
  const meld = Math.max(Math.round(9.57 * Math.log(Math.max(creatinine, 1)) + 3.78 * Math.log(Math.max(bilirubin, 1)) + 11.2 * Math.log(Math.max(inr, 1)) + (isAlcoholCholestasis ? 0 : 6.43)), 8)
  const yd = Math.exp(0.02382 * (age - 60) + (asa > 3 ? 0.88884 : 0) + 0.11798 * (meld - 8))
  const yy = Math.exp(0.0266 * (age - 60) + (asa > 3 ? 0.58926 : 0) + 0.07430 * (meld - 8))
  return {
	p7d: 1 - Math.pow(0.98370, yd),
	p30d: 1 - Math.pow(0.93479, yd),
	p90d: 1 - Math.pow(0.89681, yd),
	p1y: 1 - Math.pow(0.76171, yy),
	p5y: 1 - Math.pow(0.47062, yy)
  }
}

function getMayoPostopInterpretation(mayo) {
  return `
	<ul>
	  <li>Mayo post-operative mortality risk:
		<ul><li>7-day mortality risk: ${toPercent(mayo.p7d, 2)}</li></ul>
		<ul><li>30-day mortality risk: ${toPercent(mayo.p30d, 2)}</li></ul>
		<ul><li>90-day mortality risk: ${toPercent(mayo.p90d, 2)}</li></ul>
		<ul><li>1-year mortality risk: ${toPercent(mayo.p1y, 2)}</li></ul>
		<ul><li>5-year mortality risk: ${toPercent(mayo.p5y, 2)}</li></ul>
	  </li>
	</ul>`
}

function calculateMayoPostop() {
  const age = parseFloat(document.getElementById('age').value) || -1;
  const creatinine = parseFloat(document.getElementById('creatinine').value) || -1;
  const bilirubin = parseFloat(document.getElementById('bilirubin').value) || -1;
  const inr = parseFloat(document.getElementById('inr').value) || -1;
  const asa = parseInt(document.querySelector('input[name="asa"]:checked').value);
  const isAlcoholCholestasis = document.querySelector('input[name="etiology"][value="alcoholCholestatis"]').checked
  if (age < 0 || creatinine < 0 || bilirubin < 0 || inr < 0) return setResult()
  const mayo = getMayoPostop(age, creatinine, bilirubin, inr, asa, isAlcoholCholestasis)
  const interpretation = getMayoPostopInterpretation(mayo)
  setResult(interpretation)
}

/****************/
/** MELD score **/
/****************/

function getMeld(creatinine, bilirubin, inr, isRrt) {
  if (isRrt) creatinine = 4.0
  const meld = 9.57 * Math.log(Math.max(creatinine, 1.0))
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
  const logBilirubin = Math.log(Math.max(bilirubin, 1.0))
  const logCreatinine = Math.log(Math.min(Math.max(creatinine, 1.0), 3.0))
  const logInr = Math.log(Math.max(inr, 1.0))
  const nSodium = 137 - Math.min(Math.max(sodium, 125), 137)
  const nAlbumin = 3.5 - Math.min(Math.max(albumin, 1.5), 3.5)
  const meld3 = (isFemale ? 1.33 : 0.0)
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
  const creatinine = parseFloat(document.getElementById('creatinine').value) || -1;
  const bilirubin = parseFloat(document.getElementById('bilirubin').value) || -1;
  const inr = parseFloat(document.getElementById('inr').value) || -1;
  const sodium = parseFloat(document.getElementById('sodium').value) || -1;
  const albumin = parseFloat(document.getElementById('albumin').value) || -1;
  const isFemale = document.querySelector('input[name="sex"][value="female"]').checked
  const isRrt = document.querySelector('input[name="rrt"][value="yes"]').checked

  if ((creatinine < 0 && !isRrt) || bilirubin < 0 || inr < 0) return setResult()

  const meld = getMeld(creatinine, bilirubin, inr, isRrt)
  const meldMortality = getMeldMortality(meld)
  const meldNa = getMeldNa(creatinine, bilirubin, inr, sodium, isRrt)
  const meld3 = getMeld3(creatinine, bilirubin, inr, sodium, albumin, isRrt, isFemale)

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

/**************************/
/** NAFLD fibrosis score **/
/**************************/

function getNfs(age, bmi, ast, alt, platelets, albumin, isIfg) {
  return -1.675 + 0.037 * age + 0.094 * bmi + (isIfg ? 1.13 : 0) + 0.99 * ast / alt - 0.013 * platelets - 0.66 * albumin
}

function getNfsInterpretation(nfs) {
  const interpretation = (nfs < -1.455 ? "F0-F2" : (nfs > 0.675 ? "F3-F4" : "indeterminate"))
  return `
	<ul>
	  <li>NAFLD fibrosis score: ${nfs.toFixed(3)}
		<ul><li>${interpretation}</li></ul>
	  </li>
	</ul>`
}

function calculateNfs() {
  const age = parseFloat(document.getElementById('age').value) || -1;
  const bmi = parseFloat(document.getElementById('bmi').value) || -1;
  const ast = parseFloat(document.getElementById('ast').value) || -1;
  const alt = parseFloat(document.getElementById('alt').value) || -1;
  const platelets = parseFloat(document.getElementById('platelets').value) || -1;
  const albumin = parseFloat(document.getElementById('albumin').value) || -1;
  const isIfg = document.querySelector('input[name="ifg"][value="yes"]').checked
  if (age < 0 || bmi < 0 || ast < 0 || alt < 0 || platelets < 0 || albumin < 0) return setResult()
  const nfs = getNfs(age, bmi, ast, alt, platelets, albumin, isIfg)
  const interpretation = getNfsInterpretation(nfs)
  setResult(interpretation)
}

/**********************/
/** VOCAL-Penn score **/
/**********************/

function getVocalPenn(age, albumin, bilirubin, platelets, isObese, isMasld, isEmergency, asa, surgeryType) {
  const surgeryTypeMap = { "abdominalLap": 0, "abdominalOpen": 1, "abdominalWall": 2,
						   "vascular": 3, "majorOrthopedic": 4, "chestCardiac": 5 }
  const surgeryTypeId = surgeryTypeMap[surgeryType]
  const albuminSp = ((albumin > 2.7 ? (albumin - 2.7) ** 3 : 0) -
					 ((albumin > 3.7 ? 1.7 * (albumin - 3.7) ** 3 : 0) -
					  (albumin > 4.4 ? (albumin - 4.4) ** 3 : 0)) / 0.7
					) / 2.89
  const plateletSp = ((platelets > 74 ? (platelets - 74) ** 3 : 0) -
					  ((platelets > 153 ? 195 * (platelets - 153) ** 3 : 0) -
					   (platelets > 269 ? 79 * (platelets - 269) ** 3 : 0)) / 116
					 ) / 38025
  const bilirubinSp = ((bilirubin > 0.39 ? (bilirubin - 0.39) ** 3 : 0) -
					   ((bilirubin > 0.75 ? 1.41 * (bilirubin - 0.75) ** 3 : 0) -
						(bilirubin > 1.8 ? 0.36 * (bilirubin - 1.8) ** 3 : 0)) / 1.05
					  ) / 1.9881
  const logodds30 = 1.061725 * asa - 5.472096 + (isEmergency ? 0.927904 : 0) + [0, 1.56071, 0.7418021, 0.9165415, 1.464183, 1.893621][surgeryTypeId] - 0.0075185 * platelets + 0.0036657 * plateletSp - 0.5181509 * albumin - 1.000672 * albuminSp + 0.1448936 * bilirubin - (isObese ? 0.7541669 : 0) + (isMasld ? 0.8268748 : 0)
  const logodds90 = 0.6891587 * asa - 7.381628 + (isEmergency ? 0.6246303 : 0) + 0.0365738 * age + [0, 1.349889, 0.2480613, 1.054497, 1.067452, 1.26527][surgeryTypeId] - 0.4851036 * albumin - 0.9821122 * albuminSp + (isMasld ? 0.82691 : 0)
  const logodds180 = 0.850114 * asa - 6.169259 + 0.0293034 * age + [0, 0.8838124, 0.197697, 0.4630691, 0.1229086, 0.4320639][surgeryTypeId] - 0.003719 * platelets - 0.0004196 * plateletSp - 0.4560354 * albumin - 0.4166421 * albuminSp - (isObese ? 0.5176601 : 0)
  const p30 = Math.exp(logodds30) / (1 + Math.exp(logodds30))
  const p90u = Math.exp(logodds90) / (1 + Math.exp(logodds90))
  const p90 = 1 - (1 - p30) * (1 - p90u)
  const p180 = 1 - (1 - p30) * (1 - p90u) * (1 - Math.exp(logodds180) / (1 + Math.exp(logodds180)))
  const logOddsDecomp = 0.2988972 * asa - 2.287235 + (isEmergency ? 0.5076108 : 0) + [0, 0.6117639, -0.1508734, -0.4641384, -0.3442967, -0.1648213][surgeryTypeId] - 0.0054196 * platelets + 0.0021578 * plateletSp - 0.4460345 * albumin - 0.4612017 * albuminSp + 1.361681 * bilirubin - 1.746094 * bilirubinSp - (isObese ? 0.1820302 : 0) + (isMasld ? 0.2481661 : 0) + 0.0069088 * age
  const pDecomp = Math.exp(logOddsDecomp) / (1 + Math.exp(logOddsDecomp))
  return {
	p30: p30,
	p90: p90,
	p180: p180,
	pDecomp: pDecomp
  }
}

function getVocalPennInterpretation(vp) {
  return `
  <ul>
    <li>VOCAL-Penn postoperative mortality risk:
      <ul><li>30-day mortality risk: ${toPercent(vp.p30, 1)}</li></ul>
      <ul><li>90-day mortality risk: ${toPercent(vp.p90, 1)}</li></ul>
      <ul><li>180-day mortality risk: ${toPercent(vp.p180, 1)}</li></ul>
      <ul><li>90-day decompensation risk: ${toPercent(vp.pDecomp, 1)}</li></ul>
    </li>
  </ul>`
}

function calculateVocalPenn() {
  const age = parseFloat(document.getElementById('age').value) || -1;
  const albumin = parseFloat(document.getElementById('albumin').value) || -1;
  const bilirubin = parseFloat(document.getElementById('bilirubin').value) || -1;
  const platelets = parseFloat(document.getElementById('platelets').value) || -1;
  const isObese = document.querySelector('input[name="isObese"][value="yes"]').checked;
  const isMasld = document.querySelector('input[name="isMasld"][value="yes"]').checked;
  const isEmergency = document.querySelector('input[name="isEmergency"][value="yes"]').checked;
  const asa = document.querySelector('input[name="asa"]:checked').value;
  const surgeryType = document.getElementById('surgeryType').value;
  if (age < 0 || albumin < 0 || bilirubin < 0 || platelets < 0) return setResult()
  const vp = getVocalPenn(age, albumin, bilirubin, platelets, isObese, isMasld, isEmergency, asa, surgeryType)
  const interpretation = getVocalPennInterpretation(vp)
  setResult(interpretation)
}

/******************/
/** CLIF-OF/AD/C **/
/******************/

function getClif(bilirubin, creatinine, isRrt, brain, inr, circulatory, respiratory, age, wbc, sodium) {
  var clif = {
	liver: bilirubin >= 12 ? 3 : (bilirubin >= 6 ? 2 : 1),
	kidney: (isRrt || creatinine >= 3.5) ? 3 : (creatinine >= 2 ? 2 : 1),
	brain: brain,
	coagulation: inr >= 2.5 ? 3 : (inr >= 2.0 ? 2 : 1),
	circulatory: circulatory,
	respiratory: respiratory,
	aclfGrade: '',
	adAclfScore: -1,
	p1: -1, p3: -1, p6: -1, p12: -1
  }
  clif.ofScore = clif.liver + clif.kidney + clif.brain + clif.coagulation + clif.circulatory + clif.respiratory
  clif.liverFailure = clif.liver >= 3
  clif.kidneyFailure = clif.kidney >= 2
  clif.brainFailure = clif.brain >= 3
  clif.coagulationFailure = clif.coagulation >= 3
  clif.circulatoryFailure = clif.circulatory >= 3
  clif.respiratoryFailure = clif.respiratory >= 3
  clif.ofCount = (clif.liverFailure ? 1 : 0) +
	(clif.kidneyFailure ? 1 : 0) +
	(clif.brainFailure ? 1 : 0) +
	(clif.coagulationFailure ? 1 : 0) +
	(clif.circulatoryFailure ? 1 : 0) +
	(clif.respiratoryFailure ? 1 : 0)
  if (clif.ofCount > 3)
	clif.aclfGrade = '3b'
  else if (clif.ofCount == 3)
	clif.aclfGrade = '3a'
  else if (clif.ofCount == 2)
	clif.aclfGrade = '2'
  else if (clif.ofCount == 1 && clif.kidneyFailure)
	clif.aclfGrade = '1a'
  else if (clif.ofCount == 1 && (creatinine >= 1.5 || clif.brain == 2))
	clif.aclfGrade = '1b'
  if (clif.aclfGrade != '') {
	if (age > 0 && wbc > 0) { // Calculate CLIF-C ACLF score
	  clif.adAclfScore = 10 * (0.33 * clif.ofScore + 0.04 * age + 0.63 * Math.log(wbc) - 2)
	  clif.p1 = 1 - Math.exp(-0.0022 * Math.exp(0.0995 * clif.adAclfScore))
	  clif.p3 = 1 - Math.exp(-0.0079 * Math.exp(0.0869 * clif.adAclfScore))
	  clif.p6 = 1 - Math.exp(-0.0115 * Math.exp(0.0824 * clif.adAclfScore))
	  clif.p12 = 1 - Math.exp(-0.0231 * Math.exp(0.0731 * clif.adAclfScore))

	}
  } else {
	if (age > 0 && wbc > 0 & sodium > 0) { // Calculate CLIF-C AD score
	  clif.adAclfScore = 10 * (0.03 * age + 0.66 * Math.log(creatinine) + 1.71 * Math.log(inr) + 0.88 * Math.log(wbc) - 0.05 * sodium + 8)
	  clif.p1 = 1 - Math.exp(-0.00012 * Math.exp(0.1083 * clif.adAclfScore))
	  clif.p3 = 1 - Math.exp(-0.00056 * Math.exp(0.1007 * clif.adAclfScore))
	  clif.p6 = 1 - Math.exp(-0.00173 * Math.exp(0.0889 * clif.adAclfScore))
	  clif.p12 = 1 - Math.exp(-0.00879 * Math.exp(0.0698 * clif.adAclfScore))
	}
  }
  return clif
}

function getClifInterpretation(clif) {
  let html = `
	<ul>
	  <li>CLIF-C OF score: ${clif.ofScore} (${clif.ofCount} organ failure${clif.ofCount == 1 ? "" : "s"})
        <ul><li>
        <table>
          <tr><td>Liver score: ${clif.liver}</td><td>Liver failure: ${clif.liverFailure ? "Yes" : "No"}</td></tr>
          <tr><td>Kidney score: ${clif.kidney}</td><td>Kidney failure: ${clif.kidneyFailure ? "Yes" : "No"}</td></tr>
          <tr><td>Brain score: ${clif.brain}</td><td>Brain failure: ${clif.brainFailure ? "Yes" : "No"}</td></tr>
          <tr><td>Coagulation score: ${clif.coagulation}</td><td>Coagulation failure: ${clif.coagulationFailure ? "Yes" : "No"}</td></tr>
          <tr><td>Circulatory score: ${clif.circulatory}</td><td>Circulatory failure: ${clif.circulatoryFailure ? "Yes" : "No"}</td></tr>
          <tr><td>Respiratory score: ${clif.respiratory}</td><td>Respiratory failure: ${clif.respiratoryFailure ? "Yes" : "No"}</td></tr>
        </table>
        </li></ul>
      </li>`
  html += `<li>${clif.aclfGrade == '' ? 'No ACLF' : ('ACLF grade ' + clif.aclfGrade)}</li>`
  if (clif.adAclfScore >= 0) {
	html += `
      <li>CLIF-C ${clif.aclfGrade == '' ? 'AD' : 'ACLF'} Score: ${clif.adAclfScore.toFixed()}
        <ul>
          <li>1-month mortality: ${toPercent(clif.p1, 1)}</li>
          <li>3-month mortality: ${toPercent(clif.p3, 1)}</li>
          <li>6-month mortality: ${toPercent(clif.p6, 1)}</li>
          <li>12-month mortality: ${toPercent(clif.p12, 1)}</li>
        </ul>
      </li>`
  }
  html += `</ul>`
  return html
}

function calculateClif() {
  const bilirubin = parseFloat(document.getElementById('bilirubin').value) || -1;
  const creatinine = parseFloat(document.getElementById('creatinine').value) || -1;
  const isRrt = document.querySelector('input[name="rrt"][value="yes"]').checked
  const brain = parseInt(document.querySelector('input[name="brain"]:checked').value);
  const inr = parseFloat(document.getElementById('inr').value) || -1;
  const circulatory = parseInt(document.querySelector('input[name="circulatory"]:checked').value);
  const respiratory = parseInt(document.querySelector('input[name="respiratory"]:checked').value);
  const age = parseFloat(document.getElementById('age').value) || -1;
  const wbc = parseFloat(document.getElementById('wbc').value) || -1;
  const sodium = parseFloat(document.getElementById('sodium').value) || -1;
  if ((creatinine < 0 && !isRrt) || bilirubin < 0 || inr < 0) return setResult()
  const clif = getClif(bilirubin, creatinine, isRrt, brain, inr, circulatory, respiratory, age, wbc, sodium)
  const interpretation = getClifInterpretation(clif)
  setResult(interpretation)
}

/*******************/
/** HCV Treatment **/
/*******************/

function getHcv(genotype, cirrhosis, priorTreatment) {
  let recs = [], alt = [];
  switch(genotype) {
  case '1a':
	if (cirrhosis == 'noCirrhosis') {
	  recs = [[ 'glecaprevir/pibrentasvir', 8, 'I A' ],
			  [ 'ledipasvir/sofosbuvir', 12, 'I A' ],
			  [ 'ledipasvir/sofosbuvir', 8, 'I B', 'HIV-uninfected and HCV RNA <6 million IU/mL' ],
			  [ 'sofosbuvir/velpatasvir', 12, 'I A' ]];
	  alt = [[ 'elbasvir/grazoprevir', 12, 'I A' ]]
	} else if (cirrhosis == 'compensated') {
	  recs = [[ 'sofosbuvir/velpatasvir', 12, 'IA' ],
			  [ 'glecaprevir/pibrentasvir', 8, 'IB', 'HIV/HCV coinfection -> 12 w' ],
			  [ 'ledipasvir/sofosbuvir', 12, 'IA' ]]
	  alt = [[ 'elbasvir/grazoprevir', 12, 'IA' ]]
	}
	break;
  case '1b':
	if (cirrhosis == 'noCirrhosis') {
	  recs = [[ 'glecaprevir/pibrentasvir', 8, 'IA' ],
			  [ 'sofosbuvir/velpatasvir', 12, 'IA' ],
			  [ 'elbasvir/grazoprevir', 12, 'IA', 'mild fibrosis (TE-LS <9.5 or Fibrotest® < 0.59) -> consider 8 w' ],
			  [ 'ledipasvir/sofosbuvir', 12, 'IA' ],
			  [ 'ledipasvir/sofosbuvir', 8, 'IB', 'HIV/HCV coinfection -> 12 w' ]]
	} else if (cirrhosis == 'compensated') {
	  recs = [[ 'sofosbuvir/velpatasvir', 12, 'IA' ],
			  [ 'glecaprevir/pibrentasvir', 8, 'IB', 'HIV/HCV coinfection -> 12 w' ],
			  [ 'elbasvir/grazoprevir', 12, 'IA' ],
			  [ 'ledipasvir/sofosbuvir', 12, 'IA' ]]
	}
	break;
  case '2':
	if (cirrhosis == 'noCirrhosis') {
	  recs = [[ 'glecaprevir/pibrentasvir', 8, 'IA' ],
			  [ 'sofosbuvir/velpatasvir', 12, 'IA' ]]
	} else if (cirrhosis == 'compensated') {
	  recs = [[ 'sofosbuvir/velpatasvir', 12, 'IA' ],
			  [ 'glecaprevir/pibrentasvir', 8, 'IB', 'HIV/HCV coinfection -> 12 w' ]]
	}
	break;
  case '3':
	if (cirrhosis == 'noCirrhosis') {
	  recs = [[ 'glecaprevir/pibrentasvir', 8, 'IA' ],
			  [ 'sofosbuvir/velpatasvir', 12, 'IA' ]]
	} else if (cirrhosis == 'compensated') {
	  recs = [[ 'sofosbuvir/velpatasvir', 12, 'IA', 'w/o baseline NS5A RAS Y93H for velpatasvir' ],
			  [ 'glecaprevir/pibrentasvir', 8, 'IB', 'HIV/HCV coinfection -> 12 w' ]]
	  alt = [[ 'sofosbuvir/velpatasvir + RBV', 12, 'IIaA', 'with baseline NS5A RAS Y93H for velpatasvir' ],
			 [ 'sofosbuvir/velpatasvir/voxilaprevir', 12, 'IIaB', 'with baseline NS5A RAS Y93H for velpatasvir' ]]
	}
	break;
  case '4':
	if (cirrhosis == 'noCirrhosis') {
	  recs = [[ 'glecaprevir/pibrentasvir', 8, 'IA' ],
			  [ 'sofosbuvir/velpatasvir', 12, 'IA' ],
			  [ 'elbasvir/grazoprevir', 12, 'IA' ],
			  [ 'ledipasvir/sofosbuvir', 12, 'IA', 'no cirrhosis, HCV RNA <6 million IU/mL, absence of genotype 4r -> consider 8 w' ]]
	} else if (cirrhosis == 'compensated') {
	  recs = [[ 'sofosbuvir/velpatasvir', 12, 'IA' ],
			  [ 'glecaprevir/pibrentasvir', 8, 'IB', 'HIV/HCV coinfection -> 12 w' ],
			  [ 'elbasvir/grazoprevir', 12, 'IIaB' ],
			  [ 'ledipasvir/sofosbuvir', 12, 'IIaB' ]]
	}
	break;
  case '5', '6':
	if (cirrhosis == 'noCirrhosis') {
	  recs = [[ 'glecaprevir/pibrentasvir', 8, 'IA', 'HIV/HCV coinfection -> 12 w' ],
			  [ 'sofosbuvir/velpatasvir', 12, 'IB' ],
			  [ 'ledipasvir/sofosbuvir', 12, 'IIaB', 'not recommended for genotype 6e' ]]
	} else if (cirrhosis == 'compensated') {
	  recs = [[ 'glecaprevir/pibrentasvir', 8, 'IB', 'HIV/HCV coinfection -> 12 w' ],
			  [ 'sofosbuvir/velpatasvir', 12, 'IB' ],
			  [ 'ledipasvir/sofosbuvir', 12, 'IIaB', 'not recommended for genotype 6e' ]]
	}
	break;
  }
}

function calculateHcv() {
  const genotype = parseInt(document.querySelector('input[name="genotype"]:checked').value);
  const cirrhosis = parseInt(document.querySelector('input[name="cirrhosis"]:checked').value);
  const priorTreatment = parseInt(document.querySelector('input[name="priorTreatment"]:checked').value);
  setResult(getHcv(genotype, cirrhosis, priorTreatment))
}
