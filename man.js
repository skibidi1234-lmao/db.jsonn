////////////////////////////////////////////////////////////////
// ==================== CLASS SẢN PHẨM ==================== //
////////////////////////////////////////////////////////////////

class Product {
  constructor(id, name, price, image, category, hot, description) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.image = image;
    this.category = category;
    this.hot = hot;
    this.description = description;
  }

  // Phương thức hiển thị sản phẩm trong danh sách (trang chủ/sản phẩm)
  render() {
    return `
      <div class="product">
        <img src="${this.image}" alt="${this.name}">
        <a href="detail.html?id=${this.id}"><h3>${this.name}</h3></a>
        <p>${this.price.toLocaleString('vi-VN')} đ</p>
      </div>
    `;
  }

  // Phương thức hiển thị sản phẩm trên trang chi tiết
  renderDetail() {
    return `
      <div>
        <img src="${this.image}" alt="${this.name}">
        <div>
          <h2>${this.name}</h2>
          <p>${this.price.toLocaleString('vi-VN')} đ</p>
          <span>${this.description}</span>
          <button id="addCartBtn" productId="${this.id}">
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    `;
  }
}

////////////////////////////////////////////////////////////////
// ==================== CLASS GIỎ HÀNG ==================== //
////////////////////////////////////////////////////////////////

class Cart {
  constructor() {
    this.items = this.getCart();
  }

  getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.items));
    updateCartCount();
  }

  addItem(product) {
    const existingItem = this.items.find(item => item.id == product.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      // Chỉ lưu các thuộc tính cần thiết vào giỏ hàng (id, name, price, image, category...)
      const itemToSave = { 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        image: product.image,
        quantity: 1 
      };
      this.items.push(itemToSave);
    }
    this.saveCart();
  }

  // Phương thức render() cho giỏ hàng sẽ được thay thế bằng hàm renderCart() riêng
}

const cart = new Cart();

////////////////////////////////////////////////////////////////
// ==================== CHỨC NĂNG CHUNG ==================== //
////////////////////////////////////////////////////////////////

// Hàm cập nhật số lượng giỏ hàng trên header
function updateCartCount() {
  const badge = document.querySelector('.cart-count');
  const cartData = JSON.parse(localStorage.getItem("cart")) || [];
  const totalQty = cartData.reduce((sum, item) => sum + (item.quantity || 0), 0);
  if (badge) badge.textContent = totalQty;
}

// Hàm render danh sách sản phẩm
const renderProduct = (array, theDiv) => {
  let html = "";
  array.forEach((item) => {
    // Tạo đối tượng Product để sử dụng phương thức render()
    const product = new Product(
      item.id, item.name, item.price, item.image, item.category, item.hot, item.description
    );
    html += product.render();
  });
  if (theDiv) theDiv.innerHTML = html;
};

// Hàm kiểm tra định dạng URL hình ảnh
function isImageUrl(url) {
    // Kiểm tra xem URL có chứa đuôi file ảnh phổ biến không
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.startsWith('http'); 
}


////////////////////////////////////////////////////////////////
// ==================== PHẦN HIỂN THỊ TRANG CHỦ ==================== //
////////////////////////////////////////////////////////////////

const hotDiv = document.getElementById('hot');
const menDiv = document.getElementById('men'); // Dùng cho Điện thoại
const womenDiv = document.getElementById('women'); // Dùng cho Laptop

if (hotDiv || menDiv || womenDiv) {
  fetch('http://localhost:3000/products')
    .then(response => response.json())
    .then(data => {
      const dataHot = data.filter(p => p.hot === true);
      const dataPhone = data.filter(p => p.category === "điện thoại");
      const dataLaptop = data.filter(p => p.category === "laptop");

      // Show sản phẩm nổi bật
      renderProduct(dataHot, hotDiv);

      // Show sản phẩm điện thoại
      renderProduct(dataPhone, menDiv);

      // Show sản phẩm laptop
      renderProduct(dataLaptop, womenDiv);
    })
    .catch(err => console.error("Lỗi tải sản phẩm trang chủ:", err));
}

