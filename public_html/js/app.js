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
        clock: document.getElementById('clock'),
        logoWatermark: document.getElementById('logo-watermark'),
        // New elements
        breadcrumb: document.getElementById('breadcrumb'),
        systemStats: document.getElementById('system-stats'),
        tocSection: document.getElementById('toc-section'),
        tocList: document.getElementById('toc-list'),
        readingModeToggle: document.getElementById('reading-mode-toggle'),
        mainStage: document.getElementById('main-stage')
    },

    state: {
        booted: false, // To ensure that content won't be loaded unless we are booted.
        currentPath: '/',
        currentFolder: null, // null = root, otherwise folder name
        manifest: null, // Cached manifest data
        readingMode: false, // Reading mode toggle
        bootTime: Date.now() // For uptime calculation
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
        this.setupRouting(); // Enable hash-based URL routing for shareable links
        this.setupReadingMode(); // Setup reading mode toggle
        this.startSystemStats(); // Start fake system stats
    },

    /**
     * Sets up hash-based routing so articles can be shared via URL.
     * Example: https://site.com/#blog/concurrency_guide.md
     */
    setupRouting() {
        window.addEventListener('hashchange', () => {
            if (this.state.booted) {
                const path = this.getPathFromHash();
                if (path) {
                    this.loadContent(path, false); // false = don't update hash again
                }
            }
        });
    },

    /**
     * Extracts the content path from the URL hash.
     * Returns null if hash is empty or invalid.
     */
    getPathFromHash() {
        const hash = window.location.hash.slice(1); // Remove the '#'
        if (hash && hash.endsWith('.md')) {
            return hash;
        }
        return null;
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
        
        // Render the logo watermark in the bottom-right corner
        this.renderLogoWatermark();
        
        this.state.booted = true;
        
        // Check if URL has a hash to load specific content (for shared links)
        const hashPath = this.getPathFromHash();
        if (hashPath) {
            this.loadContent(hashPath, false);
        } else {
            this.loadContent('index.md'); // Load default content (root index)
        }
    },

    /**
     * Renders the ASCII logo as a small watermark in the bottom-right corner.
     */
    renderLogoWatermark() {
        if (!this.elements.logoWatermark) return;
        
        const pre = document.createElement('pre');
        pre.textContent = this.config.ansiLogo.join('\n');
        this.elements.logoWatermark.appendChild(pre);
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
            this.state.manifest = manifest;
            this.renderNavigation();
        } catch (e) {
            console.error("Failed to load manifest", e);
            this.elements.statusText.textContent = "ERROR: MANIFEST LOAD FAILED";
        }
    },

    /**
     * Renders the navigation list based on current folder state.
     * If currentFolder is null, shows root view (folders + root files).
     * If currentFolder is set, shows files in that folder.
     */
    renderNavigation() {
        if (!this.state.manifest) return;
        
        this.elements.navList.innerHTML = '';
        const manifest = this.state.manifest;

        if (this.state.currentFolder === null) {
            // ROOT VIEW: Show folders and root files
            
            // Add non-functional ".." at root (visual only)
            const upItem = document.createElement('li');
            upItem.className = 'nav-item nav-item-disabled';
            upItem.innerHTML = '<span><span class="dir-label">[DIR]</span> ..</span>';
            this.elements.navList.appendChild(upItem);

            // Add folders
            if (manifest.folders) {
                manifest.folders.forEach(folder => {
                    const li = document.createElement('li');
                    li.className = 'nav-item';
                    li.innerHTML = `<span><span class="dir-label">[DIR]</span> ${folder.displayName}</span>`;
                    li.onclick = () => this.navigateToFolder(folder.name);
                    this.elements.navList.appendChild(li);
                });
            }

            // Add root files
            if (manifest.rootFiles) {
                manifest.rootFiles.forEach(file => {
                    const li = document.createElement('li');
                    li.className = 'nav-item';
                    li.innerHTML = `<span><span class="dir-label">[FILE]</span> ${file.title}</span>`;
                    li.onclick = () => this.loadContent(file.path);
                    this.elements.navList.appendChild(li);
                });
            }
        } else {
            // FOLDER VIEW: Show files in the current folder
            
            // Add functional ".." to go back to root
            const upItem = document.createElement('li');
            upItem.className = 'nav-item';
            upItem.innerHTML = '<span><span class="dir-label">[DIR]</span> ..</span>';
            upItem.onclick = () => this.navigateToFolder(null);
            this.elements.navList.appendChild(upItem);

            // Find the current folder's data
            const folder = manifest.folders.find(f => f.name === this.state.currentFolder);
            if (folder && folder.files) {
                folder.files.forEach(file => {
                    const li = document.createElement('li');
                    li.className = 'nav-item';
                    li.innerHTML = `<span><span class="dir-label">[FILE]</span> ${file.title}</span>`;
                    li.onclick = () => this.loadContent(file.path);
                    this.elements.navList.appendChild(li);
                });
            }
        }
    },

    /**
     * Navigates to a folder (or root if folderName is null).
     */
    navigateToFolder(folderName) {
        this.state.currentFolder = folderName;
        this.renderNavigation();
        
        // Update status to show current location
        if (folderName) {
            const folder = this.state.manifest.folders.find(f => f.name === folderName);
            const displayName = folder ? folder.displayName : folderName;
            this.elements.statusText.textContent = `STATUS: BROWSING /${displayName}`;
        } else {
            this.elements.statusText.textContent = "STATUS: ONLINE | MODE: VIEW";
        }
    },

    async loadContent(path, updateHash = true) {
        if (!this.state.booted) return;

        this.elements.statusText.textContent = `STATUS: LOADING ${path}...`;
        
        try {
            const response = await fetch(`content/${path}`);
            if (!response.ok) throw new Error(`File not found: ${path}`);
            const text = await response.text();

            const html = Parser.parse(text);
            this.elements.blogContent.innerHTML = `<article>${html}</article>`;
            this.elements.statusText.textContent = "STATUS: ONLINE | MODE: VIEW";
            
            // Update the URL hash so the link is shareable
            if (updateHash) {
                history.pushState(null, '', `#${path}`);
            }
            
            this.state.currentPath = path;
            
            // Auto-navigate to the correct folder in the nav pane
            const pathParts = path.split('/');
            if (pathParts.length > 1) {
                // File is in a folder, navigate to that folder
                const folderName = pathParts[0];
                if (this.state.currentFolder !== folderName) {
                    this.state.currentFolder = folderName;
                    this.renderNavigation();
                }
            } else {
                // File is at root
                if (this.state.currentFolder !== null) {
                    this.state.currentFolder = null;
                    this.renderNavigation();
                }
            }
            
            // Update UI for new content
            this.updateBreadcrumb(path);
            this.highlightActiveNav();
            this.renderTableOfContents();
            
        } catch (e) {
            this.elements.blogContent.innerHTML = `<article><h1>Error</h1><p>Failed to load content: ${e.message}</p></article>`;
            this.elements.statusText.textContent = "STATUS: ERROR";
        }
    },

    /**
     * Updates the breadcrumb display in the status bar.
     */
    updateBreadcrumb(path) {
        if (!this.elements.breadcrumb) return;
        
        if (!path || path === 'index.md') {
            this.elements.breadcrumb.textContent = '~/';
            return;
        }

        const parts = path.replace('.md', '').split('/');
        let breadcrumb = '~/';
        
        if (parts.length > 1) {
            // File in folder - show folder name prettified
            const folder = this.state.manifest?.folders?.find(f => f.name === parts[0]);
            const folderName = folder ? folder.displayName : parts[0];
            breadcrumb += `${folderName}/`;
        }
        
        // Add file title if available
        const file = this.findFileByPath(path);
        if (file) {
            breadcrumb += file.title;
        } else {
            breadcrumb += parts[parts.length - 1];
        }
        
        this.elements.breadcrumb.textContent = breadcrumb;
    },

    /**
     * Finds a file object by its path in the manifest.
     */
    findFileByPath(path) {
        if (!this.state.manifest) return null;
        
        // Check root files
        const rootFile = this.state.manifest.rootFiles?.find(f => f.path === path);
        if (rootFile) return rootFile;
        
        // Check folder files
        for (const folder of (this.state.manifest.folders || [])) {
            const file = folder.files?.find(f => f.path === path);
            if (file) return file;
        }
        return null;
    },

    /**
     * Generates and renders the table of contents from headings.
     * Creates a proper hierarchical tree structure.
     */
    renderTableOfContents() {
        if (!this.elements.tocSection || !this.elements.tocList) return;
        
        const article = this.elements.blogContent.querySelector('article');
        if (!article) {
            this.elements.tocSection.classList.add('hidden');
            return;
        }

        // Get all headings including H1
        const headings = article.querySelectorAll('h1, h2, h3, h4');
        if (headings.length < 2) {
            this.elements.tocSection.classList.add('hidden');
            return;
        }

        this.elements.tocList.innerHTML = '';
        let tocIndex = 0;
        
        // Track hierarchy for tree structure
        let currentH1 = null;
        let currentH2 = null;
        let currentH3 = null;

        headings.forEach((heading) => {
            const id = `toc-target-${tocIndex++}`;
            heading.id = id;
            
            const level = parseInt(heading.tagName.charAt(1));
            const li = document.createElement('li');
            li.className = `toc-item toc-level-${level}`;
            
            // Add tree branch character based on level
            let prefix = '';
            if (level === 1) {
                prefix = '◆ ';
            } else if (level === 2) {
                prefix = '├─ ';
            } else if (level === 3) {
                prefix = '│  ├─ ';
            } else if (level === 4) {
                prefix = '│  │  ├─ ';
            }
            
            li.innerHTML = `<span class="toc-prefix">${prefix}</span><span class="toc-text">${heading.textContent}</span>`;
            li.onclick = () => {
                heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
            };
            this.elements.tocList.appendChild(li);
        });

        this.elements.tocSection.classList.remove('hidden');
    },

    /**
     * Setup reading mode toggle.
     */
    setupReadingMode() {
        if (this.elements.readingModeToggle) {
            this.elements.readingModeToggle.onclick = () => this.toggleReadingMode();
        }
        
        // Load saved state
        const saved = localStorage.getItem('systemj-reading-mode');
        if (saved === 'true') {
            this.state.readingMode = true;
            this.elements.mainStage?.classList.add('reading-mode');
            if (this.elements.readingModeToggle) {
                this.elements.readingModeToggle.textContent = '◧ Focus ✓';
            }
        }
    },

    /**
     * Toggle reading mode (hide nav, center content).
     */
    toggleReadingMode() {
        this.state.readingMode = !this.state.readingMode;
        
        if (this.state.readingMode) {
            this.elements.mainStage?.classList.add('reading-mode');
            if (this.elements.readingModeToggle) {
                this.elements.readingModeToggle.textContent = '◧ Focus ✓';
            }
        } else {
            this.elements.mainStage?.classList.remove('reading-mode');
            if (this.elements.readingModeToggle) {
                this.elements.readingModeToggle.textContent = '◧ Focus';
            }
        }
        
        localStorage.setItem('systemj-reading-mode', this.state.readingMode);
    },

    /**
     * Start the fake system stats display (Easter egg).
     */
    startSystemStats() {
        if (!this.elements.systemStats) return;

        const updateStats = () => {
            // Fake CPU temp (fluctuates between 42-58°C)
            const cpuTemp = 42 + Math.floor(Math.random() * 16);
            
            // Fake memory (fluctuates between 23-47%)
            const memUsage = 23 + Math.floor(Math.random() * 24);
            
            // Real uptime since page load
            const uptimeMs = Date.now() - this.state.bootTime;
            const uptimeSec = Math.floor(uptimeMs / 1000);
            const hours = Math.floor(uptimeSec / 3600);
            const mins = Math.floor((uptimeSec % 3600) / 60);
            const secs = uptimeSec % 60;
            const uptimeStr = hours > 0 
                ? `${hours}h${mins.toString().padStart(2, '0')}m`
                : `${mins}m${secs.toString().padStart(2, '0')}s`;

            this.elements.systemStats.textContent = `CPU: ${cpuTemp}°C | MEM: ${memUsage}% | UP: ${uptimeStr}`;
        };

        // Update every 3 seconds
        updateStats();
        setInterval(updateStats, 3000);
    },

    /**
     * Highlights the active file in the navigation.
     */
    highlightActiveNav() {
        const navItems = this.elements.navList.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
        });

        // Find and highlight the current file
        const currentFile = this.findFileByPath(this.state.currentPath);
        if (currentFile) {
            navItems.forEach(item => {
                if (item.textContent.includes(currentFile.title)) {
                    item.classList.add('active');
                }
            });
        }
    }
};

window.onload = () => App.init();
