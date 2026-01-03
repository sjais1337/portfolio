/**
 * Main Application Logic
 * Handles boot sequence, navigation, and content rendering.
 */

const App = {
    elements: {
        bootTerminal: document.getElementById('boot-terminal'),
        contentPane: document.getElementById('content-pane'),
        blogContent: document.getElementById('blog-content'),
        navPane: document.getElementById('nav-pane'),
        navList: document.getElementById('nav-list'),
        interfaceElements: document.querySelectorAll('.interface-element'),
        statusText: document.getElementById('status-text'),
        clock: document.getElementById('clock')
    },

    state: {
        booted: false, // To ensure that content won't be loaded unless we are booted.
        currentPath: '/'
    },

    config: {
        ansiLogo: [
            "█████████████████████████████████████████████████████████",
            "█████████████████████████████████████████████████████████",
            "█████████████████████████████████████████████████████████",
            "█████████████████████████████████████████████████████████",
            "████████████████████████████████████████▒▒▒██████████████",
            "█████████████████████████▓▓▓▓▓▓▓█████▒░░░░░▓█████████████",
            "████████████████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒░░░░░░▓███████████████",
            "█████████████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒░░░░░░▒▓█████████████████",
            "███████████████▓▓▓▓▓▓▓▓▓▓▓▓▓▒░░░░░░░▒▓▓▓▓▓███████████████",
            "██████████████▓▓▓▓▓▓▓▓▓▓▓▒░░░░░▒▒▓▒░▓▓▒▒░░░░▓████████████",
            "████████████▓▓▓▓▓▓▓▓▓▒░░░░░▒▓▓▓▓▓▒░░░░░░░▒▓▓▓████████████",
            "███████████▓▓▓▓▓▒░░░░▒▓▓▓▓▓▓▓▓░░░░░░▒▓▓▓▓▓▓▓▓▓███████████",
            "███████████▒░░▒▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░▒▓▓▓▓▓▓▓▓▓▓▓███████████",
            "██████████▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░▒▓▓▓▒░▒▒▒▒░░░░░░░▒▓██████████",
            "██████████▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░▒▒▒▒▒▒▒░░░░▒██████████",
            "██████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒░▒▓▓▓▒▒▒░░░░░▓▓██████████",
            "██████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒░░░░░░░░░▒▓▓▓▓▓██████████",
            "██████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒░░░░░░░▒▓▓▓▓▓▓▓▓▓▓██████████",
            "███████████▓▓▓▓▓▓▓▓▓▓▓▓▒░░░░░░░░▒▓▓▓▓▓▓▓▓▓▓▓▓▓███████████",
            "███████████▓▓▓▓▓▓▓▓░░░░░░░▓▓▓▒░▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓███████████",
            "████████████▓▓▓▒░░░░░░▓▓▓▓▓▓░░▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓████████████",
            "█████████████▒░░░░░▒▓▓▓▓▓▓▒░░▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓█████████████",
            "███████████▓░░░░░▓▓▓▓▓▓▓▓░░░▒▓▓▓▓▓▓▓▓▓▓▓▓▓███████████████",
            "██████████▓░░░░▒█▓▓▓▓▓▒░░░▒▓▓▓▓▓▓▓▓▓▓▓▓▓█████████████████",
            "██████████▓░░░░░▓▓▓▒░░░░░▓▓▓▓▓▓▓▓▓▓▓▓████████████████████",
            "███████████▒░░░░░░░░░░▒██▓▓▓▓▓▓▓▓████████████████████████",
            "█████████████▓▒░░░▒▓█████████████████████████████████████",
            "█████████████████████████████████████████████████████████",
            "█████████████████████████████████████████████████████████",
            "█████████████████████████████████████████████████████████",
            "█████████████████████████████████████████████████████████"
        ],
        bootSequence: [
            { text: "> J-BIOS (C) 2025 System Technologies", delay: 100 },
            { text: "> Checking Memory: 64MB OK", delay: 150 },
            { text: "> Loading GPU Microcode...", delay: 100 },
            { text: "> Mounting File System...", delay: 150 },

            // Highlight: The final statement usually
            { text: "\n> SYSTEM READY.", delay: 400, highlight: true },
        ]
    },

    init() {
        this.runBootSequence(); // Runs the introduction sequence 
        this.startClock(); // Starts the clock on the bottom right
        this.loadManifest(); // Build up the index 
    },

    runBootSequence() {
        let textIndex = 0;
        const runText = () => {
            if (textIndex < this.config.bootSequence.length) {
                const step = this.config.bootSequence[textIndex];
                const lineDiv = document.createElement('div');
                
                // Configure and append new text elements.
                lineDiv.className = step.highlight ? 'boot-line boot-highlight' : 'boot-line';
                lineDiv.textContent = step.text;
                this.elements.bootTerminal.appendChild(lineDiv);
                textIndex++;

                setTimeout(runText, step.delay);
            } else {
                // Once all text elements have been added run the logo sequence.
                setTimeout(() => this.runLogoSequence(), 500); 
            }
        };
        runText();
    },

    runLogoSequence() {
        let logoIndex = 0;
        const runLogo = () => {
            // While we are still on the logo, keep rendering the logo.

            if (logoIndex < this.config.ansiLogo.length) {
                if(logoIndex === 0) {
                    this.elements.bootTerminal.appendChild(document.createElement('br'));
                }

                const pre = document.createElement('pre');
                pre.className = "logo-line";
                pre.textContent = this.config.ansiLogo[logoIndex]; 
                this.elements.bootTerminal.appendChild(pre);
                
                logoIndex++;
                setTimeout(runLogo, 10); 
            } else {
                // Render the blinking cursor once logo rendering is over.

                const cursor = document.createElement('span');
                cursor.className = 'blinking-cursor';
                cursor.innerHTML = "&nbsp;";
                this.elements.bootTerminal.appendChild(document.createElement('br'));
                this.elements.bootTerminal.appendChild(cursor);
                
                setTimeout(() => this.transitionToOS(), 1500);
            }

        };
        runLogo();
    },

    transitionToOS() {
        this.elements.bootTerminal.innerHTML = "";
        this.elements.contentPane.classList.remove('boot-mode');
        this.elements.blogContent.style.display = 'block';
        
        this.elements.navPane.classList.remove('booting');
        this.elements.interfaceElements.forEach(el => el.classList.add('interface-active'));
        this.elements.statusText.textContent = "STATUS: ONLINE | MODE: VIEW";
        
        this.state.booted = true;
        this.loadContent('pages/intro.md'); // Load default content
    },

    startClock() {
        setInterval(() => {
            const now = new Date();
            this.elements.clock.textContent = now.toISOString().slice(0,10) + " " + now.toLocaleTimeString([], { hour12: false });
        }, 1000);
    },

    async loadManifest() {
        try {
            const response = await fetch('content/manifest.json');
            if (!response.ok) throw new Error('Manifest not found');
            const manifest = await response.json();
            this.renderNavigation(manifest);
        } catch (e) {
            console.error("Failed to load manifest", e);
            this.elements.statusText.textContent = "ERROR: MANIFEST LOAD FAILED";
        }
    },

    renderNavigation(manifest) {
        this.elements.navList.innerHTML = '';
        
        // Add "Up" directory (visual only for now)
        const upItem = document.createElement('li');
        upItem.className = 'nav-item';
        upItem.innerHTML = '<span><span class="dir-label">[DIR]</span> ..</span>';
        this.elements.navList.appendChild(upItem);

        manifest.files.forEach(file => {
            const li = document.createElement('li');
            li.className = 'nav-item';
            li.innerHTML = `<span><span class="dir-label">[FILE]</span> ${file.title}</span>`;
            li.onclick = () => this.loadContent(file.path);
            this.elements.navList.appendChild(li);
        });
    },

    async loadContent(path) {
        if (!this.state.booted) return;

        this.elements.statusText.textContent = `STATUS: LOADING ${path}...`;
        
        try {
            const response = await fetch(`content/${path}`);
            if (!response.ok) throw new Error(`File not found: ${path}`);
            const text = await response.text();

            const html = Parser.parse(text);
            this.elements.blogContent.innerHTML = `<article>${html}</article>`;
            this.elements.statusText.textContent = "STATUS: ONLINE | MODE: VIEW";
        } catch (e) {
            this.elements.blogContent.innerHTML = `<article><h1>Error</h1><p>Failed to load content: ${e.message}</p></article>`;
            this.elements.statusText.textContent = "STATUS: ERROR";
        }
    }
};

window.onload = () => App.init();
