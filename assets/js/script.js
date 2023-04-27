let myHeaders = new Headers();
myHeaders.append("apikey", "QsuCL8KXnXMf9lXid4PhwuBDXP22F4jr");

let storedCurrencies = JSON.parse(localStorage.getItem("currencies")) ?? [];

let storedRows = JSON.parse(localStorage.getItem("rows")) ?? {};

let history = JSON.parse(localStorage.getItem('history')) ?? [];

let requestOptions = {
  method: 'GET',
  redirect: 'follow',
  headers: myHeaders
};

const addToHistory = ({value, result, from, to}) => {
  const historyTable = document.getElementById("history-table");

  const row = createRow({className: ["bg-white", "dark:bg-gray-800", "hover:bg-gray-100", "dark:hover:bg-gray-700", "border-gray-200", "dark:border-gray-700"]});
  const valueTd = createTd({text: value, className: ["px-6", "py-4", "whitespace-nowrap", "text-sm", "font-medium", "text-gray-900", "dark:text-white", "font-bold"]});
  const resultTd = createTd({text: result, className: ["px-6", "py-4", "whitespace-nowrap", "text-sm", "text-gray-500", "dark:text-gray-300"]});
  const fromTd = createTd({text: from, className: ["px-6", "py-4", "whitespace-nowrap", "text-sm", "text-gray-500", "dark:text-gray-300"]});
  const toTd = createTd({text: to, className: ["px-6", "py-4", "whitespace-nowrap", "text-sm", "text-gray-500", "dark:text-gray-300"]});

  row.appendChild(valueTd);
  row.appendChild(resultTd);
  row.appendChild(fromTd);
  row.appendChild(toTd);

  historyTable.appendChild(row);

  history.push({value, result, from, to});

  localStorage.setItem('history', JSON.stringify(history));

};

const handleSubmit = async (e) => {
  const amount = document.getElementById("amount").value;
  const divResult = document.getElementById("result");

  while(divResult.firstChild) {
    divResult.removeChild(divResult.firstChild);
  }

  if (amount === "") {
    alert("Debe ingresar un valor");
    return;
  }

 // test in a conditional if the amouunt is a decimal number using a regex expresion
  if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
    alert("El valor debe ser un número entero");
    return;
  }



  const localCurrency = document.getElementById("local-currency");
  const foreignCurrency = document.getElementById("foreign-currency");

  const {value: localCurrencyValue} = localCurrency;
  const {value: foreignCurrencyValue} = foreignCurrency;
  
  
  try {

    const res = await fetch(`https://api.apilayer.com/fixer/convert?from=${localCurrencyValue}&to=${foreignCurrencyValue}&amount=${amount}`, requestOptions)
    const {result} = await res.json();

    addToHistory({
      value: amount,
      result,
      from: localCurrencyValue,
      to: foreignCurrencyValue
    })

    
    divResult.appendChild(createP({ text: `El resultado es: $${result}`, className: ['text-gray-700', 'dark:text-white', 'font-bold', 'mt-4'] }));

  } catch (error) {
    alert("Error al convertir la moneda");
    console.log(error);
  }

};

const agregarOptions = async () => {
    const localCurrency = document.getElementById("local-currency");
    const foreignCurrency = document.getElementById("foreign-currency");

    localCurrency.addEventListener("change", handleCurrencyChange);
    foreignCurrency.addEventListener("change", handleCurrencyChange);

    if (storedCurrencies.length > 0) {

      storedCurrencies.forEach((currency) => {
        localCurrency.appendChild(createOption(currency));
        foreignCurrency.appendChild(createOption(currency));
      });

      localCurrency.selectedIndex = storedCurrencies.indexOf("COP");
      foreignCurrency.selectedIndex = storedCurrencies.indexOf("USD");

      return;
    }

    try {
      const res = await fetch("https://api.apilayer.com/fixer/symbols", requestOptions)
      const jsonData = await res.json()
      const currencies = Object.keys(jsonData.symbols);

      localStorage.setItem("currencies", JSON.stringify(currencies));

      currencies.forEach((currency) => {
        localCurrency.appendChild(createOption(currency, currency === "USD"));
        foreignCurrency.appendChild(createOption(currency, currency === "COP"));
      });

      localCurrency.selectedIndex = storedCurrencies.indexOf("COP");
      foreignCurrency.selectedIndex = storedCurrencies.indexOf("USD");

    } catch (error) {
      alert("Error al cargar las monedas");
    }
}

