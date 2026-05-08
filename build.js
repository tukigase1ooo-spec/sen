const fs = require('fs');
function sync(varName, jsonPath, jsPath) {
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  fs.writeFileSync(jsPath, `window.${varName} = ${JSON.stringify(data, null, 2)};\n`);
}
sync('__ILLUSTRATIONS__', 'data/illustrations.json', 'data/illustrations.js');
sync('__WORKS__', 'data/works.json', 'data/works.js');
