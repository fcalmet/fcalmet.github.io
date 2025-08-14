
/********************/
/** POPULATE LISTS **/
/********************/

function populateProcedures() {
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
  populateInterventions(organInterventions.interventions)
}

function onInterventionListDblClick(event) {
  const selectedOption = event.target;
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
  return str
    .trim()
    .replace(/^./, c => c.toUpperCase()) // capitalize first letter
    .replace(/(\d+)\s(\w+)\(s\)/g, (_, num, word) =>
      num === "1" ? `${num} ${word}` : `${num} ${word}s`
    ) // Check for '(s)': if preceding number is 1, delete, otherwise, replace with 's'
    .replace(/([^.!?])$/, '$1.'); // ensure ending punctuation
	.replace(/ {2,}/g, ' '); // replace multiple spaces with single space
}

function getOptions(str) {
  return [...str.matchAll(/\{(.*?)\}/g)].map(m => m[1]);
}

function parseOptions(template, values) {
  let i = 0;
  return template.replace(/\{.*?\}/g, () => values[i++] ?? '');
}
