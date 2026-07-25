const colors = {
    red: '#e11d2e',
    orange: '#f97316',
    yellow: '#facc15',
    green: '#22c55e',
    blue: '#2563eb',
    purple: '#9333ea'
};
const colorNamesEN = {
    red: 'RED',
    orange: 'ORANGE',
    yellow: 'YELLOW',
    green: 'GREEN',
    blue: 'BLUE',
    purple: 'PURPLE'
};
const allColorKeys = Object.keys(colors);
const gridContainer = document.getElementById('dice-grid');
const rollBtn = document.getElementById('roll-btn');
const megaBtn = document.getElementById('mega-btn');
const soundBtn = document.getElementById('sound-btn');
const selectTrigger = document.getElementById('custom-select-trigger');
const optionsList = document.getElementById('custom-options-list');
const selectedValueText = document.getElementById('selected-value-text');
const customOptions = document.querySelectorAll('.custom-option');
const selectedThemeText = document.getElementById('selected-theme-text');
const funkoFigure = document.querySelector('.funko-figure');
const funkoStage = document.querySelector('.funko-stage');
const voyageScreen = document.getElementById('voyage-screen');
const voyageShip = document.getElementById('voyage-ship');
const voyageColors = document.getElementById('voyage-colors');

let currentTheme = 'onepice';
let globalAudioCtx = null;
let isSoundEnabled = true;
let currentDiceCount = 3;

function initAudio() {
    if (!globalAudioCtx) globalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (globalAudioCtx.state === 'suspended') globalAudioCtx.resume();
}

function applyLoadedTheme() {
    document.body.className = 'onepice-theme';
    currentTheme = 'onepice';
    if (selectedThemeText) selectedThemeText.innerText = 'THEME: ONEPICE';
}

if (selectTrigger && optionsList) {
    selectTrigger.onclick = (e) => {
        initAudio();
        e.stopPropagation();
        selectTrigger.classList.toggle('dropdown-open');
        optionsList.classList.toggle('show-menu');
    };
}

customOptions.forEach(opt => {
    opt.onclick = (e) => {
        e.stopPropagation();
        currentDiceCount = parseInt(opt.dataset.value, 10);
        if (selectedValueText) selectedValueText.innerText = currentDiceCount + ' Dice';
        if (optionsList) optionsList.classList.remove('show-menu');
        if (selectTrigger) selectTrigger.classList.remove('dropdown-open');
        renderStartingDice();
    };
});

document.onclick = () => {
    if (optionsList) optionsList.classList.remove('show-menu');
    if (selectTrigger) selectTrigger.classList.remove('dropdown-open');
};

function playSound(type) {
    if (!isSoundEnabled) return;
    try {
        initAudio();
        const now = globalAudioCtx.currentTime;
        if (type === 'squeak') {
            playSqueakSound();
            return;
        }
        const osc = globalAudioCtx.createOscillator();
        const gainNode = globalAudioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(globalAudioCtx.destination);

        if (type === 'normal') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.exponentialRampToValueAtTime(520, now + 0.14);
            gainNode.gain.setValueAtTime(0.25, now);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.16);
            osc.start(now);
            osc.stop(now + 0.16);
        } else if (type === 'mega-start') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(90, now);
            osc.frequency.linearRampToValueAtTime(160, now + 0.35);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.35);
            osc.start(now);
            osc.stop(now + 0.35);
        } else if (type === 'mega-tick') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(620, now);
            gainNode.gain.setValueAtTime(0.08, now);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.04);
            osc.start(now);
            osc.stop(now + 0.04);
        } else if (type === 'mega-reveal') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(360, now);
            osc.frequency.exponentialRampToValueAtTime(920, now + 0.3);
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'confetti') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(280, now);
            osc.frequency.setValueAtTime(520, now + 0.12);
            osc.frequency.exponentialRampToValueAtTime(1050, now + 0.5);
            gainNode.gain.setValueAtTime(0.32, now);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        }
    } catch (e) {}
}