const agregarFilas = async () => {
  const tableBody = document.getElementById('currencies-table');

  if (Object.keys(storedRows).length > 0) {
    const {names, values, values2} = storedRows;

    names.forEach((name, index) => {
      const row = createRow({className: ["flex","bg-white", "dark:bg-gray-800", "hover:bg-gray-100", "dark:hover:bg-gray-700", "border-gray-200", "dark:border-gray-700"]});
      const nameTd = createTd({text: name, className: ["w-1/3","px-6", "py-4", "whitespace-nowrap", "text-sm", "font-medium", "text-gray-900", "dark:text-white", "font-bold"]});
      const valueTd = createTd({text: values[index], className: ["w-1/3","px-6", "py-4", "whitespace-nowrap", "text-sm", "text-gray-500", "dark:text-gray-300"]});
      const value2Td = createTd({text: values2[index], className: ["w-1/3","px-6", "py-4", "whitespace-nowrap", "text-sm", "text-gray-500", "dark:text-gray-300"]});

      row.appendChild(nameTd);
      row.appendChild(valueTd);
      row.appendChild(value2Td);

      tableBody.appendChild(row);
    });

    return;
  }

  try {
    const response = await fetch("https://api.apilayer.com/fixer/latest?symbols=&base=USD", requestOptions)
    const response2 = await fetch("https://api.apilayer.com/fixer/latest?symbols=&base=EUR", requestOptions);

    const result = await response.json();
    const result2 = await response2.json();

    const names = Object.keys(result.rates);

    console.log(names);
    const values = Object.values(result.rates);
    const values2 = Object.values(result2.rates);
    
    names.forEach((name, index) => {
      const row = createRow({className: ["bg-white", "dark:bg-gray-800", "hover:bg-gray-100", "dark:hover:bg-gray-700", "border-gray-200", "dark:border-gray-700"]});
      const nameTd = createTd({text: name, className: ["px-6", "py-4", "whitespace-nowrap", "text-sm", "font-medium", "text-gray-900", "dark:text-white", "font-bold"]});
      const valueTd = createTd({text: values[index], className: ["px-6", "py-4", "whitespace-nowrap", "text-sm", "text-gray-500", "dark:text-gray-300"]});
      const value2Td = createTd({text: values2[index], className: ["px-6", "py-4", "whitespace-nowrap", "text-sm", "text-gray-500", "dark:text-gray-300"]});

      row.appendChild(nameTd);
      row.appendChild(valueTd);
      row.appendChild(value2Td);

      tableBody.appendChild(row);
    });

    storedRows.names = names;
    storedRows.values = values;
    storedRows.values2 = values2;

    console.log(storedRows);

    localStorage.setItem("rows", JSON.stringify(storedRows));


  } catch (error) {
    console.log(error);
  }

};

const createRow = ({text, className})=>{ 
  const element = document.createElement("tr");

  element.classList.add(...className);

  if (text) {
    text = document.createTextNode(text);
    element.appendChild(text);
  }


  return element;

};

const createTd = ({ text, child, className }) => {
  const td = document.createElement("td");
  td.classList.add(...className);

  if (child) {
    td.appendChild(child);
  }

  if (text) {
    text = document.createTextNode(text);
    td.appendChild(text);
  }

  return td;
}

const createOption = (valor, selected) => {
    let option = document.createElement("option");
    
    option.value = valor
    option.text = valor

    return option;
}

const createDiv = ({ classDiv, children }) => {
    const div = document.createElement("div");
    div.classList.add(...classDiv);
  
    children.forEach((child) => {
      div.appendChild(child);
    });
  
    return div;
  };

const createP = ({ text, child, className }) => {
    const parrafo = document.createElement("p");
    parrafo.classList.add(...className);
  
    if (child) {
      parrafo.appendChild(child);
    }
  
    if (text) {
      text = document.createTextNode(text);
      parrafo.appendChild(text);
    }
  
    return parrafo;
  };


const handleCurrencyChange = (event) => {
  const {value, id} = event.target;

  let select = document.getElementById(id);
  select.value = value;
};

const fillHistory = ()=>{
  history.forEach((item)=>{
    const historyTable = document.getElementById("history-table");

    const {value, result, from, to} = item;

    const row = createRow({className: ["bg-white", "dark:bg-gray-800", "hover:bg-gray-100", "dark:hover:bg-gray-700", "border-gray-200", "dark:border-gray-700"]});
    const valueTd = createTd({text: value, className: ["px-6", "py-4", "whitespace-nowrap", "text-sm", "font-medium", "text-gray-900", "dark:text-white", "font-bold"]});
    const resultTd = createTd({text: result, className: ["px-6", "py-4", "whitespace-nowrap", "text-sm", "text-gray-500", "dark:text-gray-300"]});
    const fromTd = createTd({text: from, className: ["px-6", "py-4", "whitespace-nowrap", "text-sm", "text-gray-500", "dark:text-gray-300"]});
    const toTd = createTd({text: to, className: ["px-6", "py-4", "whitespace-nowrap", "text-sm", "text-gray-500", "dark:text-gray-300"]});

    row.appendChild(valueTd);
    row.appendChild(resultTd);
    row.appendChild(fromTd);
    row.appendChild(toTd);

    historyTable.appendChild(row);

  });
}



agregarOptions()
agregarFilas();
fillHistory();