////////////////////////////////////////////////////////////////
// ==================== PHẦN HIỂN THỊ TRANG SẢN PHẨM ==================== //
////////////////////////////////////////////////////////////////

const productAll = document.getElementById('all-product');
// Lưu ý: searchInput/sortPrice được định nghĩa lại ở đây để đảm bảo lấy đúng element trong trang product.html
const searchInput = document.getElementById('search-input'); 
const sortPrice = document.getElementById('sort-price');

let allProductsData = [];

if (productAll) {
  fetch('http://localhost:3000/products')
    .then(response => response.json())
    .then(data => {
      allProductsData = data;
      renderProduct(allProductsData, productAll);
    })
    .catch(err => console.error("Lỗi tải tất cả sản phẩm:", err));

  // Chức năng Tìm kiếm
  // Lưu ý: Element searchInput trong Header/Footer KHÔNG có ID 'search-input'
  // Nếu bạn muốn dùng, bạn cần sửa lại HTML/CSS
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const keyword = e.target.value.toLowerCase();
      const filteredProducts = allProductsData.filter(
        p => p.name.toLowerCase().includes(keyword)
      );
      renderProduct(filteredProducts, productAll);
    });
  }

  // Chức năng Sắp xếp
  if (sortPrice) {
    sortPrice.addEventListener('change', (e) => {
      let sorted = [...allProductsData]; // Tạo bản sao để sắp xếp
      if (e.target.value === "asc") {
        sorted.sort((a, b) => a.price - b.price);
      } else if (e.target.value === 'desc') {
        sorted.sort((a, b) => b.price - a.price);
      }
      renderProduct(sorted, productAll);
    });
  }
}

////////////////////////////////////////////////////////////////
// ==================== PHẦN HIỂN THỊ TRANG CHI TIẾT ==================== //
////////////////////////////////////////////////////////////////

const productDetailDiv = document.getElementById('detail-product');

if (productDetailDiv) {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (productId) {
    fetch(`http://localhost:3000/products/${productId}`)
      .then(response => {
        if (!response.ok) throw new Error("Product not found");
        return response.json();
      })
      .then(data => {
        const product = new Product(
          data.id, data.name, data.price, data.image, data.category, data.hot, data.description
        );
        productDetailDiv.innerHTML = product.renderDetail();
      })
      .catch(err => {
        productDetailDiv.innerHTML = `<p style="color:red;">❌ Không tìm thấy sản phẩm này.</p>`;
        console.error("Lỗi tải chi tiết sản phẩm:", err);
      });
  }
}

////////////////////////////////////////////////////////////////
// ==================== RENDER HEADER & FOOTER ==================== //
////////////////////////////////////////////////////////////////

// Tạo header
const header = document.createElement('header');
header.innerHTML = `
<header class="site-header">
  <div class="container header-top">
    <div class="logo">
      <a href="index.html">
        <img src="img/6.png" style="height:60px; vertical-align:middle;">
        <span>ShopOnline</span>
      </a>
    </div>

    <div class="search-bar">
      <input type="text" placeholder="Tìm kiếm sản phẩm"> 
      <button><i class="fas fa-search"></i></button>
    </div>

    <div class="header-icons">
      <a href="#"><i class="fas fa-phone"></i> 0123 456 789</a>
      <a href="admin.html"><i class="fas fa-user"></i></a>
      <a href="#"><i class="fas fa-heart"></i></a>
      <a href="cart.html" class="cart">
        <i class="fas fa-shopping-cart"></i>
        <span class="cart-count" id="cart-count">0</span>
      </a>
    </div>
  </div>

  <nav class="navbar">
    <ul>
      <li><a href="index.html"><i class="fas fa-home"></i> Trang chủ</a></li>
      <li><a href="product.html"><i class="fas fa-box"></i> Sản phẩm</a></li>
      <li><a href="#"><i class="fas fa-tags"></i> sản phẩm ct</a></li>
      <li><a href="#"><i class="fas fa-newspaper"></i> Tin tức</a></li>
      <li><a href="#"><i class="fas fa-envelope"></i> Liên hệ</a></li>
    </ul>
  </nav>
</header>

<section class="hero-banner">
  <div class="hero-text">
    <h2>Chào mừng đến với Shop Online</h2>
    <p>Mua sắm tiện lợi – Giá tốt mỗi ngày!</p>
    <a href="product.html" class="btn"><i class="fas fa-shopping-bag"></i> Mua ngay</a>
  </div>
</section>
`;
document.body.prepend(header);

