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
		<li><a href="ARM.html">Anorectal manometry</a></li>
		<li><a href="HREM.html">Esophageal manometry</a></li>
		<li><a href="pH.html">Wireless pH monitoring</a></li>
		<li><a href="pHZ.html">Catheter-based pH/impedance monitoring</a></li>
	  </ul>`


/*******************************/
/** Report Creation Functions **/
/*******************************/

function createArmReport() {
	document.activeElement.blur();
	// Get input data
	const female = document.querySelector('input[name="gender"][value="female"]').checked;
	const resting = parseFloat(document.getElementById('resting').value) || 0.0;
	const squeeze = parseFloat(document.getElementById('squeeze').value) || 0.0;
    const analRelaxation = parseInt(document.getElementById('analRelaxation').value) || 0;
	const rectalPressure = parseFloat(document.getElementById('rectalPressure').value) || 0.0;

 	const first = parseInt(document.getElementById('first').value) || 0;
    const urge = parseInt(document.getElementById('urge').value) || 0;
    const discomfort = parseInt(document.getElementById('discomfort').value) || 0;

	const rair = document.querySelector('input[name="rair"][value="present"]').checked;
	const cough = document.querySelector('input[name="cough"][value="present"]').checked;
	const defects = document.querySelector('input[name="defects"][value="present"]').checked;

	const betDone = !document.querySelector('input[name="bet"][value="notDone"]').checked;
	const betPassed = document.querySelector('input[name="bet"][value="passed"]').checked;
	const betM = parseInt(document.getElementById('betM').value) || 0;
 	const betS = parseInt(document.getElementById('betS').value) || 0;
	const betTime = (betM == 0 ? "" : betM + " minute" + (betM == 1 ? "" : "s"))
		  + (betM > 0 && betS > 0 ? " and " : "")
		  + (betM == 0 || betS == 0 ? "" : betS + " second" + (betS == 1 ? "" : "s"));

	const restingL = (female ? 71 : 89)
	const restingU = (female ? 81 : 96)
	const squeezeL = (female ? 186 : 245)
	const squeezeU = (female ? 224 : 287)
	const analRelaxationL = 0; const analRelaxationU = 20;
	const rectalPressureL = 40;
	const firstL = (female ? 21 : 20)
	const firstU = (female ? 26 : 25)
	const urgeL = (female ? 79 : 82)
	const urgeU = (female ? 96 : 103)
	const discomfortL = (female ? 182 : 192)
	const discomfortU = (female ? 204 : 222)

	const ias = (resting < restingL ? -1 : (resting > restingU ? 1 : 0));
	const eas = (squeeze < squeezeL ? -1 : (squeeze > squeezeU ? 1 : 0));
	let dd = 0;
	if (analRelaxation <= analRelaxationL && rectalPressure >= rectalPressureL)
		dd = 1;
	else if (analRelaxation <= analRelaxationL && rectalPressure < rectalPressureL)
		dd = 2;
	else if (analRelaxation <= analRelaxationU && rectalPressure >= rectalPressureL)
		dd = 3;
	else if (analRelaxation <= analRelaxationU && rectalPressure < rectalPressureL)
		dd = 4;
	else if (analRelaxation > analRelaxationU && rectalPressure < rectalPressureL)
		dd = 5;
	const sens1 = (first < firstL ? -1 : (first > firstU ? 1 : 0))
	const sens2 = (urge < urgeL ? -1 : (urge > urgeU ? 1 : 0))
	const sens3 = (discomfort < discomfortL ? -1 : (discomfort > discomfortU ? 1 : 0))

	// Build interpretation
	let report = "Interpretation / Findings\n"
		+ "1. " + (ias == -1 ? "Weak" : (ias == 1 ? "Elevated" : "Normal")) + " resting pressure with "
		+ (eas == -1 ? "an inadequate" : (eas == 1 ? "an elevated" : "a normal")) + " squeeze pressure.\n"
		+ "2. "
	switch (dd) {
	case 1: report += "Paradoxical contraction of anal sphincter muscles"; break;
	case 2: report += "Paradoxical contraction of anal sphincter muscles and inadequate intrarectal pressure"; break;
	case 3: report += "Inadequate relaxation of anal sphincter muscles"; break;
	case 4: report += "Inadequate relaxation of anal sphincter muscles and inadequate intrarectal pressure"; break;
	case 5: report += "Normal relaxation of anal sphincter muscles and inadequate intrarectal pressure"; break;
	case 0: report += "Normal relaxation of anal sphincter muscles"; break;
	}
	report += " during defecation maneuver.\n"
		+ "3. RAIR " + (rair ? "present.\n" : "absent.\n")
		+ "4. Cough reflex " + (cough ? "present.\n" : "absent.\n")
		+ "5. " + (defects ? "Sphincter defect noted" : "No sphincter defects") + " on 3D reconstruction images.\n"
		+ "6. ";

	if (sens1 == sens2 && sens2 == sens3)
		report += (sens1 == -1 ? "Low" : (sens1 == 1 ? "Elevated" : "Normal")) + " first sensation, urge, and discomfort volumes.\n";
	else if (sens1 == sens2)
		report += (sens1 == -1 ? "Low" : (sens1 == 1 ? "Elevated" : "Normal")) + " first sensation and urge volumes; "
		+ (sens3 == -1 ? "low" : (sens3 == 1 ? "elevated" : "normal")) + " discomfort volume.\n";
	else if (sens2 == sens3)
		report += (sens1 == -1 ? "Low" : (sens1 == 1 ? "Elevated" : "Normal")) + " first sensation volume; "
		+ (sens3 == -1 ? "low" : (sens3 == 1 ? "elevated" : "normal")) + " urge and discomfort volumes.\n";
	else
		report += (sens1 == -1 ? "Low" : (sens1 == 1 ? "Elevated" : "Normal")) + " first sensation volume, "
		+ (sens2 == -1 ? "low" : (sens2 == 1 ? "elevated" : "normal")) + " urge volume, and ";
		+ (sens3 == -1 ? "low" : (sens3 == 1 ? "elevated" : "normal")) + " discomfort volume.\n";

	if (betDone)
		report += "7. Balloon " + (betPassed ? "expelled at " : "not expelled by ") + betTime + ".\n";

	// Build impression
	let i = 0;
	report += "\nImpressions\n";
	if (!rair) report += ++i + ". Rectoanal areflexia.\n";
	if (ias == 1)
		report += ++i + ". Anal hypertension.\n";
	else if (ias + eas == -2)
		report += ++i + ". Combined anal hypotension and hypocontractility (weak internal and external anal sphincters).\n";
	else if (ias == -1)
		report += ++i + ". Anal hypotension with normal contractility (weak internal anal sphincter).\n";
	else if (eas == -1)
		report += ++i + ". Anal normotension with hypocontractility (weak external anal sphincter).\n";
	if (!betDone) {
		report += (dd == 5 ? ++i + ". Poor propulsion.\n"
				   : (dd >= 1 ? ++i + ". Abnormal manometric pattern of rectoanal coordination (dyssynergic defecation type " + dd + ").\n" : ""));
	} else if (betPassed) {
		report += (dd >= 1 ? ++i + ". Normal expulsion with abnormal manometric pattern of rectoanal coordination.\n" : "");
	} else {
		switch (dd) {
		case 2: case 4: report += ++i + ". Abnormal expulsion with poor propulsion and dyssynergia (dyssynergic defecation type " + dd + ")\n"; break;
		case 1: case 3: report += ++i + ". Abnormal expulsion with dyssynergia (dyssynergic defecation type " + dd + ")\n"; break;
		case 5: report += ++i + ". Abnormal expulsion with poor propulsion.\n"; break;
		default: report += ++i + ". Abnormal expulsion with normal manometric pattern of rectoanal coordination.\n"; break;
		}
	}
	if (sens1 == -1 || sens2 == -1 || sens3 == -1)
		report += ++i + ". Rectal hypersensitivity.\n";
	else if (sens1 + sens2 + sens3 >= 1)
		report += ++i + (sens1 + sens2 + sens3 == 1 ? ". Borderline r" : ". R") + "ectal hyposensitivity.\n";
	if (i == 0)
		report += "1. Unremarkable anorectal manometry.\n";

	document.getElementById('report').value = report;
	navigator.clipboard.writeText(report);
}

function createHremReport() {
	document.activeElement.blur();
    var supine = parseInt(document.getElementById('supine').value) || 0;
	var upright = parseInt(document.getElementById('upright').value) || 0;

	var uesPressure = parseFloat(document.getElementById('uesPressure').value) || 0.0;
    var uesIRP = parseFloat(document.getElementById('uesIRP').value) || 0.0;
    var lesPressure = parseFloat(document.getElementById('lesPressure').value) || 0.0;
    var lesIRPsupine = parseFloat(document.getElementById('lesIRPsupine').value) || 0.0;
    var lesIRPupright = parseFloat(document.getElementById('lesIRPupright').value) || 0.0;
	var uesPressureL = 34; var uesPressureU = 104;
	var uesIRPU = 12;
	var lesPressureL = 13; var lesPressureU = 43;
	var lesIRPsupineU = 15; var lesIRPuprightU = 12;

	var failed = parseFloat(document.getElementById('failed').value) || 0.0;
    var weak = parseFloat(document.getElementById('weak').value) || 0.0;
    var panesophageal = parseFloat(document.getElementById('panesophageal').value) || 0.0;
    var premature = parseFloat(document.getElementById('premature').value) || 0.0;
    var fragmented = parseFloat(document.getElementById('fragmented').value) || 0.0;
    var ineffective = weak + fragmented;
    var intact = parseFloat(document.getElementById('intact').value) || 0.0;
    var hypercontractile = (parseInt(document.getElementById('hypercontractile').value) || 0) * 100 / supine;
	var weakU = 70; var failedU = 50;

    var ibp = (parseInt(document.getElementById('ibp').value) || 0) * 100 / supine;
    var dci = parseFloat(document.getElementById('dci').value) || 0.0;
    var ibc = parseFloat(document.getElementById('ibc').value) || 0.0;
    var hh = parseFloat(document.getElementById('hh').value) || 0.0;
	var ibpU = 20;

	var mrsBody = document.getElementsByName('mrsBody')[0].checked;
	var mrsLes = document.getElementsByName('mrsLes')[0].checked;
	var mrsPep = document.getElementsByName('mrsPep')[0].checked;
	var mrsAug = document.getElementsByName('mrsAug')[0].checked;

	var rdcBody = document.getElementsByName('rdcBody')[0].checked;
	var rdcLes = document.getElementsByName('rdcLes')[0].checked;
	var rdcPep = document.getElementsByName('rdcPep')[0].checked;
	var rdcShort = document.getElementsByName('rdcShort')[0].checked;

	var subtypes = document.getElementsByName('subtypes')[0].checked;

	var diagnosis = 0; // Normal
	var egjooSubtype = 0; // EGJOO with no evidence of disordered peristalsis
	if (lesIRPsupine >= lesIRPsupineU && lesIRPupright >= lesIRPuprightU && ibp >= ibpU) {
		if (failed == 100) {
			diagnosis = 1; // Achalasia type 1
			if (panesophageal >= 20)
				diagnosis = 2; // Achalasia type 2
			else if (premature >= 20)
				diagnosis = 3; // Achalasia type 3
		} else {
			diagnosis = 4; // EGJ outflow obstruction
			if (premature >= 20)
				egjooSubtype = 1; // EGJOO with spastic features
			else if (hypercontractile >= 20)
				egjooSubtype = 2; // EGJOO with hypercontractile features
			else if (ineffective >= 70 || failed >= 50)
				egjooSubtype = 3; // EGJOO with ineffective motility
		}
	} else {
		if (failed == 100)
			diagnosis = 5; // Absent contractility
		else if (premature >= 20)
			diagnosis = 6; // Distal esophageal spasm
		else if (hypercontractile >= 20)
			diagnosis = 7; // Hypercontractile esophagus
		else if (ineffective >= 70 || failed >= 50)
			diagnosis = 8; // Ineffective esophageal motility
	}

	var i = 0;
	var report = "Interpretation / Findings\n"
		+ ++i + ". " + (uesPressure < uesPressureL ? "Hypo" : (uesPressure > uesPressureU ? "Hyper" : "Normo"))
		+ "tensive UES with " + (uesIRP < uesIRPU ? "" : "in") + "adequate relaxation.\n"
		+ ++i + ". " + (lesPressure < lesPressureL ? "Hypo" : (lesPressure > lesPressureU ? "Hyper" : "Normo")) + "tensive LES with ";

	if (lesIRPsupine < lesIRPsupineU) {
		report += "adequate relaxation while supine " + (lesIRPupright < lesIRPuprightU ? "and upright.\n" : "although elevated IRP while upright.\n");
	} else {
		if (lesIRPupright < lesIRPuprightU)
			report += "elevated IRP while supine which normalizes while upright.\n"
		else
			report += "inadequate relaxation while supine and upright"
			+ (ibp < ibpU ? ", likely artifactual in absence of intrabolus pressurization.\n"
			   : " with intrabolus pressurization in " + ibp.toFixed(1) + "% of swallows.\n");
	}
	switch (diagnosis) {
	case 0:
	case 4: report += ++i + ". Normal peristalsis with " + (intact < 100 ? "most" : "all") + " swallows with a mean DCI of " + dci.toFixed(1) + " mmHg·cm·s.\n"; break;
	case 1:
	case 5: report += ++i + ". 100% failed peristalsis.\n"; break;
	case 2: report += ++i + ". 100% failed peristalsis with panesophageal pressurization in " + panesophageal.toFixed(1) + "% of swallows.\n"; break;
	case 3: report += ++i + ". 100% failed peristalsis with premature/spastic contractions in " + premature.toFixed(1) + "% of swallows.\n"; break;
	case 6: report += ++i + ". Frequent premature contractions in " + premature.toFixed(1) + "% of swallows with a mean DCI of " + dci.toFixed(1) + " mmHg·cm·s.\n"; break;
	case 7: report += ++i + ". Frequent hypercontractile peristalsis in " + hypercontractile.toFixed(1) + "% of supine swallows with a mean DCI of " + dci.toFixed(1) + " mmHg·cm·s.\n"; break;
	case 8:
		report += ++i + ". Frequent " + (failed >= 50 ? "failed" : "ineffective") + " peristalsis in " + (failed >= 50 ? failed : ineffective).toFixed(1) + "% of swallows.\n";
		break;
	}
	report += ++i + ". " + (ibc > 0 ? "Inc" : "C") + "omplete bolus clearance achieved with " + (ibc < 100 ? ibc.toFixed(1) + "%" : "all") + " swallows.\n"
		+ ++i + ". " + (mrsBody && mrsLes && !mrsPep && mrsAug ? "N" : "Abn") + "ormal multiple rapid swallows (MRS) maneuver with"
		+ (mrsBody ? "" : "out") + " deglutitive inhibition of esophageal body, with"
		+ (mrsLes ? "" : "out") + " deglutitive inhibition of LES, with"
		+ (mrsPep ? "" : "out") + " panesophageal pressurization, and with"
		+ (mrsAug ? "" : "out") + " post-MRS contraction augmentation.\n"
		+ ++i + ". " + (rdcBody && rdcLes && !rdcPep && !rdcShort ? "N" : "Abn") + "ormal rapid drink challenge (RDC) with"
		+ (rdcBody ? "" : "out") + " deglutitive inhibition of esophageal body, with"
		+ (rdcLes ? "" : "out") + " deglutitive inhibition of LES, with"
		+ (rdcPep ? "" : "out") + " panesophageal pressurization, and with"
		+ (rdcShort ? "" : "out") + " esophageal shortening.\n"
		+ ++i + ". " + (hh > 0 ? "Hiatal hernia measuring " + hh.toFixed(1) + " cm.\n" : "No hiatal hernia.\n");

	report += "\nImpressions\n";
	if (diagnosis == 0) {
		report += "1. " + (hh > 0 ? "Hiatal hernia (" + hh.toFixed(1) + " cm).\n2. Otherwise u" : "U" ) + "nremarkable high-resolution esophageal manometry.\n"
	} else {
		switch (diagnosis) {
		case 1: report += "1. Achalasia type I.\n"; break;
		case 2: report += "1. Achalasia type II.\n"; break;
		case 3: report += "1. Achalasia type III.\n"; break;
		case 4:
			report += "1. Manometric EGJ outflow obstruction (EGJOO)"
			if (subtypes) {
				switch (egjooSubtype) {
				case 0: report += " with no evidence of disordered peristalsis"; break;
				case 1: report += " with spastic features"; break;
				case 2: report += " with hypercontractile features"; break;
				case 3: report += " with ineffective motility"; break;
				}
			}
			report += ". Of note, a clinically relevant diagnosis of EGJOO requires the presence of relevant symptoms (dysphagia and/or non-cardiac chest pain) and supportive testing (timed barium esophagram and/or functional lumen imaging probe).\n"; break;
		case 5: report += "1. Absent contractility.\n"; break;
		case 6: report += "1. Manometric distal esophageal spasm (DES). Of note, a clinically relevant diagnosis of DES requires the presence of relevant symptoms (dysphagia and/or non-cardiac chest pain).\n"; break;
		case 7: report += "1. Manometric hypercontractile esophagus (HE). Of note, a clinically relevant diagnosis of HE requires the presence of relevant symptoms (dysphagia and/or non-cardiac chest pain).\n"; break;
		case 8: report += "1. Ineffective esophageal motility.\n"; break;
		}
		if (hh > 0)
			report += "2. Hiatal hernia (" + hh.toFixed(1) + " cm).\n";
	}
	document.getElementById('report').value = report;
	navigator.clipboard.writeText(report);
}

function createPhReport() {
	// Get input data
	var ppi = document.getElementsByName('ppi')[0].checked;
	var analysisTimeH = parseInt(document.getElementById('analysisTimeH').value) || 0;
    var analysisTimeM = parseInt(document.getElementById('analysisTimeM').value) || 0;
    var aetTotal = parseFloat(document.getElementById('aetTotal').value) || 0.0;
    var aetUpright = parseFloat(document.getElementById('aetUpright').value) || 0.0;
    var aetSupine = parseFloat(document.getElementById('aetSupine').value) || 0.0;
    var longestReflux = parseFloat(document.getElementById('longestReflux').value) || 0.0;
    var deMeester = parseFloat(document.getElementById('deMeester').value) || 0.0;
	var aetUprightHigh = (aetUpright >= 7.3);
	var aetSupineHigh = (aetSupine >= 1.4);
	var symptoms = [];
	var symptomsN = [];
	var symptomsSI = [];
	var symptomsSAP = [];
	for (var i = 0; i < document.getElementsByName('symptoms').length; i++) {
		if (document.getElementsByName('symptoms')[i].value != "") {
			symptoms.push(document.getElementsByName('symptoms')[i].value.toLowerCase());
			symptomsN.push(parseInt(document.getElementsByName('symptomsN')[i].value) || 0);
			symptomsSI.push(parseFloat(document.getElementsByName('symptomsSI')[i].value) || 0.0);
			symptomsSAP.push(parseFloat(document.getElementsByName('symptomsSAP')[i].value) || 0.0);
		}
	}

	// Build interpretation
	var report = "Interpretation:\n"
		+ "1. 96-hour pH monitoring study was performed "
		+ (ppi ? "on" : "off") + " PPIs. The total analysis time was "
		+ analysisTimeH + " hour" + (analysisTimeH == 1 ? "" : "s") + " and "
		+ analysisTimeM + " minute" + (analysisTimeM == 1 ? "" : "s") + ".\n"
		+ "2. " + (aetTotal < 4 ? "Normal" : (aetTotal > 6 ? "Elevated" : "Borderline"))
		+ " total acid exposure time (AET) of " + aetTotal.toFixed(1) + "%."
		+ (aetUprightHigh || aetSupineHigh ? " Elevated AET"
		   + (aetUprightHigh && aetSupineHigh ? " both" : "") + " while"
		   + (aetUprightHigh ? " upright (" + aetUpright.toFixed(1) + "%)" : "")
		   + (aetUprightHigh && aetSupineHigh ? " and" : "")
		   + (aetSupineHigh ? " supine (" + aetSupine.toFixed(1) + "%)" : "") + "."
		   : "") + "\n"
		+ "3. The longest reflux episode lasted " + longestReflux.toFixed(1) + " minutes.\n"
		+ "4. " + (deMeester < 14.7 ? "Normal" : "Elevated") + " DeMeester score of "
		+ deMeester.toFixed(1) + " (normal <14.7).\n";
	var n = 4;
	var associated = [];
	var notAssociated = [];
	for (i = 0; i < symptoms.length; i++) {
		if (symptomsN[i] > 2) {
			var numText = spellNumber(symptomsN[i]);
			report += ++n + ". " + numText[0].toUpperCase() + numText.slice(1) + " " + symptoms[i] + " events recorded which were"
				+ (symptomsSI[i] < 50 && symptomsSAP[i] < 95 ? " not" : "") + " associated with reflux episodes (SI "
				+ symptomsSI[i].toFixed(1) + "%, SAP " + symptomsSAP[i].toFixed(1) + "%).\n";
			if (symptomsSI[i] < 50 && symptomsSAP[i] < 95)
				notAssociated.push(symptoms[i]);
			else
				associated.push(symptoms[i]);
		}
		else {
			report += ++n + ". Only " + symptomsN[i] + " " + symptoms[i] + " event" + (symptomsN[i] == 1 ? "" : "s") + " recorded which " + (symptomsSI[i] < 50 ? "did not coincide" : "coincided") + " with reflux episodes.\n";
		}
	}

	// Build impression
	report += "\nImpression:\n";
	if (aetTotal > 6)
		report += "1. pH monitoring study consistent with " + (ppi ? "breakthrough GERD despite PPIs.\n" : "GERD.\n");
	else if (aetTotal < 4)
		report += (ppi ? "1. Adequate acid suppression while on PPIs.\n" : "1. Unremarkable pH monitoring study without evidence of GERD.\n");
	else
		report += "1. pH monitoring study borderline for GERD" + (ppi ? " while on PPIs.\n" : ".\n");

	n = 2;
	if (associated.length) {
		report += "2. Symptom" + (associated.length == 1 ? "" : "s") + " of " + concatenateStrings(associated)
			+ (associated.length == 1 ? " was" : " were") + " associated with reflux episodes.\n";
		n++;
	}
	if (notAssociated.length) {
		report += n + ". Symptom" + (notAssociated.length == 1 ? "" : "s") + " of " + concatenateStrings(notAssociated) + (notAssociated.length == 1 ? " was" : " were") + " not associated with reflux episodes.\n";
	}
	document.getElementById('report').value = report;
	navigator.clipboard.writeText(report);
}

function createPhzReport() {
	// Get input data
	var ppi = document.getElementsByName('ppi')[0].checked;
	var analysisTimeH = parseInt(document.getElementById('analysisTimeH').value) || 0;
    var analysisTimeM = parseInt(document.getElementById('analysisTimeM').value) || 0;
    var aetTotal = parseFloat(document.getElementById('aetTotal').value) || 0.0;
    var aetUpright = parseFloat(document.getElementById('aetUpright').value) || 0.0;
    var aetSupine = parseFloat(document.getElementById('aetSupine').value) || 0.0;
    var longestReflux = parseFloat(document.getElementById('longestReflux').value) || 0.0;
    var deMeester = parseFloat(document.getElementById('deMeester').value) || 0.0;
	var aetUprightHigh = (aetUpright >= 6.3);
	var aetSupineHigh = (aetSupine >= 1.2);
	var impedanceTotal = parseInt(document.getElementById('impedanceTotal').value) || 0;
	var proximalTotal = parseInt(document.getElementById('proximalTotal').value) || 0;
	var proximalUpright = parseInt(document.getElementById('proximalUpright').value) || 0;
	var proximalSupine = parseInt(document.getElementById('proximalSupine').value) || 0;
	var proximalUprightHigh = (proximalUpright >= 29);
	var proximalSupineHigh = (proximalSupine >= 3);
	var symptoms = [];
	var symptomsN = [];
	var symptomsSI = [];
	var symptomsSAP = [];
	for (var i = 0; i < document.getElementsByName('symptoms').length; i++) {
		if (document.getElementsByName('symptoms')[i].value != "") {
			symptoms.push(document.getElementsByName('symptoms')[i].value.toLowerCase());
			symptomsN.push(parseInt(document.getElementsByName('symptomsN')[i].value) || 0);
			symptomsSI.push(parseFloat(document.getElementsByName('symptomsSI')[i].value) || 0.0);
			symptomsSAP.push(parseFloat(document.getElementsByName('symptomsSAP')[i].value) || 0.0);
		}
	}

	// Build interpretation
	var report = "Interpretation:\n"
		+ "1. 24-hour pH/impedance monitoring study was performed "
		+ (ppi ? "on" : "off") + " PPIs. The total analysis time was "
		+ analysisTimeH + " hour" + (analysisTimeH == 1 ? "" : "s") + " and "
		+ analysisTimeM + " minute" + (analysisTimeM == 1 ? "" : "s") + ".\n"
		+ "2. " + (aetTotal < 4 ? "Normal" : (aetTotal > 6 ? "Elevated" : "Borderline"))
		+ " total acid exposure time (AET) of " + aetTotal.toFixed(1) + "%."
		+ (aetUprightHigh || aetSupineHigh ? " Elevated AET"
		   + (aetUprightHigh && aetSupineHigh ? " both" : "") + " while"
		   + (aetUprightHigh ? " upright (" + aetUpright.toFixed(1) + "%)" : "")
		   + (aetUprightHigh && aetSupineHigh ? " and" : "")
		   + (aetSupineHigh ? " supine (" + aetSupine.toFixed(1) + "%)" : "") + "."
		   : "") + "\n"
		+ "3. The longest reflux episode lasted " + longestReflux.toFixed(1) + " minutes.\n"
		+ "4. " + (deMeester < 14.7 ? "Normal" : "Elevated") + " DeMeester score of "
		+ deMeester.toFixed(1) + " (normal <14.7).\n"
		+ "5. On impedance monitoring, " + impedanceTotal + " episode" + (impedanceTotal == 1 ? "" : "s")
		+ " of reflux noted (normal <40, indeterminate 40-80, abnormal >80).\n";
	if (proximalTotal >= 31) {
		report += "6. Elevated total number of proximal reflux episodes "
			+ (proximalUprightHigh && proximalSupineHigh ? "both " : "predominantly ") + "while"
			+ (proximalUprightHigh ? " upright" : "")
			+ (proximalUprightHigh && proximalSupineHigh ? " and" : "")
			+ (proximalSupineHigh ? " supine" : "") + ".\n";
	} else {
		report += "6. " + (proximalUprightHigh || proximalSupineHigh ? "Elevated" : "Normal") + " number of proximal reflux episodes"
			+ (proximalUprightHigh || proximalSupineHigh ? " while " + (proximalUprightHigh ? "upright" : "supine") : "") + ".\n";
	}
	var n = 6;
	var associated = [];
	var notAssociated = [];
	for (i = 0; i < symptoms.length; i++) {
		if (symptomsN[i] > 2) {
			var numText = spellNumber(symptomsN[i]);
			report += ++n + ". " + numText[0].toUpperCase() + numText.slice(1) + " " + symptoms[i] + " events recorded which were"
				+ (symptomsSI[i] < 50 && symptomsSAP[i] < 95 ? " not" : "") + " associated with reflux episodes (SI "
				+ symptomsSI[i].toFixed(1) + "%, SAP " + symptomsSAP[i].toFixed(1) + "%).\n";
			if (symptomsSI[i] < 50 && symptomsSAP[i] < 95)
				notAssociated.push(symptoms[i]);
			else
				associated.push(symptoms[i]);
		}
		else {
			report += ++n + ". Only " + symptomsN[i] + " " + symptoms[i] + " event" + (symptomsN[i] == 1 ? "" : "s") + " recorded which " + (symptomsSI[i] < 50 ? "did not coincide" : "coincided") + " with reflux episodes.\n";
		}
	}

	// Build impression
	report += "\nImpression:\n";
	if (aetTotal > 6 || (aetTotal >= 4 && impedanceTotal > 80))
		report += "1. pH/impedance monitoring study consistent with " + (ppi ? "breakthrough GERD despite PPIs.\n" : "GERD.\n");
	else if (aetTotal < 4 || (aetTotal <= 6 && impedanceTotal < 40))
		report += (ppi ? "1. Adequate acid suppression while on PPIs.\n" : "1. Unremarkable pH/impedance monitoring study without evidence of GERD.\n");
	else
		report += "1. pH/impedance monitoring study borderline for GERD" + (ppi ? " while on PPIs.\n" : ".\n");

	n = 2;
	if (associated.length) {
		report += "2. Symptom" + (associated.length == 1 ? "" : "s") + " of " + concatenateStrings(associated)
			+ (associated.length == 1 ? " was" : " were") + " associated with reflux episodes.\n";
		n++;
	}
	if (notAssociated.length) {
		report += n + ". Symptom" + (notAssociated.length == 1 ? "" : "s") + " of " + concatenateStrings(notAssociated) + (notAssociated.length == 1 ? " was" : " were") + " not associated with reflux episodes.\n";
	}
	document.getElementById('report').value = report;
	navigator.clipboard.writeText(report);
}

/*******************/
/** ARM Functions **/
/*******************/

function updateArmLabels() {
	const female = document.querySelector('input[name="gender"][value="female"]').checked;
	document.getElementById('resting-label').textContent = (female ? "71-81" : "89-96");
	document.getElementById('squeeze-label').textContent = (female ? "186-224" : "245-287");
	document.getElementById('first-label').textContent = (female ? "21-26" : "20-25");
	document.getElementById('urge-label').textContent = (female ? "79-96" : "82-103");
	document.getElementById('discomfort-label').textContent = (female ? "182-204" : "192-222");
}

/**********************/
/** pH/pHZ Functions **/
/**********************/

function spellNumber(n) {
    var tOne = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
                "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
    var tTen = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
    var tThousand = ["", " thousand", " million", " billion", " trillion", " quadrillion"];
    var result = (n == 0 ? "zero" : "");
    var i = 0;

    while (n > 0) {
		var tri = n % 1000;
		n = Math.floor(n / 1000);

		if (tri > 0) {
			var hundred = Math.floor(tri / 100);
			var ten = tri % 100;
			var tTri = "";

			if (hundred > 0)
				tTri += tOne[hundred] + " hundred" + (ten > 0 ? " " : "");

			if (ten > 0) {
				if (ten < 20) {
					tTri += tOne[ten];
				} else {
					var one = ten % 10;
					ten = Math.floor(ten / 10);
					if (ten > 0)
						tTri += tTen[ten] + (one > 0 ? "-" : "");
					if (one > 0)
						tTri += tOne[one];
				}
			}
			result = tTri + tThousand[i] + " " + result;
		}
		i++;
    }
    return result.trim();
}

function addSymptom() {
	var newRow = document.getElementById('symptomTable').insertRow();
	var inputSymptom = document.createElement('input');
	inputSymptom.type = 'text';
	inputSymptom.setAttribute('name', 'symptoms');
	inputSymptom.setAttribute('list', 'symptomList');
	var inputN = document.createElement('input');
	inputN.type = 'number';
	inputN.setAttribute('name', 'symptomsN');
	var inputSI = document.createElement('input');
	inputSI.type = 'number';
	inputSI.setAttribute('name', 'symptomsSI');
	inputSI.setAttribute('step', '0.1');
	var inputSAP = document.createElement('input');
	inputSAP.type = 'number';
	inputSAP.setAttribute('name', 'symptomsSAP');
	inputSAP.setAttribute('step', '0.1');

	newRow.insertCell(0).appendChild(inputSymptom);
	newRow.insertCell(1).appendChild(inputN);
	newRow.insertCell(2).appendChild(inputSI);
	newRow.insertCell(3).appendChild(inputSAP);
}

function createEmptySymptomTable() {
	for (var z = 0; z < 5; z++)
		addSymptom();
}

function concatenateStrings(s) {
	switch (s.length) {
	case 1: return s[0];
	case 2: return s[0] + " and " + s[1];
	default: return s.slice(0, -1).join(", ") + ", and " + s[s.length - 1];
	}
}

/*
  function clearAll() {
  var inputs = document.querySelectorAll('input');
  inputs.forEach(function(input) {
  input.value = '';
  });
  document.getElementsByName('ppi')[1].checked = true;
  document.getElementById('report').value = '';

  var symptomTable = document.getElementById('symptomTable');
  for (var i = symptomTable.getElementsByTagName('tr').length - 1; i > 1; i--)
  symptomTable.deleteRow(i);
  for (var z = 0; z < 5; z++)
  addSymptom();
  }
*/

/**********************/
/** Global Functions **/
/**********************/

async function copyReport() {
    try {
		const report = document.getElementById('report').value;
        await navigator.clipboard.writeText(report);
        console.log('Text copied successfully using navigator.clipboard.writeText!');
    } catch (err) {
        console.error('Failed to copy text using navigator.clipboard.writeText:', err);
    }
}

function copyToClipboard(iconElement) {
	const li = iconElement.closest("li");
	const iconText = iconElement.textContent;
	const fullText = li.textContent.replace(iconText, "").trim();
	navigator.clipboard.writeText(fullText).then(() => {
		iconElement.textContent = "✅";
		setTimeout(() => iconElement.textContent = "📋", 1500);
	});
}
