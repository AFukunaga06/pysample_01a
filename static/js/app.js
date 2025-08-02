
let currentIndex = 1;

function showJanCodeDialog() {
    document.getElementById('janCodeDialog').style.display = 'flex';
}

function showJanInputDialog() {
    document.getElementById('janInputDialog').style.display = 'flex';
}

function showTextExtractDialog() {
    document.getElementById('textExtractDialog').style.display = 'flex';
}

function closeDialog(dialogId) {
    document.getElementById(dialogId).style.display = 'none';
}

function closeFunctionResult() {
    document.getElementById('functionResult').style.display = 'none';
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

function showFunction(functionName) {
    const resultArea = document.getElementById('functionResult');
    const titleElement = document.getElementById('functionTitle');
    const contentElement = document.getElementById('functionContent');
    
    titleElement.textContent = functionName;
    
    switch(functionName) {
        case '重複チェック':
            contentElement.innerHTML = `
                <p>重複と項目抜けのチェック機能を実行します。</p>
                <p>この機能は元のデスクトップアプリの機能を再現しています。</p>
                <p>Web版では、ファイルアップロード機能として実装予定です。</p>
            `;
            break;
        case 'テキスト貼り付け':
            showTextExtractDialog();
            return;
        case 'input.txt開く':
            contentElement.innerHTML = `
                <p>input.txtファイルを開く機能です。</p>
                <p>Web版では、ファイルアップロード機能として実装予定です。</p>
            `;
            break;
        case '座標軸コピー':
            contentElement.innerHTML = `
                <p>座標軸コピー機能を実行します。</p>
                <p>この機能は元のデスクトップアプリの座標取得機能を再現しています。</p>
            `;
            break;
        case 'データ対応チェック':
            contentElement.innerHTML = `
                <p>データ対応のチェック機能を実行します。</p>
                <p>データの整合性を確認する機能です。</p>
            `;
            break;
        case 'チェックシート開く':
            contentElement.innerHTML = `
                <p>チェックシートを開く機能です。</p>
                <p>Web版では、Google Sheetsとの連携機能として実装予定です。</p>
            `;
            break;
        case '商品情報入力シート':
            contentElement.innerHTML = `
                <p>商品情報入力シートを開く機能です。</p>
                <p><strong style="color: red;">※必ず名前を明示してください</strong></p>
                <p>Web版では、Google Sheetsとの連携機能として実装予定です。</p>
            `;
            break;
        case '緑原産業開く':
            contentElement.innerHTML = `
                <p>緑原産業関連の機能を開きます。</p>
                <p>この機能は元のデスクトップアプリの専用機能を再現しています。</p>
            `;
            break;
        case 'inputやりチェック':
            contentElement.innerHTML = `
                <p>inputをやりチェック機能を実行します。</p>
                <p>入力データの検証を行います。</p>
            `;
            break;
        case 'サブフォーム廃番処理':
            contentElement.innerHTML = `
                <p>サブフォーム廃番処理を実行します。</p>
                <p>廃番商品の処理を行う機能です。</p>
            `;
            break;
        case 'Type2.bat実行':
            contentElement.innerHTML = `
                <p>Type2.bat実行してoutput.txtを表示します。</p>
                <p>Web版では、サーバーサイド処理として実装予定です。</p>
            `;
            break;
        case 'クリップボードクリア':
            contentElement.innerHTML = `
                <p>クリップボードをクリアしました。</p>
                <p>Web版では、ブラウザのセキュリティ制限により制限があります。</p>
            `;
            if (navigator.clipboard) {
                navigator.clipboard.writeText('');
            }
            break;
        case 'checkd01.txt開く':
            contentElement.innerHTML = `
                <p>checkd01.txtファイルを開く機能です。</p>
                <p><strong style="color: red;">※チェックシートの内容をcheckd01.txtにコピーしてください</strong></p>
                <p>Web版では、ファイルダウンロード機能として実装予定です。</p>
            `;
            break;
        case 'checkd02.txt開く':
            contentElement.innerHTML = `
                <p>checkd02.txtファイルを開く機能です。</p>
                <p>Web版では、ファイルダウンロード機能として実装予定です。</p>
            `;
            break;
        default:
            contentElement.innerHTML = `<p>${functionName}機能を実行します。</p>`;
    }
    
    resultArea.style.display = 'block';
}

async function copyJanCode() {
    const index = document.getElementById('indexInput').value;
    currentIndex = parseInt(index);
    
    try {
        const response = await fetch(`/api/jan-code/${index}`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('janResult').innerHTML = 
                `<strong>${index}番目のJANコード:</strong> ${data.jan_code} ${data.demo_mode ? '(デモモード)' : ''} - クリップボードにコピーしました`;
            
            copyToClipboard(data.jan_code);
        } else {
            document.getElementById('janResult').innerHTML = 
                `<strong>エラー:</strong> ${data.message}`;
        }
    } catch (error) {
        document.getElementById('janResult').innerHTML = 
            `<strong>エラー:</strong> サーバーとの通信に失敗しました`;
    }
}

function nextJanCode() {
    currentIndex++;
    document.getElementById('indexInput').value = currentIndex;
    copyJanCode();
}

function previousJanCode() {
    if (currentIndex > 1) {
        currentIndex--;
        document.getElementById('indexInput').value = currentIndex;
        copyJanCode();
    }
}

async function addJanCode() {
    const janCode = document.getElementById('janCodeInput').value;
    
    if (!janCode.trim()) {
        alert('JANコードを入力してください');
        return;
    }
    
    alert(`JANコード "${janCode}" を追加しました（デモ機能）`);
    document.getElementById('janCodeInput').value = '';
    closeDialog('janInputDialog');
}

async function extractText() {
    const text = document.getElementById('textInput').value;
    
    if (!text.trim()) {
        document.getElementById('extractResult').innerHTML = 
            '<strong>エラー:</strong> テキストを入力してください';
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
            document.getElementById('extractResult').innerHTML = 
                `<strong>抽出されたテキスト:</strong> "${data.extracted_text}" - クリップボードにコピーしました`;
            
            copyToClipboard(data.extracted_text);
        } else {
            document.getElementById('extractResult').innerHTML = 
                `<strong>エラー:</strong> ${data.message}`;
        }
    } catch (error) {
        document.getElementById('extractResult').innerHTML = 
            `<strong>エラー:</strong> サーバーとの通信に失敗しました`;
    }
}

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('dialog')) {
        e.target.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const indexInput = document.getElementById('indexInput');
    if (indexInput) {
        indexInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                copyJanCode();
            }
        });
    }
    
    const textInput = document.getElementById('textInput');
    if (textInput) {
        textInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                extractText();
            }
        });
    }
    
    const janCodeInput = document.getElementById('janCodeInput');
    if (janCodeInput) {
        janCodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addJanCode();
            }
        });
    }
});
