const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const fetch = require('node-fetch');
const OpenAPI = require('openapi-typescript-codegen');

const format = 'yaml'; // yaml or json
const specURL = 'https://raw.githubusercontent.com/openapitools/openapi-generator/master/modules/openapi-generator/src/test/resources/3_0/petstore.yaml';
const outputPath = path.resolve(path.join(__dirname, '..', '__generated__'));
const docFilePath = path.join(outputPath, `spec.${format}`);

const accessAsync = promisify(fs.access);
const mkdirAsync = promisify(fs.mkdir);
const writeFileAsync = promisify(fs.writeFile);

async function makeDirectory(path) {
  try {
    await accessAsync(path);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await mkdirAsync(path);
    }
    else {
      throw err;
    }
  }
}

async function run() {
  try {
    const response = await fetch(specURL);
    const data = await response.text();

    await makeDirectory(outputPath);
    await writeFileAsync(docFilePath, data);

    await OpenAPI.generate({
      input: docFilePath,
      output: outputPath,
      useOptions: true,
      useUnionTypes: true,
      exportSchemas: true,
      // httpClient: OpenAPI.HttpClient.XHR,
    });
  } catch (err) {
    console.error(err);
  }
}

run();
