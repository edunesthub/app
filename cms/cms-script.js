const db = firebase.database();
const productsRef = db.ref('products');

function loadProducts() {
  productsRef.on('value', (snapshot) => {
    const products = snapshot.val() || {};
    localStorage.setItem("products", JSON.stringify(products));
    displayProducts(products);
  }, (error) => {
    console.error("Error loading products:", error);
    showNotification("Failed to load products", true);
  });
}

function displayProducts(products) {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";
  Object.keys(products).forEach(id => {
    const product = products[id];
    const div = document.createElement("div");
    div.className = "product-item";
    div.innerHTML = `
      <img src="${product.image || ''}" alt="${product.name}">
      <div class="product-info">
        <div class="name">${product.name}</div>
        <div class="price">$${product.price.toFixed(2)}</div>
      </div>
      <div class="actions">
        <button onclick="editProduct('${id}')">Edit</button>
        <button onclick="deleteProduct('${id}')">Delete</button>
      </div>
    `;
    productList.appendChild(div);
  });
}

function updatePreview() {
  const fileInput = document.getElementById('productImage');
  const preview = document.getElementById('imagePreview');
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}

document.getElementById('product-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('productId').value;
  const name = document.getElementById('productName').value;
  const price = parseFloat(document.getElementById('productPrice').value);
  const fileInput = document.getElementById('productImage');
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      saveProduct(id, name, price, e.target.result);
    };
    reader.readAsDataURL(file);
  } else {
    saveProduct(id, name, price, null);
  }
});

function saveProduct(id, name, price, image) {
  const productData = { name, price };
  if (image) productData.image = image;

  const ref = id ? productsRef.child(id) : productsRef.push();
  ref.set(productData)
    .then(() => {
      showNotification(id ? 'Product updated' : 'Product added');
      clearForm();
    })
    .catch(error => {
      console.error("Error saving product:", error);
      showNotification('Error saving product', true);
    });
}

function editProduct(id) {
  productsRef.child(id).once('value', (snapshot) => {
    const product = snapshot.val();
    document.getElementById('productId').value = id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    if (product.image) {
      document.getElementById('imagePreview').src = product.image;
      document.getElementById('imagePreview').style.display = 'block';
    }
  });
}

function deleteProduct(id) {
  if (confirm('Are you sure you want to delete this product?')) {
    productsRef.child(id).remove()
      .then(() => showNotification('Product deleted'))
      .catch(error => showNotification('Error deleting product', true));
  }
}

function clearForm() {
  document.getElementById('product-form').reset();
  document.getElementById('productId').value = '';
  document.getElementById('imagePreview').style.display = 'none';
}

// Load products when the products section is active
document.querySelector('[data-section="products-section"]').addEventListener('click', loadProducts);