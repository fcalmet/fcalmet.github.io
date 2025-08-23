
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
  selectFinding();
}

/*******************/
/** POPULATE DIVS **/
/*******************/

function populateDivOptions(div, options, eventCtrlEnter = null, eventEnter = null) {
  const divOptions = $(div);
  clearDiv(div);
  var index = 0;
  // Create 'Options' subtitle if options present
  if (options.length) {
	divOptions.appendChild(createH2('Options'));
  }
  options.forEach(opt => {
	const id = `${div}-${index}`
	if (opt[0] === '#') { // ADD NUMBER
	  divOptions.append(
		createLabel(opt.slice(1), id),
		createInputNumber(id, 'keydown', (event) => {
		  if (event.ctrlKey && event.key === 'Enter' && eventCtrlEnter !== null) {
			event.preventDefault();
			eventCtrlEnter();
		  } else if (event.key === 'Enter' && eventEnter !== null) {
			event.preventDefault();
			eventEnter();
		  }
		})
	  )
	} else {
	  const multiSelect = opt[0] === '*';
	  if (multiSelect) opt = opt.slice(1);
	  // ADD ITEM DEFINED IN SELECTION
	  const selOption = db.selection.find(x => x.name === opt);
	  if (selOption.label) {
		divOptions.append(createLabel(selOption.label, selOption.name));
	  }
	  const select = createSelect(id, selOption.options.length, multiSelect, 'keydown',
								  (event) => {
									if (event.ctrlKey && event.key === 'Enter' && eventCtrlEnter !== null) {
									  event.preventDefault();
									  eventCtrlEnter();
									} else if (event.key === 'Enter' && eventEnter !== null) {
									  event.preventDefault();
									  eventEnter();
									}
								  }
								 );
	  selOption.options.forEach(option => {
		if (typeof(option) === 'string') option = [option, option]
		select.appendChild(createOption(option[0], option[1]));
	  });
	  select.selectedIndex = 0;
	  divOptions.append(select);
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
  clearDiv('intervention-options');
}

/************/
/** EVENTS **/
/************/

function selectProcedure() {
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

function selectFinding() {
  const selectedOption = $('finding-list').selectedOptions[0]
  const options = getOptions(selectedOption.value);
  populateDivOptions('finding-options', options, addFinding, addFinding);
  const organ = selectedOption.dataset.organ;
  const organInterventions = db.organInterventions.find(it => it.organ === organ);
  populateInterventions(organInterventions.interventions);
  $('sel-intervention-list').length = 0;
}

function selectIntervention() {
  console.log('selectIntervention');
  const options = getOptions($('intervention-list').selectedOptions[0].value);
  populateDivOptions('intervention-options', options, addFinding, addIntervention);
}

function addIntervention() {
  if (emptyOptionSetFocus('intervention-options')) return;
  const selectedOption = $('intervention-list').selectedOptions[0];
  if (!selectedOption.text) return;
  const selInterventionList = $('sel-intervention-list');
  const options = getOptions(selectedOption.value);
  const { values: optionValues, texts: optionTexts } = getDivOptions('intervention-options');
  selInterventionList.appendChild(
	createOption(
	  selectedOption.text + (optionTexts.length ? (' --- ' + optionTexts.join(' / ')) : ''),
	  parseOptions(selectedOption.value, optionValues)
	)
  );
  $('intervention-list').focus();
}

function moveSelectedInterventionUp() {
  const sel = $('sel-intervention-list');
  const i = sel.selectedIndex;
  if (i > 0) {
    const option = sel.options[i];
    sel.remove(i);
    sel.add(option, i-1);
    sel.selectedIndex = i - 1;
  }
}

function moveSelectedInterventionDown() {
  const sel = $('sel-intervention-list');
  const i = sel.selectedIndex;
  if (i !== -1 && i < sel.options.length - 1) {
    const option = sel.options[i];
    sel.remove(i);
    sel.add(option, i+1);
    sel.selectedIndex = i + 1;
  }
}

function deleteSelectedIntervention() {
  const sel = $('sel-intervention-list');
  const i = sel.selectedIndex;
  if (i !== -1) {
    sel.remove(i);
	if (sel.options.length) {
	  sel.selectedIndex = (i < sel.options.length) ? i : i - 1;
	}
  }
}

function addFinding() {
  if (emptyOptionSetFocus('finding-options', 'intervention-options')) return;
  // get item selected in finding list
  const findingList = $('finding-list');
  var text = findingList.options[findingList.selectedIndex].value;
  // get finding option values
  const newValues = getDivOptions('finding-options').values;
  text = sanitizeSentence(parseOptions(text, newValues));
  // get selected interventions and add to text
  const selInterventionList = $('sel-intervention-list');
  for (const option of selInterventionList.options) {
	text += ' ' + sanitizeSentence(option.value);
  };
  $('report').value += `- ${sanitizeSentence(text)}\n`
  findingList.focus();
}

function emptyOptionSetFocus(...options) {
  // Called before adding finding or intervention - sets focus on relevant empty number inputs
  query = options.map(x => `input[type="number"][id^="${x}-"]`).join(', ')
  const elements = document.querySelectorAll(query);
  for (const el of elements) {
	if (!el.value) {
	  el.focus();
	  return true;
	}
  };
  return false;
}

function getDivOptions(div) {
  const elements = document.querySelectorAll(`[id^='${div}-']`);
  const values = []
  const texts = []
  elements.forEach(el => {
	switch(el.tagName) {
	case 'INPUT':
	  values.push(el.value);
	  texts.push(el.value);
	  break;
	case 'SELECT':
	  values.push(textList(Array.from(el.selectedOptions).map(x => x.value)));
	  texts.push(textList(Array.from(el.selectedOptions).map(x => x.text)));
	  break;
	}
  });
  return { values: values, texts: texts }
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

function createInputNumber(id = '', eventName = false, eventFunction = null) {
  const element = document.createElement('input');
  element.type = 'number';
  element.id = id;
  if (eventName)
	element.addEventListener(eventName, eventFunction);
  return element;
}

function createSelect(id = '', size = 1, multiSelect = false, eventName = false, eventFunction = null) {
  const element = document.createElement('select');
  element.id = id;
  element.size = size;
  element.multiple = multiSelect;
  if (eventName)
	element.addEventListener(eventName, eventFunction);
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
	  .replace(/(\d+)\s(.+?)\(s\)/g, (_, num, word) =>
		num === '1' ? `${num} ${word}` : `${num} ${word}s`
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
  const tOne = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tTen = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const tThousand = ['', ' thousand', ' million', ' billion', ' trillion', ' quadrillion'];
  var result = (n == 0 ? 'zero' : '');
  var i = 0;
  while (n > 0) {
	const tri = n % 1000;
	n = Math.floor(n / 1000);
	if (tri > 0) {
	  const hundred = Math.floor(tri / 100);
	  var ten = tri % 100;
	  var tTri = '';
	  if (hundred > 0)
		tTri += tOne[hundred] + ' hundred' + (ten > 0 ? ' ' : '');
	  if (ten > 0) {
		if (ten < 20) {
		  tTri += tOne[ten];
		} else {
		  const one = ten % 10;
		  ten = Math.floor(ten / 10);
		  if (ten > 0)
			tTri += tTen[ten] + (one > 0 ? '-' : '');
		  if (one > 0)
			tTri += tOne[one];
		}
	  }
	  result = tTri + tThousand[i] + ' ' + result;
	}
	i++;
  }
  return result.trim();
}

function textList(strings) {
  switch(strings.length) {
  case 0: return '';
  case 1: return strings[0];
  case 2: return `${strings[0]} and ${strings[1]}`;
  default: return `${strings.slice(0, -1).join(', ')}, and ${strings[strings.length - 1]}`;
  }
}