function playSqueakSound() {
    if (!globalAudioCtx) return;
    const now = globalAudioCtx.currentTime;
    
    // First squeak (press)
    const osc1 = globalAudioCtx.createOscillator();
    const gain1 = globalAudioCtx.createGain();
    const filter1 = globalAudioCtx.createBiquadFilter();
    
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(900, now);
    osc1.frequency.exponentialRampToValueAtTime(2200, now + 0.05);
    osc1.frequency.exponentialRampToValueAtTime(1300, now + 0.12);
    
    filter1.type = 'bandpass';
    filter1.frequency.setValueAtTime(2000, now);
    filter1.Q.setValueAtTime(1.0, now);
    
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.15, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    
    osc1.connect(filter1);
    filter1.connect(gain1);
    gain1.connect(globalAudioCtx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.14);
    
    // Second squeak (release/inhale), delayed by 0.16 seconds
    const releaseTime = now + 0.16;
    const osc2 = globalAudioCtx.createOscillator();
    const gain2 = globalAudioCtx.createGain();
    const filter2 = globalAudioCtx.createBiquadFilter();
    
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(800, releaseTime);
    osc2.frequency.exponentialRampToValueAtTime(1600, releaseTime + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(1100, releaseTime + 0.12);
    
    filter2.type = 'bandpass';
    filter2.frequency.setValueAtTime(1600, releaseTime);
    filter2.Q.setValueAtTime(1.0, releaseTime);
    
    gain2.gain.setValueAtTime(0.001, releaseTime);
    gain2.gain.linearRampToValueAtTime(0.08, releaseTime + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.001, releaseTime + 0.13);
    
    osc2.connect(filter2);
    filter2.connect(gain2);
    gain2.connect(globalAudioCtx.destination);
    
    osc2.start(releaseTime);
    osc2.stop(releaseTime + 0.14);
}

function triggerConfetti() {
    playSound('confetti');
    for (let i = 0; i < 100; i++) {
        const p = document.createElement('div');
        p.classList.add('confetti');
        p.style.backgroundColor = Object.values(colors)[Math.floor(Math.random() * allColorKeys.length)];
        p.style.left = Math.random() * 100 + 'vw';
        p.style.top = '-10px';
        p.style.transform = `scale(${Math.random() * 0.6 + 0.4})`;
        const duration = Math.random() * 2 + 2;
        const delay = Math.random() * 0.5;
        p.style.animation = `confettiFall ${duration}s linear ${delay}s forwards`;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), (duration + delay) * 1000);
    }
}

function checkSameColorMatch(rolledColors) {
    if (rolledColors.length > 1) {
        const first = rolledColors[0];
        const allSame = rolledColors.every(c => c === first);
        if (allSame) {
            reactFunko(first, true);
            setTimeout(triggerConfetti, 400);
            return;
        }
    }
    reactFunko(getDominantColor(rolledColors), false);
}

function getDominantColor(rolledColors) {
    const totals = rolledColors.reduce((acc, colorName) => {
        acc[colorName] = (acc[colorName] || 0) + 1;
        return acc;
    }, {});
    return rolledColors.reduce((best, colorName) => totals[colorName] > totals[best] ? colorName : best, rolledColors[0]);
}

function reactFunko(colorName, isTreasure) {
    if (!funkoFigure || !colorName) return;
    const reactionClass = isTreasure ? 'funko-treasure' : 'funko-react';
    funkoFigure.style.setProperty('--funko-reaction-color', colors[colorName]);
    funkoFigure.classList.remove('funko-react', 'funko-treasure');
    void funkoFigure.offsetWidth;
    funkoFigure.classList.add(reactionClass);
    setTimeout(() => funkoFigure.classList.remove(reactionClass), isTreasure ? 1150 : 860);
}

function buildDice(randomColorName, isNormal = false) {
    const diceWrapper = document.createElement('div');
    diceWrapper.classList.add('dice-wrapper');
    const dice = document.createElement('div');
    dice.classList.add('dice');
    const label = document.createElement('div');
    label.classList.add('dice-label');

    if (isNormal) {
        dice.classList.add('dice-normal', 'dice-glow-active');
        dice.style.backgroundColor = colors[randomColorName];
        dice.style.setProperty('--dice-glow-color', colors[randomColorName]);
        label.innerText = colorNamesEN[randomColorName];
        label.style.color = colors[randomColorName];
        label.style.setProperty('--dice-glow-color', colors[randomColorName]);
    } else {
        dice.classList.add('dice-mega-template');
        dice.innerText = '?';
        label.innerText = 'WAIT...';
        label.style.color = '#ffffff';
    }

    diceWrapper.appendChild(dice);
    diceWrapper.appendChild(label);
    return { wrapper: diceWrapper, dice, label, targetColor: randomColorName };
}