// Tạo footer
const footer = document.createElement('footer');
footer.innerHTML = `
<footer class="site-footer">
    <div class="container footer-content">
      <div class="footer-column">
        <h3><i class="fas fa-store"></i> ShopOnline</h3>
        <p>Mang đến trải nghiệm mua sắm trực tuyến nhanh chóng, dễ dàng và an toàn.</p>
      </div>
      <div class="footer-column">
        <h3><i class="fas fa-headset"></i> Liên hệ</h3>
        <ul>
          <li><i class="fas fa-map-marker-alt"></i> 123 Đường ABC, Hà Nội</li>
          <li><i class="fas fa-phone"></i> 0123 456 789</li>
          <li><i class="fas fa-envelope"></i> support@shoponline.com</li>
        </ul>
      </div>
      <div class="footer-column">
        <h3><i class="fas fa-list"></i> Danh mục</h3>
        <ul>
          <li><a href="index.html"><i class="fas fa-home"></i> Trang chủ</a></li>
          <li><a href="product.html"><i class="fas fa-box"></i> Chi tiết sản phẩm</a></li>
          <li><a href="#"><i class="fas fa-tags"></i> Khuyến mãi</a></li>
          <li><a href="#"><i class="fas fa-newspaper"></i> Tin tức</a></li>
        </ul>
      </div>
      <div class="footer-column">
        <h3><i class="fas fa-share-alt"></i> Theo dõi chúng tôi</h3>
        <div class="social-icons">
          <a href="#"><i class="fab fa-facebook"></i></a>
          <a href="#"><i class="fab fa-instagram"></i></a>
          <a href="#"><i class="fab fa-tiktok"></i></a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2025 ShopOnline. All rights reserved.</p>
    </div>
  </footer>
`;
document.body.appendChild(footer);

////////////////////////////////////////////////////////////////
// ==================== XỬ LÝ SỰ KIỆN CHUNG ==================== //
////////////////////////////////////////////////////////////////

// Xử lý sự kiện Thêm vào giỏ hàng (Áp dụng cho trang Chi tiết)
document.addEventListener('click', function (e) {
  if (e.target && e.target.id == "addCartBtn") {
    const id = e.target.getAttribute('productId');
    fetch(`http://localhost:3000/products/${id}`)
      .then(response => response.json())
      .then(data => {
        // Tạo đối tượng Product từ dữ liệu để thêm vào Cart
        const product = new Product(
          data.id, data.name, data.price, data.image, data.category, data.hot, data.description
        );
        cart.addItem(product);
        alert(`✅ Đã thêm ${data.name} vào giỏ hàng!`);
        console.log("🛒 Giỏ hàng hiện tại:", cart.items);
      })
      .catch(err => console.error("Lỗi khi thêm vào giỏ hàng:", err));
  }
});

// Load số lượng giỏ hàng khi trang được tải lần đầu
updateCartCount();


////////////////////////////////////////////////////////////////
// ==================== CHỨC NĂNG GIỎ HÀNG (TRANG cart.html) ==================== //
////////////////////////////////////////////////////////////////

// Hàm lấy dữ liệu giỏ hàng (đã có trong Class Cart, nhưng dùng lại để tiện cho renderCart)
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

// Hàm lưu dữ liệu giỏ hàng
function saveCart(cartData) {
  localStorage.setItem("cart", JSON.stringify(cartData));
  updateCartCount();
}

