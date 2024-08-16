document.getElementById('check-btn').addEventListener('click', function() {
    const textInput = document.getElementById('text-input').value;
    const resultElement = document.getElementById('result');
            
    if (textInput.trim() === '') {
        alert('Please input a value');
        resultElement.textContent = '';
        return;
        }
            
    const cleanedText = textInput.toLowerCase().replace(/[^a-z0-9]/g, '');
    const reversedText = cleanedText.split('').reverse().join('');
            
    if (cleanedText === reversedText) {
        resultElement.textContent = `${textInput} is a palindrome`;
    } else {
        resultElement.textContent = `${textInput} is not a palindrome`;
        }
    });
