const fs = require('fs');
console.log("Applicazione PM2 avviata...");

setInterval(() => {
  const time = new Date().toISOString();
  console.log(`[${time}] Il server sta funzionando...`);
}, 1000); // Scrive un log ogni secondo
