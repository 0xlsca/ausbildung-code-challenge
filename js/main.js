const fileInput = $("#file-input");
const content = $("#content");
const chartSpace = $("#csv-charts");

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

  // make tabulator
  table = new Tabulator("#csv-table", {
    addRowPos: "top",
    history: true,
    height: $(window).height() * 0.9, // maximum height without too much overhead
    data: tableData.data, //assign data to table
    layout: "fitColumns", //fit columns to width of table (optional)
    columns: makeColumns(tableData.meta.fields),
    pagination: "local",
  });

  // make table controls visible
  $("#csv-table-controls").show()

}

function makeColumns(header) {
  // creates a valid columns object for tabulator from a simple csv header

  let ret = [];

  Array.from(header).forEach(column => ret.push({title: column, field: column, editor: true}));

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
  makeChartsFromDataset(createChartDataSet());
}

function showLoadingScreen() {
  // TODO
}

function setupTableControls() {
  // adds functionality to the table control buttons

  //Add row on "Add Row" button click
  $("#csv-table-add-row").click(function () {
    table.addRow({});
  });

  //Delete row on "Delete Row" button click
  $("#csv-table-del-row").click(function () {
    table.deleteRow(1);
  });

  //Clear table on "Empty the table" button click
  $("#csv-table-clear").click(function () {
    table.clearData()
  });

  //Reset table contents on "Reset the table" button click
  $("#csv-table-reset").click(function () {
    table.setData(tableData.data);
  });

  // opens a download prompt which exports the currently held data to the downloaded file
  $("#csv-table-download").click(function () {
    table.download("csv", inputFile.name);
  });
}

function createChartDataSet() {
  // creates the dataset that is used for the charts
  // each column will have a dedicated dataset consisting of value => count pairs in form of a list

  let ret = [];

  let columns = tableData.meta.fields;
  let data = tableData.data;

  // reduces a column to value => count pairs
  const columnReducer = (accumulator, currentValue) => {

    // exclude empty values
    if (currentValue === "") {
      return accumulator;
    }

    if (accumulator[currentValue]) {
      accumulator[currentValue] += 1
    } else {
      accumulator[currentValue] = 1
    }

    return accumulator;

  };

  // build column value map
  let columnValueMap = {};

  columns.forEach(columnName => {
    columnValueMap[columnName] = [];
  });

  // populate value map
  data.forEach(row => {
    columns.forEach(columnName => {
      columnValueMap[columnName].push(row[columnName]);
    });
  });

  // iterate over the entries and reduce to value => count pairs
  for (let key in columnValueMap) {
    ret[key] = columnValueMap[key].reduce(columnReducer, {});
  }

  return ret;

}

function makeChartsFromDataset(dataSet) {
  // creates charts from the passed dataset.
  // the dataset is expected to have a column[0..\*] => value[1..\*] => count[1]
  // structure

  for (let key in dataSet) {

    let chartId = `chart-${key}`;

    let chartElement = chartSpace.append(`<canvas id="${chartId}"></canvas>`);

    let ctx = $("#"+chartId).get(0).getContext("2d");

    let chart = new Chart(ctx, {
      type: "pie",
      data: transformRawDatasetToChartDataset(dataSet[key], key),
      options: {}
    });

  }

}

function transformRawDatasetToChartDataset(rawDataset, label) {
  // transforms a raw dataset to a chart dataset for usage as data element in chart construction.
  // the raw dataset is expected to have a value[1..\*] => count[1]
  // structure.
  // the label is expected to be a string value.

  let labels = Object.keys(rawDataset);

  let color = generateRandomColor();

  let dataSets = [{
    label: label,
    backgroundColor: color,
    borderColor: color,
    data: Object.values(rawDataset)
  }];


  let ret = {
    labels: labels,
    datasets: dataSets
  };

  return ret;

}

function generateRandomColor() {
  // generates a random rgb color, returning a string with a call to the rgb() function

  return `rgb(${Math.random()*256|0},${Math.random()*256|0},${Math.random()*256|0})`
}

fileInput.change(handleNewFile);
setupTableControls();
