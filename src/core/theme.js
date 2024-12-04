async function applyTheme(themeName, terminalState) {
   try {
       const response = await fetch(`./themes/${themeName}.json`);
       if (!response.ok) {
           throw new Error(`Theme '${themeName}' not found.`);
       }

       const themeConfig = await response.json();

       const root = document.documentElement;
       for (const key in themeConfig) {
           if (Object.hasOwnProperty.call(themeConfig, key)) {
               root.style.setProperty(`--${key}`, `#${themeConfig[key]}`);
           }
       }
       
       terminalState.envs['TERMYX_THEME'] = themeName;
       console.log(`Theme set to '${themeName}'.`);

   } catch (error) {
       console.error('Error applying theme:', error);
       return `Theme '${themeName}' does not exist`;
   }
}

export function setTheme(args, terminalState) {
    if (args.length !== 1) {
        return `usage: TERMYX_THEME=<theme-name>`;
    }

    const themeName = args[0];
    applyTheme(themeName, terminalState);
}
