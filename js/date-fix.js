(function () {
    function updateDate() {
        // Get current date in Sao Paulo
        const now = new Date();
        const options = { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' };
        const dateStr = now.toLocaleDateString('pt-BR', options); // dd/mm/yyyy
        const shortDate = dateStr.slice(0, 5); // dd/mm

        // 1. Target specific classes if they exist (future proofing)
        const dateElements = document.querySelectorAll('.current-date, .today-date, .date-display');
        dateElements.forEach(el => {
            el.textContent = dateStr;
        });

        // 2. Find text nodes containing "HOJE" and append/replace date
        // Walker to find text nodes
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        const nodes = [];
        while (node = walker.nextNode()) {
            nodes.push(node); // Store to avoid iterator invalidation during modification
        }

        nodes.forEach(node => {
            const text = node.nodeValue;

            // If text contains "HOJE" (case insensitive)
            // and NOT already containing a date (to avoid double replace if run twice)
            if (text.toUpperCase().includes('HOJE') && !text.match(/\d{2}\/\d{2}/)) {
                // Replace "HOJE" with "HOJE, dd/mm"
                // preserving original case if possible, but safe default is "HOJE, dd/mm"
                const newText = text.replace(/HOJE/i, `HOJE, ${shortDate}`);
                node.nodeValue = newText;
            }

            // 3. Fix potential "wrong" dates (simple heuristic: find dd/mm that isn't today)
            // This is risky if there are birthdates etc. Only use if absolutely sure.
            // For now, let's just log if we find dates.
            // const dateMatch = text.match(/(\d{2})\/(\d{2})/);
            // if (dateMatch) { ... }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateDate);
    } else {
        updateDate();
    }
})();
