import "./style.css";

// DOM elements
const productList = document.getElementById("productList");
const sortingInput = document.getElementById("sortingInput");
const priceSortInput = document.getElementById("priceSortInput");
const selectCategory = document.getElementById("selectCategory");

let productData = [],
  uniqueData = [];
let renderedCount = 0;
const CHUNK_SIZE = 12; // Initial load size
const SCROLL_LOAD_SIZE = 4; // Items to load on scroll

// Fetch JSON data
async function getJSONData() {
  try {
    const res = await fetch("/MOCK_DATA.json");
    productData = await res.json();
    let data = [];
    productData.forEach((prod) => {
      data.push(prod.category);
    });

    uniqueData = [...new Set(data)];
    selectInputOnLoad(uniqueData);

    if (productData.length === 0) {
      productList.innerHTML = `<p style='text-align:center'>No records found...</p>`;
      return;
    }

    sortAndDisplay(true); // Initial display
  } catch (error) {
    console.error("Failed to fetch product data:", error);
    productList.innerHTML = `<p style='text-align:center; color: red;'>Failed to load data.</p>`;
  }
}

// Sort data and display
function sortAndDisplay(
  reset = false,
  sortBy = false,
  sortPrice = false,
  isCategory = false
) {
  if (reset) renderedCount = 0;

  const sortOrder = sortingInput.value;
  const sortPriceOrder = priceSortInput.value;
  const categoryOrder = selectCategory.value;
  let sortedData = [...productData];

  // sort by product name
  if (sortOrder === "asc" && sortBy) {
    sortedData.sort((a, b) => a.product_name.localeCompare(b.product_name));
  } else if (sortOrder === "desc" && sortBy) {
    sortedData.sort((a, b) => b.product_name.localeCompare(a.product_name));
  }

  //filter by price
  if (sortPrice && sortPriceOrder == "asc") {
    sortedData.sort((a, b) => a.product_price - b.product_price);
  } else if (sortPrice && sortPriceOrder == "desc") {
    sortedData.sort((a, b) => b.product_price - a.product_price);
  }

  // filter by category
  if (isCategory && categoryOrder) {
    sortedData = sortedData.filter((data) => data.category === categoryOrder);
  } else if (!categoryOrder) {
    sortedData = sortedData;
  }

  if (reset) {
    productList.innerHTML = "";
  }

  const nextItems = sortedData.slice(
    renderedCount,
    renderedCount + (reset ? CHUNK_SIZE : SCROLL_LOAD_SIZE)
  );
  renderProducts(nextItems);
  renderedCount += nextItems.length;
}

// Render product cards
function renderProducts(products) {
  const fragment = document.createDocumentFragment();

  products.forEach(
    ({
      product_id,
      product_image,
      product_name,
      product_price,
      stock_status,
    }) => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
      <img src="${product_image}" alt="${product_name}" />
      <div class="card-body">
        <h3>${product_name}</h3>
        <p>&#8377; ${product_price}</p>
        <p style="color: ${
          stock_status === "in stock" ? "green" : "red"
        };">${stock_status}</p>
      </div>
      <button id='addCart' data-id=${product_id}><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>
    `;

      fragment.appendChild(card);
    }
  );

  productList.appendChild(fragment);
}

// Debounce for scroll handler
function debounce(func, delay = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

// Infinite scroll
window.addEventListener(
  "scroll",
  debounce(() => {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollTop + clientHeight + 100 >= scrollHeight) {
      sortAndDisplay(); // Load next chunk
    }
  })
);

//category on refresh

function selectInputOnLoad(data) {
  if (!data || !Array.isArray(data)) {
    return;
  }

  // selectCategory.innerHTML = ""; // Clear previous options

  data.forEach((item) => {
    const option = document.createElement("option");
    option.value = item; // Or item.id, depending on structure
    option.textContent = item; // Or item.name, etc.
    selectCategory.appendChild(option);
  });
}

// Sorting
sortingInput.addEventListener("change", () => sortAndDisplay(true, true));

//price filter
priceSortInput.addEventListener("change", () =>
  sortAndDisplay(true, false, true)
);

//category filter
selectCategory.addEventListener("input", () => {
  sortAndDisplay(true, false, false, true);
});

// Init
window.addEventListener("DOMContentLoaded", () => {
  getJSONData();
});