function buildRolledColors(count) {
    const pickRandom = () => allColorKeys[Math.floor(Math.random() * allColorKeys.length)];
    if (count < 2) return Array.from({ length: count }, () => pickRandom());

    // 65% chance of rolling at least one pair (same logic as kinder-colordice.vercel.app fallback)
    if (Math.random() * 100 >= 35) {
        const pairColor = pickRandom();
        const indices = Array.from({ length: count }, (_, i) => i);
        // Shuffle indices
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        // Force pairColor on first two shuffled indices
        const result = new Array(count);
        result[indices[0]] = pairColor;
        result[indices[1]] = pairColor;
        // Fill rest with random colors
        for (let i = 0; i < count; i++) {
            if (result[i] === undefined) {
                result[i] = pickRandom();
            }
        }
        return result;
    }

    // 35% chance of completely random roll
    return Array.from({ length: count }, () => pickRandom());
}

async function rollDice(count = 3, isMega = false) {
    if (rollBtn) rollBtn.disabled = true;
    if (megaBtn) megaBtn.disabled = true;
    const finalRolledColors = buildRolledColors(count);
    gridContainer.innerHTML = '';
    const diceElements = [];

    for (const randomColorName of finalRolledColors) {
        const block = buildDice(randomColorName, false);
        gridContainer.appendChild(block.wrapper);
        diceElements.push({ wrapper: block.wrapper, dice: block.dice, label: block.label, targetColor: randomColorName });
    }

    playSound(isMega ? 'mega-start' : 'mega-tick');
    await spinDice(diceElements, isMega ? 1250 : 760, isMega ? 38 : 62);
    if (isMega) {
        await playMainSailAway();
        await playVoyageScene(finalRolledColors);
    }
    playSound('normal');

    for (const item of diceElements) {
        revealDice(item, isMega);
        playSound(isMega ? 'mega-reveal' : 'mega-tick');
        await delay(isMega ? 180 : 90);
    }

    finishRoll(finalRolledColors);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function spinDice(diceElements, duration, intervalTime) {
    return new Promise(resolve => {
        let elapsed = 0;
        const roulette = setInterval(() => {
            playSound('mega-tick');
            diceElements.forEach(item => {
                item.dice.style.backgroundColor = colors[allColorKeys[Math.floor(Math.random() * allColorKeys.length)]];
            });
            elapsed += intervalTime;
            if (elapsed >= duration) {
                clearInterval(roulette);
                resolve();
            }
        }, intervalTime);
    });
}

async function playMainSailAway() {
    if (!funkoStage) return;
    funkoStage.classList.remove('mega-departing');
    void funkoStage.offsetWidth;
    funkoStage.classList.add('mega-departing');
    playSound('mega-start');
    await delay(1250);
}

async function playVoyageScene(rolledColors) {
    if (!voyageScreen || !voyageColors || !voyageShip) return;
    voyageColors.innerHTML = '';
    voyageScreen.querySelectorAll('.voyage-beam').forEach(beam => beam.remove());
    voyageScreen.classList.remove('hide');
    voyageScreen.classList.add('show');
    voyageScreen.setAttribute('aria-hidden', 'false');
    voyageShip.style.animation = 'none';
    void voyageShip.offsetWidth;
    voyageShip.style.animation = '';

    await delay(1550);

    for (const colorName of rolledColors) {
        showVoyageColor(colorName);
        playSound('mega-reveal');
        await delay(980);
    }

    await delay(900);
    voyageScreen.classList.add('hide');
    await delay(420);
    voyageScreen.classList.remove('show', 'hide');
    voyageScreen.setAttribute('aria-hidden', 'true');
    if (funkoStage) {
        funkoStage.classList.remove('mega-departing');
    }
}

function showVoyageColor(colorName) {
    if (!voyageColors || !voyageShip || !voyageScreen) return;
    const colorValue = colors[colorName];
    const tokenIndex = voyageColors.children.length;
    voyageShip.classList.remove('collecting');
    voyageShip.style.setProperty('--cast-color', colorValue);
    void voyageShip.offsetWidth;
    voyageShip.classList.add('collecting');
    setTimeout(() => voyageShip.classList.remove('collecting'), 650);

    const beam = document.createElement('span');
    beam.className = 'voyage-beam';
    beam.style.setProperty('--beam-color', colorValue);
    beam.style.setProperty('--beam-angle', `${(tokenIndex - 1) * 8}deg`);
    voyageScreen.appendChild(beam);
    setTimeout(() => beam.remove(), 900);

    const token = document.createElement('div');
    token.className = 'voyage-token';
    token.style.setProperty('--token-color', colorValue);
    token.textContent = colorNamesEN[colorName];
    voyageColors.appendChild(token);
}

function animateColorInsert(items) {
    if (!funkoFigure || !items.length) return;
    const funkoRect = funkoFigure.getBoundingClientRect();
    funkoFigure.classList.remove('funko-casting');
    void funkoFigure.offsetWidth;
    funkoFigure.classList.add('funko-casting');
    setTimeout(() => funkoFigure.classList.remove('funko-casting'), 620);

    items.forEach((item, index) => {
        const diceRect = item.dice.getBoundingClientRect();
        const handSide = index % 2 === 0 ? 0.28 : 0.72;
        const startX = funkoRect.left + funkoRect.width * handSide;
        const startY = funkoRect.top + funkoRect.height * 0.64;
        const endX = diceRect.left + diceRect.width / 2;
        const endY = diceRect.top + diceRect.height / 2;
        const arcTop = Math.min(startY, endY) - 90;
        const midX = (startX + endX) / 2;
        const orb = document.createElement('span');
        orb.className = 'color-orb';
        orb.style.setProperty('--orb-color', colors[item.targetColor]);
        orb.style.left = `${startX}px`;
        orb.style.top = `${startY}px`;
        document.body.appendChild(orb);
        orb.animate([
            { transform: 'translate(0px, 0px) scale(0.35)', opacity: 0 },
            { transform: `translate(${midX - startX}px, ${arcTop - startY}px) scale(1.15)`, opacity: 1, offset: 0.45 },
            { transform: `translate(${endX - startX}px, ${endY - startY}px) scale(0.95)`, opacity: 1, offset: 0.82 },
            { transform: `translate(${endX - startX}px, ${endY - startY}px) scale(1.45)`, opacity: 0 }
        ], {
            duration: 720,
            easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
            fill: 'forwards'
        });
        setTimeout(() => orb.remove(), 700);
    });
}

function revealDice(item, isMega = false) {
    const finalColor = item.targetColor;
    item.dice.innerText = '';
    item.dice.style.backgroundColor = colors[finalColor];
    item.dice.style.borderColor = '#fff7d6';
    item.dice.style.setProperty('--dice-glow-color', colors[finalColor]);
    item.dice.classList.remove('dice-mega-template');
    item.dice.classList.add(isMega ? 'dice-reveal' : 'dice-normal', 'dice-glow-active');
    item.label.innerText = colorNamesEN[finalColor];
    item.label.style.color = colors[finalColor];
    item.label.style.setProperty('--dice-glow-color', colors[finalColor]);
    item.label.style.display = 'block';
}

let rollHistory = [];
const MAX_HISTORY = 25;

function loadRollHistory() {
    try {
        const saved = localStorage.getItem('rollDiceHistory');
        if (saved) {
            rollHistory = JSON.parse(saved);
            if (!Array.isArray(rollHistory)) rollHistory = [];
        }
    } catch (e) {
        rollHistory = [];
    }
    renderHistoryUI();
}

function saveRollHistory() {
    try {
        localStorage.setItem('rollDiceHistory', JSON.stringify(rollHistory));
    } catch (e) {}
}

function addRollToHistory(rolledColors, rollType = 'normal') {
    const entry = {
        id: Date.now(),
        num: rollHistory.length + 1,
        colors: rolledColors,
        type: rollType,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    rollHistory.unshift(entry);
    if (rollHistory.length > MAX_HISTORY) rollHistory.pop();
    saveRollHistory();
    renderHistoryUI();
}

function renderHistoryUI() {
    const listEl = document.getElementById('history-list');
    const badgeEl = document.getElementById('history-count-badge');

    if (badgeEl) badgeEl.innerText = rollHistory.length;
    if (!listEl) return;

    if (rollHistory.length === 0) {
        listEl.innerHTML = '<div class="history-empty" id="history-empty">История пока пуста. Сделайте бросок!</div>';
        return;
    }

    listEl.innerHTML = '';
    rollHistory.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'history-item';

        const typeLabel = item.type === 'mega' ? '⚡ MEGA' : (item.type === 'hyper' ? '🔥 HYPER' : '🎲 ROLL');
        const typeClass = item.type === 'mega' ? 'type-mega' : (item.type === 'hyper' ? 'type-hyper' : 'type-normal');

        const colorChipsHtml = item.colors.map(colorName => {
            const hex = colors[colorName] || '#888';
            const nameEN = colorNamesEN[colorName] || String(colorName).toUpperCase();
            return `<span class="history-color-chip" style="background-color: ${hex};">${nameEN}</span>`;
        }).join('');

        itemEl.innerHTML = `
            <div class="history-item-meta">
                <span class="history-item-num">#${item.num}</span>
                <span class="history-item-type ${typeClass}">${typeLabel}</span>
            </div>
            <div class="history-item-colors">
                ${colorChipsHtml}
            </div>
        `;
        listEl.appendChild(itemEl);
    });
}