// Render Giỏ hàng
async function renderCart() {
  const cartContainer = document.getElementById("cart-items");
  const cartSummary = document.getElementById("cart-summary");
  if (!cartContainer || !cartSummary) return; // Chỉ chạy trên trang cart.html

  const cartData = getCart();
  if (cartData.length === 0) {
    cartContainer.innerHTML = `<p>🛒 Giỏ hàng trống. <a href="product.html">Mua sắm ngay</a></p>`;
    cartSummary.innerHTML = "";
    return;
  }

  try {
    // Tải tất cả sản phẩm để lấy thông tin chi tiết (tên, giá, ảnh...)
    const res = await fetch('http://localhost:3000/products');
    const products = await res.json();

    let total = 0;
    let html = "";

    cartData.forEach((cartItem, index) => {
      const product = products.find(p => p.id == cartItem.id);
      if (!product) return;

      const subtotal = product.price * cartItem.quantity;
      total += subtotal;

      html += `
        <div class="cart-item">
          <img src="${product.image}" alt="${product.name}" class="cart-img">
          <div class="cart-info">
            <h3>${product.name}</h3>
            <p>Giá: ${product.price.toLocaleString('vi-VN')} đ</p>
            <div class="quantity-controls">
              <button class="decrease" data-index="${index}">-</button>
              <span>${cartItem.quantity}</span>
              <button class="increase" data-index="${index}">+</button>
            </div>
            <p>Thành tiền: ${subtotal.toLocaleString('vi-VN')} đ</p>
          </div>
          <button class="remove-item" data-index="${index}" title="Xóa">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
    });

    cartContainer.innerHTML = html;
    cartSummary.innerHTML = `
      <h2>Tổng cộng: ${total.toLocaleString('vi-VN')} đ</h2>
      <button class="checkout-btn">Thanh toán</button>
    `;

  } catch (err) {
    cartContainer.innerHTML = `<p style="color:red;">❌ Lỗi lấy dữ liệu sản phẩm khi hiển thị giỏ hàng.</p>`;
    cartSummary.innerHTML = "";
    console.error("Lỗi renderCart:", err);
  }
}

// Cập nhật số lượng sản phẩm trong giỏ hàng
function updateQuantity(index, change) {
  const cartData = getCart();
  if (cartData[index]) {
    cartData[index].quantity += change;
    // Xóa sản phẩm nếu số lượng <= 0
    if (cartData[index].quantity <= 0) cartData.splice(index, 1);
    saveCart(cartData);
    renderCart();
  }
}

// Xóa sản phẩm khỏi giỏ hàng
function removeFromCart(index) {
  const cartData = getCart();
  cartData.splice(index, 1);
  saveCart(cartData);
  renderCart();
}

// Bắt sự kiện Tăng/Giảm/Xóa trên trang giỏ hàng
document.addEventListener("click", (e) => {
  const increaseBtn = e.target.closest(".increase");
  const decreaseBtn = e.target.closest(".decrease");
  const removeBtn = e.target.closest(".remove-item");

  if (increaseBtn) {
    const index = increaseBtn.getAttribute("data-index");
    if (index !== null) updateQuantity(Number(index), 1);
  }

  if (decreaseBtn) {
    const index = decreaseBtn.getAttribute("data-index");
    if (index !== null) updateQuantity(Number(index), -1);
  }

  if (removeBtn) {
    const index = removeBtn.getAttribute("data-index");
    if (index !== null && confirm("🗑️ Bạn có chắc muốn xóa sản phẩm này?")) removeFromCart(Number(index));
  }
});

// Load giỏ hàng khi vào trang cart.html
document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  updateCartCount();
});

////////////////////////////////////////////////////////////////
// ============= PHẦN ADMIN - QUẢN LÝ SẢN PHẨM (TRANG admin.html) =============== //
////////////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:3000/products';
  const adminForm = document.getElementById('admin-form');
  if (!adminForm) return; // Chỉ chạy nếu đang ở trang admin

  const adminName = document.getElementById('admin-name');
  const adminPrice = document.getElementById('admin-price');
  const adminImage = document.getElementById('admin-image');
  const adminCategory = document.getElementById('admin-category');
  const adminHot = document.getElementById('admin-hot');
  const adminDescription = document.getElementById('admin-description');
  const adminTable = document.getElementById('admin-product-list');
  let editingId = null;

  // ======================= HIỂN THỊ DANH SÁCH =======================
  function renderAdminProducts() {
    fetch(API_URL)
      .then(res => res.json())
      .then(products => {
        const tbody = adminTable.querySelector('tbody');
        if (!tbody) return;
        tbody.innerHTML = products.map(p => `
          <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${Number(p.price).toLocaleString('vi-VN')} đ</td>
            <td><img src="${p.image}" style="height:50px" onerror="this.onerror=null;this.src='placeholder.png';"></td>
            <td>${p.category}</td>
            <td>${p.hot ? '✅' : '❌'}</td>
            <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${p.description}</td>
            <td>
              <button class="edit-product" data-id="${p.id}" title="Sửa">
                <i class="fas fa-edit"></i>
              </button>
              <button class="delete-product" data-id="${p.id}" title="Xóa">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `).join('');
      })
      .catch(err => console.error('❌ Lỗi load sản phẩm Admin:', err));
  }

  // ======================= THÊM & SỬA SẢN PHẨM =======================
  adminForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Kiểm tra và lấy giá trị
    const nameValue = adminName.value.trim();
    const priceValue = Number(adminPrice.value);
    const imageValue = adminImage.value.trim();
    const categoryValue = adminCategory.value.trim();
    const descriptionValue = adminDescription.value.trim();

    if (!nameValue || isNaN(priceValue) || priceValue <= 0 || !imageValue || !categoryValue) {
      alert('❌ Vui lòng nhập đầy đủ thông tin hợp lệ (Tên, Giá > 0, Ảnh, Danh mục)!');
      return;
    }
    
    // THÊM KIỂM TRA ĐỊNH DẠNG URL TẠI ĐÂY
    if (!isImageUrl(imageValue) && !editingId) {
        alert('⚠️ URL Ảnh dường như không phải là URL trực tiếp. Vui lòng đảm bảo nó là URL đầy đủ, có thể truy cập được, và thường kết thúc bằng .jpg, .png, v.v.');
        // Người dùng có thể chọn tiếp tục hoặc quay lại sửa
        if (!confirm('Bạn có muốn tiếp tục thêm sản phẩm với URL này không?')) return;
    }

    const newProduct = {
      name: nameValue,
      price: priceValue,
      image: imageValue,
      category: categoryValue,
      hot: adminHot.checked,
      description: descriptionValue
    };

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;
    const bodyData = editingId ? { ...newProduct, id: editingId } : newProduct;

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    })
      .then(res => res.json())
      .then(() => {
        alert(editingId ? '✅ Cập nhật sản phẩm thành công!' : '✅ Thêm sản phẩm thành công!');
        adminForm.reset();
        editingId = null;
        renderAdminProducts();
      })
      .catch(err => console.error(`❌ Lỗi ${editingId ? 'cập nhật' : 'thêm'} sản phẩm:`, err));
  });

  // ======================= XÓA & SỬA (LẤY DỮ LIỆU) =======================
  adminTable.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    if (!id) return;

    // Xóa sản phẩm
    if (btn.classList.contains('delete-product')) {
      if (confirm('🗑️ Bạn có chắc muốn xóa sản phẩm này?')) {
        fetch(`${API_URL}/${id}`, { method: 'DELETE' })
          .then(() => {
            alert('🗑️ Đã xóa sản phẩm!');
            renderAdminProducts();
          })
          .catch(err => console.error('❌ Lỗi xóa sản phẩm:', err));
      }
    }

    // Lấy dữ liệu sản phẩm để sửa
    if (btn.classList.contains('edit-product')) {
      fetch(`${API_URL}/${id}`)
        .then(res => res.json())
        .then(data => {
          if (!data) {
            alert('❌ Không tìm thấy sản phẩm!');
            return;
          }
          editingId = data.id;
          adminName.value = data.name;
          adminPrice.value = data.price;
          adminImage.value = data.image;
          adminCategory.value = data.category;
          adminHot.checked = data.hot;
          adminDescription.value = data.description;
          // Cuộn lên form để dễ sửa
          window.scrollTo({top: adminForm.offsetTop, behavior: 'smooth'});
        })
        .catch(err => console.error('❌ Lỗi lấy sản phẩm để sửa:', err));
    }
  });

  // ======================= LOAD LẦN ĐẦU =======================
  if (adminTable) renderAdminProducts();
});