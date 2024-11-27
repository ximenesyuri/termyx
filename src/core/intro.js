export function displayIntro(terminal) {
    const introElement = document.createElement('pre');
    introElement.className = 'intro-text';
    introElement.textContent = `
   /$$                                                          
  | $$                                                          
 /$$$$$$    /$$$$$$   /$$$$$$  /$$$$$$/$$$$  /$$   /$$ /$$   /$$
|_  $$_/   /$$__  $$ /$$__  $$| $$_  $$_  $$| $$  | $$|  $$ /$$/
  | $$    | $$$$$$$$| $$  \__/| $$ \ $$ \ $$| $$  | $$ \  $$$$/ 
  | $$ /$$| $$_____/| $$      | $$ | $$ | $$| $$  | $$  >$$  $$ 
  |  $$$$/|  $$$$$$$| $$      | $$ | $$ | $$|  $$$$$$$ /$$/\  $$
   \___/   \_______/|__/      |__/ |__/ |__/ \____  $$|__/  \__/
                                             /$$  | $$          
                                            |  $$$$$$/          
                                             \______/           
    `;
    terminal.appendChild(introElement);
}