function initHistoryUI() {
    loadRollHistory();
    const wrap = document.getElementById('roll-history-wrap');
    const toggleBtn = document.getElementById('history-toggle-btn');
    const clearBtn = document.getElementById('history-clear-btn');

    if (!wrap || !toggleBtn) return;

    let isDragging = false;
    let startX = 0;
    let initialLeft = 0;
    let dragMoved = false;

    // Load saved position if available
    const savedLeft = localStorage.getItem('rollDiceHistoryLeft');
    if (savedLeft !== null && savedLeft !== '') {
        const leftVal = parseFloat(savedLeft);
        if (!isNaN(leftVal)) {
            wrap.style.left = leftVal + 'px';
            wrap.style.transform = 'translateX(-50%)';
        }
    }

    const onPointerDown = (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        isDragging = true;
        dragMoved = false;
        startX = e.clientX;

        const rect = wrap.getBoundingClientRect();
        initialLeft = rect.left + rect.width / 2;

        try {
            toggleBtn.setPointerCapture(e.pointerId);
        } catch (err) {}
        wrap.classList.add('dragging');
    };

    const onPointerMove = (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        if (Math.abs(deltaX) > 4) {
            dragMoved = true;
        }
        if (dragMoved) {
            let newLeft = initialLeft + deltaX;
            const width = wrap.offsetWidth || 320;
            const minLeft = width / 2 + 10;
            const maxLeft = window.innerWidth - width / 2 - 10;

            newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));
            wrap.style.left = newLeft + 'px';
            wrap.style.transform = 'translateX(-50%)';
        }
    };

    const onPointerEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;
        wrap.classList.remove('dragging');

        try {
            toggleBtn.releasePointerCapture(e.pointerId);
        } catch (err) {}

        if (dragMoved) {
            const rect = wrap.getBoundingClientRect();
            const currentLeft = rect.left + rect.width / 2;
            localStorage.setItem('rollDiceHistoryLeft', currentLeft);
        }
    };

    toggleBtn.addEventListener('pointerdown', onPointerDown);
    toggleBtn.addEventListener('pointermove', onPointerMove);
    toggleBtn.addEventListener('pointerup', onPointerEnd);
    toggleBtn.addEventListener('pointercancel', onPointerEnd);

    toggleBtn.onclick = (e) => {
        e.stopPropagation();
        if (!dragMoved) {
            wrap.classList.toggle('expanded');
        }
    };

    if (clearBtn) {
        clearBtn.onclick = (e) => {
            e.stopPropagation();
            rollHistory = [];
            saveRollHistory();
            renderHistoryUI();
        };
    }
}

