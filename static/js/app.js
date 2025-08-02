let currentIndex = 1;

function showResult(elementId, message, type = 'info') {
    const resultElement = document.getElementById(elementId);
    resultElement.textContent = message;
    resultElement.className = `result ${type}`;
    resultElement.style.display = 'block';
}

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Text copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            console.log('Text copied to clipboard (fallback)');
        } catch (err) {
            console.error('Failed to copy text (fallback): ', err);
        }
        document.body.removeChild(textArea);
    }
}

async function copyJanCode() {
    const indexInput = document.getElementById('indexInput');
    const index = parseInt(indexInput.value) || 1;
    
    try {
        const response = await fetch(`/api/jan-code/${index}`);
        const data = await response.json();
        
        if (data.success) {
            copyToClipboard(data.jan_code);
            const modeText = data.demo_mode ? ' (デモモード)' : '';
            showResult('janResult', `${index}番目のJANコード: ${data.jan_code}${modeText} - クリップボードにコピーしました`, 'success');
            currentIndex = index;
        } else {
            showResult('janResult', data.message, 'error');
        }
    } catch (error) {
        showResult('janResult', `エラー: ${error.message}`, 'error');
    }
}

async function nextJanCode() {
    currentIndex++;
    document.getElementById('indexInput').value = currentIndex;
    await copyJanCode();
}

async function previousJanCode() {
    if (currentIndex > 1) {
        currentIndex--;
        document.getElementById('indexInput').value = currentIndex;
        await copyJanCode();
    } else {
        showResult('janResult', 'すでに最初のJANコードです', 'info');
    }
}

async function extractText() {
    const textInput = document.getElementById('textInput');
    const text = textInput.value.trim();
    
    if (!text) {
        showResult('extractResult', 'テキストを入力してください', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/extract-text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text })
        });
        
        const data = await response.json();
        
        if (data.success) {
            copyToClipboard(data.extracted_text);
            showResult('extractResult', `抽出されたテキスト: "${data.extracted_text}" - クリップボードにコピーしました`, 'success');
        } else {
            copyToClipboard(data.original_text || text);
            showResult('extractResult', `${data.message} - 元のテキストをクリップボードにコピーしました`, 'error');
        }
    } catch (error) {
        showResult('extractResult', `エラー: ${error.message}`, 'error');
    }
}

document.getElementById('indexInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        copyJanCode();
    }
});

document.getElementById('textInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        extractText();
    }
});
