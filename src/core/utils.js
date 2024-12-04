export function navigateTo(path, fileSystem) {
    const normalizedPath = normalizePath(path);
    const parts = normalizedPath.split('/').filter(part => part.length > 0);

    let currentDir = fileSystem;
    for (const part of parts) {
        if (currentDir && typeof currentDir === 'object' && part in currentDir) {
            currentDir = currentDir[part];
        } else {
            return undefined; // Returns undefined if part doesn't exist in directory
        }
    }
    return currentDir;
}


export function scrollToBottom(terminal) {
    terminal.scrollTop = terminal.scrollHeight;
}

export function isValidPath(path, fileSystem) {
    if (typeof path !== 'string' || !path) return false;
    return !!navigateTo(path, fileSystem);
}

export function getDirectoryAndFileName(path, fileSystem) {
    const parts = path.split('/');
    const fileName = parts.pop();
    let dirPath = parts.join('/');
    if (!dirPath) dirPath = '/';

    const directory = navigateTo(dirPath, fileSystem);
    return { directory, fileName };
}

export function normalizePath(path) {
    const parts = path.split('/');
    const stack = [];

    for (const part of parts) {
        if (part === '..') {
            if (stack.length > 0) stack.pop();
        } else if (part && part !== '.') {
            stack.push(part);
        }
    }

    return '' + stack.join('/');
}

export function escapeHtml(text) {
    return text.replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;")
               .replace(/'/g, "&#039;");
}

export function generateRange(start, end) {
    const range = [];
    const startNum = parseInt(start, 10);
    const endNum = parseInt(end, 10);
    for (let i = startNum; i <= endNum; i++) {
        range.push(i);
    }
    return range;
}

export function parseArrayExpression(expression, terminalState) {
    const indexPattern = /^!([a-zA-Z_][a-zA-Z0-9_]*)\[@\]$/;
    const arrayPattern = /^([a-zA-Z_][a-zA-Z0-9_]*)\[@\]$/;

    if (expression.match(indexPattern)) {
        const arrayName = expression.match(indexPattern)[1];
        if (arrayName in terminalState.variables && Array.isArray(terminalState.variables[arrayName])) {
            return Object.keys(terminalState.variables[arrayName]);  // Returns indices of the array
        }
    } else if (expression.match(arrayPattern)) {
        const arrayName = expression.match(arrayPattern)[1];
        if (arrayName in terminalState.variables && Array.isArray(terminalState.variables[arrayName])) {
            return terminalState.variables[arrayName];  // Returns elements of the array
        }
    }

    console.warn(`Expression does not refer to a valid array: ${expression}`);
    return [];
}