function finishRoll(finalRolledColors, rollType = 'normal') {
    if (rollBtn) rollBtn.disabled = false;
    if (megaBtn) megaBtn.disabled = false;
    checkSameColorMatch(finalRolledColors);
    addRollToHistory(finalRolledColors, rollType);
}

function renderStartingDice() {
    if (!gridContainer) return;
    gridContainer.innerHTML = '';
    for (let i = 0; i < currentDiceCount; i++) {
        const block = buildDice(allColorKeys[Math.floor(Math.random() * allColorKeys.length)], false);
        gridContainer.appendChild(block.wrapper);
    }
}

if (soundBtn) {
    soundBtn.onclick = () => {
        initAudio();
        isSoundEnabled = !isSoundEnabled;
        soundBtn.innerText = isSoundEnabled ? 'SOUND: ON' : 'SOUND: OFF';
    };
}
if (rollBtn) rollBtn.onclick = () => { initAudio(); rollDice(currentDiceCount, false); };
if (megaBtn) megaBtn.onclick = () => { initAudio(); rollDice(currentDiceCount, true); };

if (funkoFigure) {
    funkoFigure.addEventListener('click', () => {
        initAudio();
        playSound('squeak');
        
        funkoFigure.classList.remove('squeaking');
        void funkoFigure.offsetWidth; // Trigger reflow to restart animation
        funkoFigure.classList.add('squeaking');
        
        setTimeout(() => {
            funkoFigure.classList.remove('squeaking');
        }, 350);
    });
}

