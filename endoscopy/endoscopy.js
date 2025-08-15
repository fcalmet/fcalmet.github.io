
/********************/
/** POPULATE LISTS **/
/********************/

function populateProcedureList() {
  const procedureList = $('procedure-list');
  db.procedures.forEach(procedure => {
	procedureList.appendChild(createOption(procedure.name, procedure.name));
  });
}

function populateFindingList(procedure) {
  const findingList = $('finding-list');
  findingList.length = 0;
  db.organFindings.forEach(organFinding => {
	if (procedure.sections.includes(organFinding.organ)) {
	  findingList.appendChild(createOption(`--- ${organFinding.organ} ---`, '', true));
	  organFinding.findings.forEach(finding => {
		findingList.appendChild(createOption(finding.name, finding.text, false, organFinding.organ));
	  });
	  findingList.appendChild(createOption('', '', true));
	}
  })
  findingList.length -= 1;
  findingList.selectedIndex = 1;
}

/*******************/
/** POPULATE DIVS **/
/*******************/

function populateDivFindingOptions(options) {
  const divFindingOptions = $('finding-options');
  clearDiv('finding-options');
  var index = 0;
  // Create 'Options' subtitle if options present
  if (options.length) {
	divFindingOptions.appendChild(createH2('Options'));
  }
  options.forEach(opt => {
	const id = `finding-option-{index}`
	if (opt[0] === '#') { // ADD NUMBER
	  divFindingOptions.append(
		createLabel(opt.slice(1), id),
		createInputNumber(id)
	  )
	} else {
	  // ADD ITEM DEFINED IN SELECTION
	  const selOption = db.selection.find(x => x.name === opt);
	  if (selOption.label) {
		divFindingOptions.append(createLabel(selOption.label, selOption.name));
	  }
	  const select = document.createElement('select');
	  select.id = id;
	  selOption.options.forEach(option => {
		if (typeof(option) === 'string') option = [option, option]
		select.appendChild(createOption(option[0], option[1]));
	  });
	  select.size = selOption.options.length;
	  divFindingOptions.append(select);
	}
	index++;
  })
}

function populateInterventions(interventions) {
  const interventionList = $('intervention-list');
  interventionList.length = 0
  interventions.forEach(intervention => {
	interventionList.appendChild(
	  createOption(intervention.name, intervention.text)
	);
  });
}

/************/
/** EVENTS **/
/************/

function onProcedureListSelect(event) {
  const procedureList = $('procedure-list');
  const report = $('report');
  const procedure = db.procedures.find(it =>
	it.name === procedureList.value); // get selected procedure from db
  // add title to report
  report.value = `${procedure.name}\n`;
  // add organs/findings to finding select box
  populateFindingList(procedure)
  clearDiv('finding-options');
}

function onFindingListSelect(event) {
  // event.target.value == "{Small-large} EV {bleeding-type}."
  const options = getOptions(event.target.value);
  populateDivFindingOptions(options);
  const organ = event.target.selectedOptions[0].dataset.organ;
  const organInterventions = db.organInterventions.find(it => it.organ === organ);
  populateInterventions(organInterventions.interventions);
  $('sel-intervention-list').length = 0;
}

function onInterventionListDblClick(event) {
  const selectedOption = $('intervention-list').selectedOptions[0];
  if (!selectedOption.text) return;
  const selInterventionList = $('sel-intervention-list');
  const options = getOptions(selectedOption.value);
  const optionValues = []
  options.forEach(option => {
	optionValues.push(prompt(option.slice(1)));
  });
  selInterventionList.appendChild(
	createOption(
	  selectedOption.text + (optionValues.length ? (' --- ' + optionValues.join(' / ')) : ''),
	  parseOptions(selectedOption.value, optionValues)
	)
  );
}

function onSelInterventionListCtrlUp(event) {
  const sel = $('sel-intervention-list');
  const i = sel.selectedIndex;
  if (i > 0) {
    const option = sel.options[i];
    sel.remove(i);
    sel.add(option, i-1);
    sel.selectedIndex = i - 1;
  }
}

function onSelInterventionListCtrlDown(event) {
  const sel = $('sel-intervention-list');
  const i = sel.selectedIndex;
  if (i !== -1 && i < sel.options.length - 1) {
    const option = sel.options[i];
    sel.remove(i);
    sel.add(option, i+1);
    sel.selectedIndex = i + 1;
  }
}

