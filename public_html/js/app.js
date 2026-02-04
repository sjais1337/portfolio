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
        navToggle: document.getElementById('nav-toggle'),
        tocToggle: document.getElementById('toc-toggle'),
        mainStage: document.getElementById('main-stage'),
        tuiContainer: document.getElementById('tui-container')
    },

    state: {
        booted: false, // To ensure that content won't be loaded unless we are booted.
        currentPath: '/',
        currentFolder: null, // null = root, otherwise folder name
        manifest: null, // Cached manifest data
        focusMode: false, // Focus mode toggle
        navVisible: true, // Navigation panel visibility
        tocVisible: true, // Table of contents visibility
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
        this.setupPanelToggles(); // Setup nav/toc/focus toggles
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
     * Uses tree-style prefixes like the `tree` command.
     */
    renderTableOfContents() {
        if (!this.elements.tocSection || !this.elements.tocList) return;
        
        const article = this.elements.blogContent.querySelector('article');
        if (!article) {
            this.elements.tocSection.classList.add('hidden');
            return;
        }

        // Get all headings including H1
        const headings = Array.from(article.querySelectorAll('h1, h2, h3, h4'));
        if (headings.length < 2) {
            this.elements.tocSection.classList.add('hidden');
            return;
        }

        this.elements.tocList.innerHTML = '';
        
        // Build tree structure to determine which items are last at each level
        const items = headings.map((h, i) => ({
            heading: h,
            level: parseInt(h.tagName.charAt(1)),
            index: i
        }));

        items.forEach((item, i) => {
            const { heading, level } = item;
            const id = `toc-target-${i}`;
            heading.id = id;
            
            const li = document.createElement('li');
            li.className = `toc-item toc-level-${level}`;
            
            // Build tree prefix
            let prefix = '';
            
            if (level === 1) {
                // H1: no prefix, it's a root
                prefix = '';
            } else {
                // For each level, determine if we need │ or space
                // and whether this is the last item at this level
                const isLastAtLevel = this.isLastHeadingAtLevel(items, i, level);
                
                // Build the continuation lines for parent levels
                for (let l = 2; l < level; l++) {
                    // Check if there are more items at level l after this point
                    const hasMoreAtParentLevel = this.hasMoreHeadingsAtLevel(items, i, l);
                    prefix += hasMoreAtParentLevel ? '│  ' : '   ';
                }
                
                // Add the branch for current level
                prefix += isLastAtLevel ? '└─ ' : '├─ ';
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
     * Check if this is the last heading at the given level within its parent scope.
     */
    isLastHeadingAtLevel(items, currentIndex, level) {
        // Look ahead for more items at the same level before hitting a lower level number
        for (let i = currentIndex + 1; i < items.length; i++) {
            if (items[i].level < level) {
                // Hit a parent level, so current was last in its section
                return true;
            }
            if (items[i].level === level) {
                // Found another at same level
                return false;
            }
        }
        // Reached end of list
        return true;
    },

    /**
     * Check if there are more headings at the given level after currentIndex.
     */
    hasMoreHeadingsAtLevel(items, currentIndex, level) {
        for (let i = currentIndex + 1; i < items.length; i++) {
            if (items[i].level < level) {
                // Hit a parent, stop looking
                return false;
            }
            if (items[i].level === level) {
                return true;
            }
        }
        return false;
    },

    /**
     * Setup panel visibility toggles (Nav, TOC, Focus mode).
     */
    setupPanelToggles() {
        // Nav toggle
        if (this.elements.navToggle) {
            this.elements.navToggle.onclick = () => this.toggleNav();
        }
        
        // TOC toggle
        if (this.elements.tocToggle) {
            this.elements.tocToggle.onclick = () => this.toggleToc();
        }
        
        // Focus mode toggle
        if (this.elements.readingModeToggle) {
            this.elements.readingModeToggle.onclick = () => this.toggleFocusMode();
        }
        
        // Load saved states
        const savedNav = localStorage.getItem('systemj-nav-visible');
        const savedToc = localStorage.getItem('systemj-toc-visible');
        const savedFocus = localStorage.getItem('systemj-focus-mode');
        
        // Apply saved nav state
        if (savedNav === 'false') {
            this.state.navVisible = false;
            this.elements.tuiContainer?.classList.add('nav-hidden');
            this.updateToggleButton(this.elements.navToggle, '☰ Nav', false);
        }
        
        // Apply saved toc state
        if (savedToc === 'false') {
            this.state.tocVisible = false;
            this.elements.tuiContainer?.classList.add('toc-hidden');
            this.updateToggleButton(this.elements.tocToggle, '≡ TOC', false);
        }
        
        // Apply saved focus state
        if (savedFocus === 'true') {
            this.state.focusMode = true;
            this.elements.tuiContainer?.classList.add('focus-mode');
            this.updateToggleButton(this.elements.readingModeToggle, '◧ Focus', true);
        }
    },

    /**
     * Toggle navigation panel visibility.
     */
    toggleNav() {
        // If focus mode is on, exit focus mode and show nav (don't toggle nav off)
        if (this.state.focusMode) {
            this.state.focusMode = false;
            this.elements.tuiContainer?.classList.remove('focus-mode');
            this.updateToggleButton(this.elements.readingModeToggle, '◧ Focus', false);
            localStorage.setItem('systemj-focus-mode', false);
            // Nav is already visible in focus mode state, just update UI
            this.state.navVisible = true;
            this.elements.tuiContainer?.classList.remove('nav-hidden');
            this.updateToggleButton(this.elements.navToggle, '☰ Nav', true);
            localStorage.setItem('systemj-nav-visible', true);
            return;
        }
        
        this.state.navVisible = !this.state.navVisible;
        
        if (this.state.navVisible) {
            this.elements.tuiContainer?.classList.remove('nav-hidden');
        } else {
            this.elements.tuiContainer?.classList.add('nav-hidden');
        }
        
        this.updateToggleButton(this.elements.navToggle, '☰ Nav', this.state.navVisible);
        localStorage.setItem('systemj-nav-visible', this.state.navVisible);
    },

    /**
     * Toggle table of contents visibility.
     */
    toggleToc() {
        this.state.tocVisible = !this.state.tocVisible;
        
        if (this.state.tocVisible) {
            this.elements.tuiContainer?.classList.remove('toc-hidden');
        } else {
            this.elements.tuiContainer?.classList.add('toc-hidden');
        }
        
        this.updateToggleButton(this.elements.tocToggle, '≡ TOC', this.state.tocVisible);
        localStorage.setItem('systemj-toc-visible', this.state.tocVisible);
    },

    /**
     * Toggle focus mode (hide nav, keep TOC, minimal status bar).
     */
    toggleFocusMode() {
        this.state.focusMode = !this.state.focusMode;
        
        if (this.state.focusMode) {
            this.elements.tuiContainer?.classList.add('focus-mode');
            // Remove nav-hidden class if it was set independently
            this.elements.tuiContainer?.classList.remove('nav-hidden');
            this.state.navVisible = true;
            this.updateToggleButton(this.elements.navToggle, '☰ Nav', true);
            
            // Auto-enable TOC when entering focus mode
            if (!this.state.tocVisible) {
                this.state.tocVisible = true;
                this.elements.tuiContainer?.classList.remove('toc-hidden');
                this.updateToggleButton(this.elements.tocToggle, '≡ TOC', true);
                localStorage.setItem('systemj-toc-visible', true);
            }
        } else {
            this.elements.tuiContainer?.classList.remove('focus-mode');
            // The toc state remains as user set it
        }
        
        this.updateToggleButton(this.elements.readingModeToggle, '◧ Focus', this.state.focusMode);
        localStorage.setItem('systemj-focus-mode', this.state.focusMode);
    },

    /**
     * Update toggle button text to show active state.
     */
    updateToggleButton(element, baseText, isActive) {
        if (element) {
            element.textContent = isActive ? `${baseText} ✓` : baseText;
        }
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