function initEnterKeyRoll() {
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
            if (activeTag === 'input' || activeTag === 'textarea') return;

            if (rollBtn && !rollBtn.disabled) {
                initAudio();
                flashEnterHint();
                rollDice(currentDiceCount, false);
            }
        }
    });
    initPeriodicEnterHint();
}

function flashEnterHint() {
    const banner = document.getElementById('enter-hint-banner');
    if (banner) {
        banner.classList.add('visible');
        banner.style.transform = 'scale(1.12)';
        banner.style.background = 'rgba(192, 132, 252, 0.45)';
        setTimeout(() => {
            banner.style.transform = '';
            banner.style.background = '';
        }, 300);
    }
}

function initPeriodicEnterHint() {
    const banner = document.getElementById('enter-hint-banner');
    if (!banner) return;

    function popupBanner() {
        banner.classList.add('visible');
        setTimeout(() => {
            banner.classList.remove('visible');
        }, 4500);
    }

    setTimeout(popupBanner, 3000);
    setInterval(popupBanner, 14000);
}

function initPeriodicToast() {
    const hints = [
        "💡 Нажми ENTER на клавиатуре для быстрого броска!",
        "⚡ MEGA ROLL запускает эпическое морское путешествие!",
        "🔥 Воспользуйтесь кнопкой HYPER ROLL для эффектов!",
        "📜 Нажмите на панель ИСТОРИИ БРОСКОВ внизу, чтобы посмотреть результаты!"
    ];
    let index = 0;

    let toastEl = document.getElementById('floating-toast-popup');
    if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.id = 'floating-toast-popup';
        toastEl.className = 'floating-toast-popup';
        document.body.appendChild(toastEl);
    }

    function showToast() {
        toastEl.innerHTML = `<span style="font-size: 18px;">💡</span> <span>${hints[index]}</span>`;
        toastEl.classList.add('show');

        setTimeout(() => {
            toastEl.classList.remove('show');
        }, 4500);

        index = (index + 1) % hints.length;
    }

    setTimeout(showToast, 4000);
    setInterval(showToast, 18000);
}