function onSelInterventionListDelete(event) {
  const sel = $('sel-intervention-list');
  const i = sel.selectedIndex;
  if (i !== -1) {
    sel.remove(i);
	if (sel.options.length) {
	  sel.selectedIndex = (i < sel.options.length) ? i : i - 1;
	}
  }
}

function onAddFindingClick(event) {
  // get item selected in finding list
  const findingList = $('finding-list');
  var text = findingList.options[findingList.selectedIndex].value;

  // get finding option values
  const elements = document.querySelectorAll('[id^="finding-option-"]');
  const newValues = []
  elements.forEach(el => {
	switch(el.tagName) {
	case 'INPUT':
	  newValues.push(el.value);
	  break;
	case 'SELECT':
	  newValues.push(el.options[el.selectedIndex].value);
	  break;
	}
  });
  text = sanitizeSentence(parseOptions(text, newValues));

  // get selected interventions and add to text
  const selInterventionList = $('sel-intervention-list');
  for (const option of selInterventionList.options) {
	text += ' ' + sanitizeSentence(option.value);
  };

  $('report').value += `- ${sanitizeSentence(text)}\n`
}

/***************************/
/** HTML HELPER FUNCTIONS **/
/***************************/

function clearDiv(id) {
  $(id).replaceChildren();
}

function createOption(textContent = '', value = '', disabled = false, datasetOrgan = '') {
  const element = document.createElement('option');
  element.textContent = textContent;
  element.value = value;
  element.disabled = disabled;
  element.dataset.organ = datasetOrgan;
  return element;
}

function createLabel(textContent = '', htmlFor = '') {
  const element = document.createElement('label');
  element.textContent = textContent;
  element.htmlFor = htmlFor;
  return element;
}

function createInputNumber(id = '') {
  const element = document.createElement('input');
  element.type = 'number';
  element.id = id;
  return element;
}

function createH2(textContent = '') {
  const element = document.createElement('h2');
  element.textContent = textContent;
  return element;
}

function $(id) {
  return document.getElementById(id);
}

/******************************/
/** HELPER UTILITY FUNCTIONS **/
/******************************/

function sanitizeSentence(str) {
  return firstNumberToText(
	str.trim()
	  .replace(/(\d+)\s(\w+)\(s\)/g, (_, num, word) =>
		num === "1" ? `${num} ${word}` : `${num} ${word}s`
	  ) // Check for '(s)': if preceding number is 1, delete, otherwise, replace with 's'
  ).replace(/^./, c => c.toUpperCase()) // capitalize first letter
	.replace(/([^.!?])$/, '$1.') // ensure ending punctuation
	.replace(/ {2,}/g, ' ');
}

function getOptions(str) {
  return [...str.matchAll(/\{(.*?)\}/g)].map(m => m[1]);
}

function parseOptions(template, values) {
  let i = 0;
  return template.replace(/\{.*?\}/g, () => values[i++] ?? '');
}

function firstNumberToText(str) {
  const numberToText = (num) => {
	const units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
	const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
	if (num < 20) return units[num];
	if (num < 100) return tens[Math.floor(num / 10)] + ((num % 10 !== 0) ? ' ' + units[num % 10] : '');
	return num.toString(); // Fallback for numbers greater than 99
  };
  const match = str.match(/^\d+/);
  return match
	? str.replace(match[0], spellNumber(parseInt(match[0], 10)))
	: str;
}

function spellNumber(n) {
  const tOne = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const tTen = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const tThousand = ["", " thousand", " million", " billion", " trillion", " quadrillion"];
  var result = (n == 0 ? "zero" : "");
  var i = 0;
  while (n > 0) {
	const tri = n % 1000;
	n = Math.floor(n / 1000);
	if (tri > 0) {
	  const hundred = Math.floor(tri / 100);
	  var ten = tri % 100;
	  var tTri = "";
	  if (hundred > 0)
		tTri += tOne[hundred] + " hundred" + (ten > 0 ? " " : "");
	  if (ten > 0) {
		if (ten < 20) {
		  tTri += tOne[ten];
		} else {
		  const one = ten % 10;
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
