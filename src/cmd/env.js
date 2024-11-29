export function env(args, terminalState) {
    if (!terminalState || !terminalState.envs) {
        return 'Environment variables not loaded.';
    }

    return Object.entries(terminalState.envs).map(([key, value]) => `${key}=${value}`).join('\n');
}