function initButtonAudioEffects() {
    const playPleasantClickSound = () => {
        if (!isSoundEnabled) return;
        try {
            initAudio();
            if (!globalAudioCtx) return;
            const now = globalAudioCtx.currentTime;

            // Smooth light tactile pop
            const osc = globalAudioCtx.createOscillator();
            const gain = globalAudioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1150, now);
            osc.frequency.exponentialRampToValueAtTime(450, now + 0.026);

            gain.gain.setValueAtTime(0.07, now);
            gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.026);

            osc.connect(gain);
            gain.connect(globalAudioCtx.destination);

            osc.start(now);
            osc.stop(now + 0.026);
        } catch (e) {}
    };

    const createButtonRipple = (e) => {
        const btn = e.target && e.target.closest ? e.target.closest('button, .btn, .sound-toggle-btn, .character-control-btn, .theme-badge, .counter-btn, .custom-option, .custom-theme-option, .editor-icon-btn, .history-clear-btn, .roll-history-toggle') : null;
        if (!btn) return;

        const rect = btn.getBoundingClientRect();
        const circle = document.createElement('span');
        const diameter = Math.max(rect.width, rect.height);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - rect.left - radius}px`;
        circle.style.top = `${e.clientY - rect.top - radius}px`;
        circle.className = 'btn-click-ripple';

        btn.appendChild(circle);
        setTimeout(() => circle.remove(), 600);
    };

    document.body.addEventListener('click', (e) => {
        const target = e.target;
        if (target && target.closest && target.closest('button, .btn, .sound-toggle-btn, .character-control-btn, .theme-badge, .counter-btn, .custom-option, .custom-theme-option, .editor-icon-btn, .history-clear-btn, .roll-history-toggle')) {
            playPleasantClickSound();
            createButtonRipple(e);
        }
    }, true);
}

function triggerFunkoPopExplosion(x, y, container) {
    playPleasantClickSound();

    const colors = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#c084fc', '#ffffff'];
    const count = 14;

    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'funko-pop-particle';
        const color = colors[Math.floor(Math.random() * colors.length)];
        p.style.setProperty('--part-color', color);
        p.style.left = x + 'px';
        p.style.top = y + 'px';

        const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.5);
        const dist = 40 + Math.random() * 80;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;

        p.style.setProperty('--tx', tx + 'px');
        p.style.setProperty('--ty', ty + 'px');

        container.appendChild(p);
        setTimeout(() => p.remove(), 650);
    }
}

function renderLoadingFunkos() {
    const funkosContainer = document.getElementById('loading-funkos-container');
    if (!funkosContainer) return;
    funkosContainer.innerHTML = '';

    const activeThemeObj = themes[currentTheme] || themes['onepice'];
    const activeCharacterSrc = (customThemeCharacters && customThemeCharacters[currentTheme]) 
        ? customThemeCharacters[currentTheme].image 
        : activeThemeObj.image;

    const funkoList = [
        activeCharacterSrc,
        './Roll Color Dice_files/onepice-funko-cutout.png',
        './Roll Color Dice_files/meowl.png',
        './Roll Color Dice_files/strawberry-elephant.png',
        './Roll Color Dice_files/minion.png',
        './Roll Color Dice_files/cerberus.png',
        './Roll Color Dice_files/pokoyo.png'
    ];

    const count = 6;
    const activeFunkos = [];
    let animationFrameId = null;

    function spawnFunko(srcIndex) {
        const imgSrc = funkoList[srcIndex % funkoList.length];
        const img = document.createElement('img');
        img.className = 'floating-funko-pop';
        img.src = imgSrc;
        img.draggable = false;

        const size = 110;
        const containerRect = funkosContainer.getBoundingClientRect();
        const maxX = Math.max(10, (containerRect.width || window.innerWidth) - size - 10);
        const maxY = Math.max(10, (containerRect.height || window.innerHeight) - size - 10);

        const state = {
            element: img,
            x: Math.random() * maxX,
            y: Math.random() * maxY,
            vx: (Math.random() - 0.5) * 2.8,
            vy: (Math.random() - 0.5) * 2.8,
            rot: (Math.random() - 0.5) * 20,
            vRot: (Math.random() - 0.5) * 0.8,
            isDragging: false,
            lastPointerX: 0,
            lastPointerY: 0,
            pointerVx: 0,
            pointerVy: 0,
            isPopped: false
        };

        img.style.left = state.x + 'px';
        img.style.top = state.y + 'px';

        const onPointerDown = (e) => {
            if (state.isPopped) return;
            e.stopPropagation();
            state.isDragging = true;
            img.classList.add('is-dragging');

            state.lastPointerX = e.clientX;
            state.lastPointerY = e.clientY;
            state.pointerVx = 0;
            state.pointerVy = 0;

            try {
                img.setPointerCapture(e.pointerId);
            } catch (err) {}
        };

        const onPointerMove = (e) => {
            if (!state.isDragging || state.isPopped) return;
            const dx = e.clientX - state.lastPointerX;
            const dy = e.clientY - state.lastPointerY;

            state.pointerVx = dx;
            state.pointerVy = dy;

            state.x += dx;
            state.y += dy;

            state.lastPointerX = e.clientX;
            state.lastPointerY = e.clientY;

            img.style.left = state.x + 'px';
            img.style.top = state.y + 'px';
        };

        const onPointerUp = (e) => {
            if (!state.isDragging || state.isPopped) return;
            state.isDragging = false;
            img.classList.remove('is-dragging');

            state.vx = state.pointerVx * 1.2;
            state.vy = state.pointerVy * 1.2;

            const speed = Math.hypot(state.vx, state.vy);

            const rect = funkosContainer.getBoundingClientRect();
            const hitWall = (state.x <= 15 || state.x >= (rect.width || window.innerWidth) - size - 15 || state.y <= 15 || state.y >= (rect.height || window.innerHeight) - size - 15);

            if (speed > 11 || (speed > 6 && hitWall)) {
                popFunko(state);
            }
        };

        img.addEventListener('pointerdown', onPointerDown);
        img.addEventListener('pointermove', onPointerMove);
        img.addEventListener('pointerup', onPointerUp);
        img.addEventListener('pointercancel', onPointerUp);

        funkosContainer.appendChild(img);
        activeFunkos.push(state);
    }

    function popFunko(state) {
        if (state.isPopped) return;
        state.isPopped = true;

        const rect = state.element.getBoundingClientRect();
        const containerRect = funkosContainer.getBoundingClientRect();
        const centerX = rect.left - containerRect.left + rect.width / 2;
        const centerY = rect.top - containerRect.top + rect.height / 2;

        triggerFunkoPopExplosion(centerX, centerY, funkosContainer);

        state.element.remove();
        const idx = activeFunkos.indexOf(state);
        if (idx !== -1) activeFunkos.splice(idx, 1);

        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen && loadingScreen.style.display !== 'none' && !loadingScreen.classList.contains('fade-out')) {
                spawnFunko(Math.floor(Math.random() * funkoList.length));
            }
        }, 900);
    }

    for (let i = 0; i < count; i++) {
        spawnFunko(i);
    }

    function updatePhysics() {
        const containerRect = funkosContainer.getBoundingClientRect();
        const width = containerRect.width || window.innerWidth;
        const height = containerRect.height || window.innerHeight;

        const size = 110;

        activeFunkos.forEach((state) => {
            if (state.isDragging || state.isPopped) return;

            state.x += state.vx;
            state.y += state.vy;
            state.rot += state.vRot;

            state.vx *= 0.985;
            state.vy *= 0.985;

            if (Math.abs(state.vx) < 0.6) state.vx += (Math.random() - 0.5) * 0.3;
            if (Math.abs(state.vy) < 0.6) state.vy += (Math.random() - 0.5) * 0.3;

            const maxW = width - size;
            const maxH = height - size;

            const speed = Math.hypot(state.vx, state.vy);

            if (state.x <= 0) {
                state.x = 0;
                if (speed > 10) { popFunko(state); return; }
                state.vx = Math.abs(state.vx) * 0.9;
            } else if (state.x >= maxW) {
                state.x = maxW;
                if (speed > 10) { popFunko(state); return; }
                state.vx = -Math.abs(state.vx) * 0.9;
            }

            if (state.y <= 0) {
                state.y = 0;
                if (speed > 10) { popFunko(state); return; }
                state.vy = Math.abs(state.vy) * 0.9;
            } else if (state.y >= maxH) {
                state.y = maxH;
                if (speed > 10) { popFunko(state); return; }
                state.vy = -Math.abs(state.vy) * 0.9;
            }

            state.element.style.left = state.x + 'px';
            state.element.style.top = state.y + 'px';
            state.element.style.transform = `rotate(${state.rot}deg)`;
        });

        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && loadingScreen.style.display !== 'none') {
            animationFrameId = requestAnimationFrame(updatePhysics);
        }
    }

    animationFrameId = requestAnimationFrame(updatePhysics);
}

function initLoadingScreen() {
    const screen = document.getElementById('loading-screen');
    const barFill = document.getElementById('loading-bar-fill');
    const percentEl = document.getElementById('loading-percentage');
    const statusEl = document.getElementById('loading-status');

    if (!screen || !barFill || !percentEl) return;

    renderLoadingFunkos();

    let progress = 0;
    let isFinished = false;

    const statuses = [
        "ПОДГОТОВКА ЭПИЧЕСКОЙ ИГРЫ...",
        "НАСТРОЙКА ШАНСОВ 65%...",
        "ЗАГРУЗКА ЦВЕТОВ И ТЕМ...",
        "ПОЧТИ ГОТОВО! ПРИГОТОВЬТЕСЬ..."
    ];

    function updateProgress() {
        barFill.style.width = Math.min(100, Math.floor(progress)) + '%';
        percentEl.innerText = Math.min(100, Math.floor(progress)) + '%';

        const statusIdx = Math.min(statuses.length - 1, Math.floor((progress / 100) * statuses.length));
        if (statusEl) statusEl.innerText = statuses[statusIdx];

        if (progress >= 100 && !isFinished) {
            isFinished = true;
            clearInterval(progressInterval);

            setTimeout(() => {
                screen.classList.add('fade-out');
                setTimeout(() => {
                    screen.style.display = 'none';
                }, 700);
            }, 250);
        }
    }

    const progressInterval = setInterval(() => {
        if (progress < 100) {
            progress += 2.4 + Math.random() * 3.2;
            updateProgress();
        }
    }, 45);
}

applyLoadedTheme();
renderStartingDice();
initHistoryUI();
initEnterKeyRoll();
initPeriodicToast();
initButtonAudioEffects();
initLoadingScreen();

