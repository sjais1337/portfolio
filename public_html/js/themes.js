/**
 * Theme Manager
 * Handles theme customization, presets, and persistence.
 */

const ThemeManager = {
    // Preset theme definitions
    presets: {
        matrix: {
            name: 'Matrix',
            accent: '#00ee00',
            bg: '#000000',
            text: '#ffffff',
            dim: '#888888'
        },
        classic: {
            name: 'Classic',
            accent: '#ffffff',
            bg: '#000000',
            text: '#ffffff',
            dim: '#aaaaaa'
        },
        powershell: {
            name: 'PowerShell',
            accent: '#3b78ff',
            bg: '#012456',
            text: '#ffffff',
            dim: '#6699cc'
        },
        sakura: {
            name: 'Sakura',
            accent: '#ff6b9d',
            bg: '#1a0a10',
            text: '#fff0f5',
            dim: '#cc8899'
        },
        hotpink: {
            name: 'Hot Pink',
            accent: '#ff1493',
            bg: '#0d0d0d',
            text: '#ffffff',
            dim: '#ff69b4'
        },
        doom: {
            name: 'Doom',
            accent: '#ff0000',
            bg: '#1a0000',
            text: '#ffcc00',
            dim: '#8b0000'
        }
    },

    // Current state
    state: {
        currentPreset: 'matrix',
        customColors: {
            accent: '#00ee00',
            bg: '#000000',
            text: '#ffffff'
        },
        crtEnabled: true,
        flickerEnabled: true,
        fontSize: 14,
        fontFamily: "'Fira Code', monospace"
    },

    // DOM elements (populated on init)
    elements: {},

    /**
     * Initialize the theme manager
     */
    init() {
        this.cacheElements();
        this.loadFromStorage();
        this.applyCurrentTheme();
        this.bindEvents();
        this.updateUI();
    },

    /**
     * Cache DOM element references
     */
    cacheElements() {
        this.elements = {
            panel: document.getElementById('theme-panel'),
            toggle: document.getElementById('themes-toggle'),
            closeBtn: document.getElementById('theme-panel-close'),
            presetBtns: document.querySelectorAll('.theme-preset-btn'),
            fontBtns: document.querySelectorAll('.font-btn'),
            colorAccent: document.getElementById('color-accent'),
            colorBg: document.getElementById('color-bg'),
            colorText: document.getElementById('color-text'),
            toggleCrt: document.getElementById('toggle-crt'),
            toggleFlicker: document.getElementById('toggle-flicker'),
            crtOverlay: document.getElementById('crt-overlay'),
            crtFlicker: document.getElementById('crt-flicker'),
            fontSizeSlider: document.getElementById('font-size-slider'),
            fontSizeValue: document.getElementById('font-size-value')
        };
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Panel toggle
        this.elements.toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePanel();
        });

        // Close button
        if (this.elements.closeBtn) {
            this.elements.closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closePanel();
            });
        }

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.elements.panel.contains(e.target) && 
                !this.elements.toggle.contains(e.target)) {
                this.closePanel();
            }
        });

        // Preset buttons
        this.elements.presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                this.applyPreset(theme);
            });
        });

        // Font buttons
        this.elements.fontBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const font = btn.dataset.font;
                this.setFont(font);
            });
        });

        // Custom color inputs
        this.elements.colorAccent.addEventListener('input', (e) => {
            this.setCustomColor('accent', e.target.value);
        });
        this.elements.colorBg.addEventListener('input', (e) => {
            this.setCustomColor('bg', e.target.value);
        });
        this.elements.colorText.addEventListener('input', (e) => {
            this.setCustomColor('text', e.target.value);
        });

        // Effect toggles
        this.elements.toggleCrt.addEventListener('click', () => {
            this.toggleCrt();
        });
        this.elements.toggleFlicker.addEventListener('click', () => {
            this.toggleFlicker();
        });

        // Font size slider
        if (this.elements.fontSizeSlider) {
            this.elements.fontSizeSlider.addEventListener('input', (e) => {
                this.setFontSize(parseInt(e.target.value, 10));
            });
        }
    },

    /**
     * Toggle the theme panel visibility
     */
    togglePanel() {
        this.elements.panel.classList.toggle('hidden');
    },

    /**
     * Close the theme panel
     */
    closePanel() {
        this.elements.panel.classList.add('hidden');
    },

    /**
     * Apply a preset theme
     */
    applyPreset(presetName) {
        const preset = this.presets[presetName];
        if (!preset) return;

        this.state.currentPreset = presetName;
        this.state.customColors = {
            accent: preset.accent,
            bg: preset.bg,
            text: preset.text
        };

        this.applyCurrentTheme();
        this.updateUI();
        this.saveToStorage();
    },

    /**
     * Set a custom color (clears preset selection)
     */
    setCustomColor(type, color) {
        this.state.currentPreset = null; // Clear preset when customizing
        this.state.customColors[type] = color;
        this.applyCurrentTheme();
        this.updateUI();
        this.saveToStorage();
    },

    /**
     * Apply the current theme colors to CSS variables
     */
    applyCurrentTheme() {
        const root = document.documentElement;
        const colors = this.state.customColors;

        root.style.setProperty('--accent-color', colors.accent);
        root.style.setProperty('--bg-color', colors.bg);
        root.style.setProperty('--text-color', colors.text);

        // Calculate lighter background for code blocks, etc.
        const bgLight = this.lightenColor(colors.bg, 15);
        root.style.setProperty('--bg-color-light', bgLight);

        // Calculate dim color (60% opacity of text)
        const dimColor = this.hexToRgba(colors.text, 0.6);
        root.style.setProperty('--text-dim', dimColor);

        // Update CRT scanline color based on accent
        const scanlineColor = this.hexToRgba(colors.accent, 0.15);
        root.style.setProperty('--crt-scanline', scanlineColor);

        // Update flicker overlay color
        if (this.elements.crtFlicker) {
            const flickerColor = this.hexToRgba(colors.accent, 0.03);
            this.elements.crtFlicker.style.background = flickerColor;
        }
        
        // Apply font size
        root.style.setProperty('--font-size-base', `${this.state.fontSize}px`);
        
        // Apply font family
        root.style.setProperty('--font-family', this.state.fontFamily);
    },

    /**
     * Set font size
     */
    setFontSize(size) {
        this.state.fontSize = Math.max(10, Math.min(24, size)); // Clamp 10-24
        document.documentElement.style.setProperty('--font-size-base', `${this.state.fontSize}px`);
        this.updateUI();
        this.saveToStorage();
    },

    /**
     * Set font family
     */
    setFont(fontFamily) {
        this.state.fontFamily = fontFamily;
        document.documentElement.style.setProperty('--font-family', fontFamily);
        this.updateUI();
        this.saveToStorage();
    },

    /**
     * Toggle CRT scanlines
     */
    toggleCrt() {
        this.state.crtEnabled = !this.state.crtEnabled;
        this.elements.crtOverlay.style.display = this.state.crtEnabled ? 'block' : 'none';
        this.updateUI();
        this.saveToStorage();
    },

    /**
     * Toggle CRT flicker effect
     */
    toggleFlicker() {
        this.state.flickerEnabled = !this.state.flickerEnabled;
        this.elements.crtFlicker.style.display = this.state.flickerEnabled ? 'block' : 'none';
        this.updateUI();
        this.saveToStorage();
    },

    /**
     * Update UI to reflect current state
     */
    updateUI() {
        // Update preset buttons
        this.elements.presetBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === this.state.currentPreset);
        });

        // Update font buttons
        this.elements.fontBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.font === this.state.fontFamily);
        });

        // Update color inputs
        this.elements.colorAccent.value = this.state.customColors.accent;
        this.elements.colorBg.value = this.state.customColors.bg;
        this.elements.colorText.value = this.state.customColors.text;

        // Update toggle buttons
        this.elements.toggleCrt.textContent = this.state.crtEnabled ? 'ON' : 'OFF';
        this.elements.toggleCrt.classList.toggle('active', this.state.crtEnabled);
        
        this.elements.toggleFlicker.textContent = this.state.flickerEnabled ? 'ON' : 'OFF';
        this.elements.toggleFlicker.classList.toggle('active', this.state.flickerEnabled);
        
        // Update font size slider
        if (this.elements.fontSizeSlider) {
            this.elements.fontSizeSlider.value = this.state.fontSize;
        }
        if (this.elements.fontSizeValue) {
            this.elements.fontSizeValue.textContent = `${this.state.fontSize}px`;
        }
    },

    /**
     * Save state to localStorage
     */
    saveToStorage() {
        const data = {
            preset: this.state.currentPreset,
            colors: this.state.customColors,
            crt: this.state.crtEnabled,
            flicker: this.state.flickerEnabled,
            fontSize: this.state.fontSize,
            fontFamily: this.state.fontFamily
        };
        localStorage.setItem('systemj-theme', JSON.stringify(data));
    },

    /**
     * Load state from localStorage
     */
    loadFromStorage() {
        try {
            const data = JSON.parse(localStorage.getItem('systemj-theme'));
            if (data) {
                this.state.currentPreset = data.preset || 'matrix';
                this.state.customColors = data.colors || this.presets.matrix;
                this.state.crtEnabled = data.crt !== false;
                this.state.flickerEnabled = data.flicker !== false;
                this.state.fontSize = data.fontSize || 14;
                this.state.fontFamily = data.fontFamily || "'Fira Code', monospace";
            }
        } catch (e) {
            console.warn('Failed to load theme from storage:', e);
        }
    },

    /**
     * Convert hex color to rgba
     */
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    /**
     * Lighten a hex color by a given amount (0-255)
     */
    lightenColor(hex, amount) {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        
        r = Math.min(255, r + amount);
        g = Math.min(255, g + amount);
        b = Math.min(255, b + amount);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
};

// Initialize when DOM is ready (after App loads)
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure other elements are ready
    setTimeout(() => ThemeManager.init(), 100);
});
