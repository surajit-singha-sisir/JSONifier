const fs = require('fs');
const { convertMarkdownToSchoolJson } = require('./converter.js');

const mdContent = fs.readFileSync('/home/user/uploads/dshst.md', 'utf-8');
const generated = convertMarkdownToSchoolJson(mdContent);

const expected = JSON.parse(fs.readFileSync('/home/user/uploads/school_new.json', 'utf-8'));

// Compare them
console.log('Generated keys:', Object.keys(generated));
console.log('Expected keys:', Object.keys(expected));

const genSchool = generated.school_data[0];
const expSchool = expected.school_data[0];

let differences = 0;

for (const key of Object.keys(expSchool)) {
  const genVal = genSchool[key];
  const expVal = expSchool[key];
  const genStr = JSON.stringify(genVal);
  const expStr = JSON.stringify(expVal);
  
  if (genStr !== expStr) {
    console.log(`Difference in key [${key}]:`);
    console.log('  Expected:', expStr);
    console.log('  Generated:', genStr);
    differences++;
  } else {
    console.log(`Key [${key}] matches perfectly!`);
  }
}

if (differences === 0) {
  console.log('Success! The generated JSON is identical to the template for dshst.md!');
} else {
  console.log(`Found ${differences} difference(s) between generated and expected.`);
}
