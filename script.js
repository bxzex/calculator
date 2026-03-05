

class FuturisticCalculator {
    constructor() {
        this.expression = '';
        this.lastExpression = '';
        this.isCalculated = false;
        this.isScientific = false;

       
        this.mainDisplay = document.getElementById('main-display');
        this.previewDisplay = document.getElementById('expression-preview');
        this.historyLog = document.getElementById('history-log');
        this.controls = document.getElementById('controls');
        this.modeBasicBtn = document.getElementById('btn-basic');
        this.modeSciBtn = document.getElementById('btn-sci');
        this.calcShell = document.getElementById('calc-shell');

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDisplay();
    }

    bindEvents() {
       
        this.controls.addEventListener('click', (e) => {
            const btn = e.target.closest('.key');
            if (!btn) return;

            const action = btn.dataset.action;
            const value = btn.textContent;

            if (action === 'calculate') {
                this.calculate();
            } else if (action === 'clear') {
                this.clear();
            } else if (action === 'delete') {
                this.delete();
            } else if (action) {
                this.handleAction(action);
            } else {
                this.appendValue(value);
            }
        });

       
        this.modeBasicBtn.addEventListener('click', () => this.setMode(false));
        this.modeSciBtn.addEventListener('click', () => this.setMode(true));

       
        window.addEventListener('keydown', (e) => {
            if (e.key >= '0' && e.key <= '9') this.appendValue(e.key);
            if (e.key === '.') this.appendValue('.');
            if (e.key === '+') this.appendValue('+');
            if (e.key === '-') this.appendValue('-');
            if (e.key === '*') this.appendValue('*');
            if (e.key === '/') this.appendValue('/');
            if (e.key === 'Enter' || e.key === '=') this.calculate();
            if (e.key === 'Backspace') this.delete();
            if (e.key === 'Escape') this.clear();
        });
    }

    setMode(isSci) {
        if (this.isScientific === isSci) return;
        this.isScientific = isSci;

        if (isSci) {
            this.calcShell.classList.add('sci-mode');
            this.modeSciBtn.classList.add('active');
            this.modeBasicBtn.classList.remove('active');
        } else {
            this.calcShell.classList.remove('sci-mode');
            this.modeSciBtn.classList.remove('active');
            this.modeBasicBtn.classList.add('active');
        }
    }

    appendValue(val) {
        const operators = ['+', '-', '*', '/', '^', '%'];
        const isOperator = operators.includes(val);

        if (this.isCalculated) {
            if (isOperator) {
                this.isCalculated = false;
            } else {
                this.expression = '';
                this.isCalculated = false;
            }
        }

        const lastChar = this.expression.slice(-1);

        if (operators.includes(lastChar) && isOperator) {
            this.expression = this.expression.slice(0, -1) + val;
        } else {
            this.expression += val;
        }

        this.updateDisplay();
    }

    handleAction(action) {
        switch (action) {
            case 'sin': this.appendFunction('sin('); break;
            case 'cos': this.appendFunction('cos('); break;
            case 'tan': this.appendFunction('tan('); break;
            case 'log': this.appendFunction('log10('); break;
            case 'ln': this.appendFunction('log('); break;
            case 'sqrt': this.appendFunction('sqrt('); break;
            case 'pow': this.appendValue('^'); break;
            case 'pi': this.appendValue('pi'); break;
            case 'e': this.appendValue('e'); break;
            case 'open_paren': this.appendValue('('); break;
            case 'close_paren': this.appendValue(')'); break;
            case 'percent': this.appendValue('%'); break;
            case 'add': this.appendValue('+'); break;
            case 'subtract': this.appendValue('-'); break;
            case 'multiply': this.appendValue('*'); break;
            case 'divide': this.appendValue('/'); break;
        }
    }

    appendFunction(func) {
        this.expression += func;
        this.updateDisplay();
    }

    clear() {
        this.expression = '';
        this.lastExpression = '';
        this.isCalculated = false;
        this.historyLog.innerHTML = '';
        this.updateDisplay();
    }

    delete() {
        if (this.expression.length > 0) {
            this.expression = this.expression.slice(0, -1);
        }
        this.updateDisplay();
    }

    calculate() {
        if (!this.expression) return;

        try {
            let sanitizedExpression = this.expression
                .replace(/×/g, '*')
                .replace(/÷/g, '/');

            const openParens = (sanitizedExpression.match(/\(/g) || []).length;
            const closeParens = (sanitizedExpression.match(/\)/g) || []).length;
            if (openParens > closeParens) {
                sanitizedExpression += ')'.repeat(openParens - closeParens);
            }

            const evalResult = math.evaluate(sanitizedExpression);
            const result = math.format(evalResult, { precision: 14 }).toString();

            this.lastExpression = this.expression;
            this.addToHistory(this.expression, result);
            this.expression = result;
            this.isCalculated = true;
            this.updateDisplay();
        } catch (error) {
            this.mainDisplay.textContent = 'ERROR';
            this.expression = '';
            this.isCalculated = false;
            setTimeout(() => this.updateDisplay(), 1000);
        }
    }

    updateDisplay() {
        const formatForDisplay = (str) => {
            return str
                .replace(/\*/g, ' × ')
                .replace(/\//g, ' ÷ ')
                .replace(/\+/g, ' + ')
                .replace(/\-/g, ' - ')
                .replace(/\^/g, ' ^ ');
        };

        if (this.isCalculated) {
            this.previewDisplay.textContent = formatForDisplay(this.lastExpression) + ' =';
        } else {
            this.previewDisplay.textContent = formatForDisplay(this.expression);
        }

        this.mainDisplay.textContent = this.expression || '0';

        if (this.mainDisplay.textContent.length > 10) {
            this.mainDisplay.style.fontSize = '1.8rem';
        } else if (this.mainDisplay.textContent.length > 7) {
            this.mainDisplay.style.fontSize = '2.2rem';
        } else {
            this.mainDisplay.style.fontSize = '2.8rem';
        }
    }

    addToHistory(expr, res) {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.style.marginBottom = '4px';
        item.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        item.innerHTML = `<span style="opacity: 0.6">${expr} =</span> <span style="color: var(--accent-cyan)">${res}</span>`;

        this.historyLog.prepend(item);

        if (this.historyLog.childNodes.length > 5) {
            this.historyLog.removeChild(this.historyLog.lastChild);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new FuturisticCalculator();
});
