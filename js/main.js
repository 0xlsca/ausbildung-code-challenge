const fileInput = $("#file-input");
const content = $("#content");

let inputFile = null;
let tableData = null;

let table = null;

const papaConfig = {
  header: true,
  complete: receiveInput,
};

function handleNewFile(evt) {
  // sets the input file, removes the input field and starts the table creation process
  inputFile = evt.target.files[0];
  parseFile();
  disableFileInput();
  showLoadingScreen();
}

function disableFileInput() {
  // disables the file input
  fileInput.remove();
}

function createTable() {
  // fills the content div with the table
  content.append("<div id='csv-table'></div>");

  // make tabulator
  table = new Tabulator("#csv-table", {
    height: $(window).height() * 0.9, // maximum height without too much overhead
    data: tableData.data, //assign data to table
    layout: "fitColumns", //fit columns to width of table (optional)
    columns: makeColumns(tableData.meta.fields),
    pagination: "local",
  });

}

function makeColumns(header) {
  // creates a valid columns object for tabulator from a simple csv header

  let ret = [];

  Array.from(header).forEach(column => ret.push({title:column, field:column, editor:true }));

  return ret;

}

function parseFile() {
  // parses the file and assigns the result to the variable
  Papa.parse(inputFile, papaConfig);
}

function receiveInput(results, file) {
  // receives input after a csv file was parsed
  tableData = results;
  console.log("Successfully parsed the file " + file.name);
  createTable();
}

function showLoadingScreen() {

}



fileInput.change(handleNewFile);
