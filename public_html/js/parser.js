/**
 * Markdown Parser
 * A lightweight, extensible regex-based Markdown parser.
 * 
 * PARSING ORDER MATTERS:
 * 1. First, protect code blocks and inline code (so their contents aren't parsed)
 * 2. Then parse block-level elements (headers, lists, blockquotes)
 * 3. Then parse inline elements (bold, italic, links)
 * 4. Finally, restore protected content
 */

const Parser = {
    // Temporary storage for protected content
    _protected: {},
    _protectIndex: 0,

    /**
     * Protects a string from further parsing by replacing it with a placeholder.
     */
    _protect(content) {
        const placeholder = `__PROTECTED_${this._protectIndex++}__`;
        this._protected[placeholder] = content;
        return placeholder;
    },

    /**
     * Restores all protected content.
     */
    _restore(html) {
        let result = html;
        for (const [placeholder, content] of Object.entries(this._protected)) {
            result = result.split(placeholder).join(content);
        }
        return result;
    },

    /**
     * Escapes HTML entities in code blocks.
     */
    _escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    },

    /**
     * Main parse function.
     */
    parse(markdown) {
        // Reset protection state
        this._protected = {};
        this._protectIndex = 0;
        
        // Store reference to this for use in callbacks
        const self = this;

        let html = markdown;

        // ============================================
        // PHASE 1: PROTECT CODE (must be first!)
        // ============================================

        // Fenced code blocks with optional language (```lang ... ```)
        html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, function(match, lang, code) {
            const escaped = self._escapeHtml(code.trim());
            const langAttr = lang ? ` data-lang="${lang}"` : '';
            const placeholder = `%%CODEBLOCK_${self._protectIndex++}%%`;
            self._protected[placeholder] = `<pre class="code-block"${langAttr}><code>${escaped}</code></pre>`;
            return `\n\n${placeholder}\n\n`;
        });

        // Inline code - protect with unique markers
        html = html.replace(/`([^`]+)`/g, function(match, code) {
            const escaped = self._escapeHtml(code);
            const placeholder = `%%INLINE_${self._protectIndex++}%%`;
            self._protected[placeholder] = `<code class="inline-code">${escaped}</code>`;
            return placeholder;
        });

        // ============================================
        // PHASE 2: CUSTOM BLOCKS (:::meta, etc.)
        // ============================================

        // Metadata box
        html = html.replace(/:::meta\n([\s\S]*?)\n:::/g, (match, content) => {
            const lines = content.split('\n').filter(l => l.trim());
            let box = '<div class="ascii-box"><div class="meta-grid">';
            lines.forEach(line => {
                const colonIndex = line.indexOf(':');
                if (colonIndex > -1) {
                    const key = line.substring(0, colonIndex).trim();
                    const val = line.substring(colonIndex + 1).trim();
                    box += `<span class="meta-label">${key}:</span><span>${val}</span>`;
                }
            });
            box += '</div></div>';
            return box;
        });

        // ============================================
        // PHASE 3: BLOCK-LEVEL ELEMENTS
        // ============================================

        // Images (before links, since syntax is similar)
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, 
            '<figure class="image-container"><img src="$2" alt="$1" loading="lazy"><figcaption>$1</figcaption></figure>');

        // Headers (must check for full line match)
        html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
        html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gm, '<h1 class="post-title">$1</h1>');

        // Horizontal rule / separator (must be alone on line)
        html = html.replace(/^---$/gm, '<div class="ascii-separator">// ─────────────────────────────── //</div>');

        // Blockquotes - handle consecutive lines (check for > at start of line)
        html = html.replace(/^> (.*)$/gm, '<bq>$1</bq>');
        // Merge consecutive blockquote lines
        html = html.replace(/(<bq>.*<\/bq>\n?)+/g, (match) => {
            const content = match
                .replace(/<bq>/g, '')
                .replace(/<\/bq>\n?/g, ' ')
                .trim();
            return `<blockquote>${content}</blockquote>`;
        });

        // Ordered lists
        html = html.replace(/^(\d+)\. (.*)$/gm, '<oli data-num="$1">$2</oli>');
        // Wrap consecutive ordered list items
        html = html.replace(/(<oli[^>]*>.*<\/oli>\n?)+/g, (match) => {
            const items = match.replace(/<oli data-num="(\d+)">/g, '<li>').replace(/<\/oli>/g, '</li>');
            return `<ol class="styled-list">${items}</ol>`;
        });

        // Unordered lists
        html = html.replace(/^[\-\*] (.*)$/gm, '<uli>$1</uli>');
        // Wrap consecutive unordered list items
        html = html.replace(/(<uli>.*<\/uli>\n?)+/g, (match) => {
            const items = match.replace(/<uli>/g, '<li>').replace(/<\/uli>/g, '</li>');
            return `<ul class="styled-list">${items}</ul>`;
        });

        // ============================================
        // PHASE 4: INLINE ELEMENTS
        // ============================================

        // Links - Smart handling for internal .md files vs external links
        // Uses a more robust regex that handles nested brackets in link text (e.g., "[YT] Title")
        html = html.replace(/\[([^\[\]]*(?:\[[^\[\]]*\][^\[\]]*)*)\]\(([^)]+)\)/g, (match, text, url) => {
            if (url.endsWith('.md')) {
                return `<a href="#${url}" onclick="App.loadContent('${url}'); return false;">${text}</a>`;
            } else {
                return `<a href="${url}" target="_blank" rel="noopener">${text}</a>`;
            }
        });

        // Bold (** or __)
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

        // Italic (* or _) - be careful not to match inside words for underscore
        html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
        html = html.replace(/(?<![a-zA-Z0-9])_([^_]+)_(?![a-zA-Z0-9])/g, '<em>$1</em>');

        // LaTeX Math (basic support - styled display, no actual rendering)
        // Block math $$...$$
        html = html.replace(/\$\$([^$]+)\$\$/g, '<div class="math-block">$1</div>');
        // Inline math $...$
        html = html.replace(/\$([^$\n]+)\$/g, '<span class="math-inline">$1</span>');

        // ============================================
        // PHASE 5: PARAGRAPHS
        // ============================================

        // Split by double newlines and wrap non-block content in <p>
        const blocks = html.split(/\n\n+/);
        html = blocks.map(block => {
            block = block.trim();
            if (!block) return '';
            // Don't wrap if already a block element or a placeholder
            if (/^<(h[1-6]|div|pre|ul|ol|blockquote|figure|p)/.test(block)) {
                return block;
            }
            if (/^%%CODEBLOCK_\d+%%$/.test(block)) {
                return block;
            }
            return `<p>${block.replace(/\n/g, ' ')}</p>`;
        }).join('\n');

        // ============================================
        // PHASE 6: RESTORE PROTECTED CONTENT
        // ============================================

        // Restore all protected content
        for (const [placeholder, content] of Object.entries(this._protected)) {
            html = html.split(placeholder).join(content);
        }

        return html;
    },

    /**
     * Adds a custom parsing rule (applied during parse).
     * @param {string} id - Unique identifier for the rule
     * @param {RegExp} regex - Pattern to match
     * @param {string|function} handler - Replacement string or function
     */
    addRule(id, regex, handler) {
        this._customRules = this._customRules || [];
        this._customRules.push({ id, regex, handler });
    }
};
