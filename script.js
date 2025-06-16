// Input validation for input boxes taking only floating point numbers
function isValidFloat(value) {
    return /^(\d+(\.\d*)?|\.\d+)?$/.test(value);
}

function setupFloatInput(input) {
    input.addEventListener("beforeinput", (e) => {
		const { data, target } = e;
		const value = target.value;
		const start = target.selectionStart;
		const end = target.selectionEnd;
		const newValue = value.slice(0, start) + (data || "") + value.slice(end);
		if (!isValidFloat(newValue)) {
			e.preventDefault();
		}
    });

	input.addEventListener("paste", (e) => {
		e.preventDefault();
		const paste = (e.clipboardData || window.clipboardData).getData("text");
		const value = input.value;
		const start = input.selectionStart;
		const end = input.selectionEnd;
		const newValue = value.slice(0, start) + paste + value.slice(end);

		if (isValidFloat(newValue)) {
			input.value = newValue;
			const newCaretPos = start + paste.length;
			input.setSelectionRange(newCaretPos, newCaretPos);
		}
	});

	// input.addEventListener("paste", (e) => {
	// 	e.preventDefault();
	// 	const paste = (e.clipboardData || window.clipboardData).getData("text");
	// 	const value = input.value;
	// 	const start = input.selectionStart;
	// 	const end = input.selectionEnd;
	// 	const newValue = value.slice(0, start) + paste + value.slice(end);

	// 	if (isValidFloat(newValue)) {
	// 		input.value = newValue;

	// 		// Move caret to just after the pasted content
	// 		// const newCaretPos = start + paste.length;
	// 		// input.setSelectionRange(newCaretPos, newCaretPos);
	// 	}
	// });
}

document.querySelectorAll('.float').forEach(setupFloatInput);
