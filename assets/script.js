// ==========================================================================
// 1. Theme Management (Light / Dark Mode)
// ==========================================================================
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  // Retrieve pinned theme or fall back to system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  let currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', currentTheme);

  // Set initial icon state and click listener
  toggleBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
  });

  // Listen to system theme updates
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      const newTheme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  });
}

// ==========================================================================
// 2. Interactive SVG Charts & Dashboard (Landing Page)
// ==========================================================================
const dashboardData = {
  year: {
    cashflow: { inflow: 540000, outflow: 395000, trendIn: [45, 48, 52, 49, 58, 62, 59, 65, 72, 70, 78, 85], trendOut: [35, 38, 41, 40, 42, 48, 45, 52, 55, 53, 58, 62] },
    profit: { value: 145000, trend: [10, 10, 11, 9, 16, 14, 14, 13, 17, 17, 20, 23] },
    pending: { sales: 24000, purchase: 15000, salesPaid: 85, purchasePaid: 70 },
    expenses: [
      { category: "Rent & Office", amount: 48000, pct: 100 },
      { category: "Marketing", amount: 35000, pct: 73 },
      { category: "Inventory Purchases", amount: 28000, pct: 58 },
      { category: "Software Licensing", amount: 18000, pct: 37.5 },
      { category: "Logistics", amount: 16000, pct: 33 }
    ]
  },
  quarter: {
    cashflow: { inflow: 165000, outflow: 120000, trendIn: [65, 72, 70, 78], trendOut: [52, 55, 53, 58] },
    profit: { value: 45000, trend: [13, 17, 17, 20] },
    pending: { sales: 8500, purchase: 4200, salesPaid: 90, purchasePaid: 82 },
    expenses: [
      { category: "Rent & Office", amount: 12000, pct: 100 },
      { category: "Marketing", amount: 9500, pct: 79 },
      { category: "Inventory Purchases", amount: 8000, pct: 66 },
      { category: "Software Licensing", amount: 4500, pct: 37 },
      { category: "Logistics", amount: 4000, pct: 33 }
    ]
  },
  month: {
    cashflow: { inflow: 580000, outflow: 42000, trendIn: [70, 78, 85], trendOut: [53, 58, 62] },
    profit: { value: 16000, trend: [17, 20, 23] },
    pending: { sales: 3100, purchase: 1100, salesPaid: 95, purchasePaid: 92 },
    expenses: [
      { category: "Rent & Office", amount: 4000, pct: 100 },
      { category: "Marketing", amount: 3200, pct: 80 },
      { category: "Inventory Purchases", amount: 2500, pct: 62.5 },
      { category: "Software Licensing", amount: 1500, pct: 37.5 },
      { category: "Logistics", amount: 1200, pct: 30 }
    ]
  }
};

function updateDashboard(period) {
  const data = dashboardData[period];
  if (!data) return;

  // Update text cards
  const cfIn = document.getElementById('cf-inflow-val');
  const cfOut = document.getElementById('cf-outflow-val');
  const plVal = document.getElementById('pl-val');
  const pendSales = document.getElementById('pend-sales-val');
  const pendPurch = document.getElementById('pend-purch-val');

  if (cfIn) cfIn.textContent = `$${data.cashflow.inflow.toLocaleString()}`;
  if (cfOut) cfOut.textContent = `$${data.cashflow.outflow.toLocaleString()}`;
  if (plVal) plVal.textContent = `$${data.profit.value.toLocaleString()}`;
  if (pendSales) pendSales.textContent = `$${data.pending.sales.toLocaleString()}`;
  if (pendPurch) pendPurch.textContent = `$${data.pending.purchase.toLocaleString()}`;

  // Update Cashflow Line Chart (SVG)
  const cfSvgBody = document.getElementById('cf-chart-body');
  if (cfSvgBody) {
    const width = 340;
    const height = 110;
    const stepsIn = data.cashflow.trendIn.length - 1;
    const xStep = width / stepsIn;

    // Draw Inflow path (Teal)
    let inPathStr = `M 0 ${height - (data.cashflow.trendIn[0] * height / 100)}`;
    for (let i = 1; i < data.cashflow.trendIn.length; i++) {
      inPathStr += ` L ${i * xStep} ${height - (data.cashflow.trendIn[i] * height / 100)}`;
    }

    // Draw Outflow path (Orange)
    let outPathStr = `M 0 ${height - (data.cashflow.trendOut[0] * height / 100)}`;
    for (let i = 1; i < data.cashflow.trendOut.length; i++) {
      outPathStr += ` L ${i * xStep} ${height - (data.cashflow.trendOut[i] * height / 100)}`;
    }

    cfSvgBody.innerHTML = `
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}">
        <path d="${inPathStr}" fill="none" stroke="#0097b2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <path d="${outPathStr}" fill="none" stroke="#ff7a22" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;
  }

  // Update Profit & Loss Bar Chart (SVG)
  const plChartBody = document.getElementById('pl-chart-body');
  if (plChartBody) {
    const width = 340;
    const height = 110;
    const numBars = data.profit.trend.length;
    const padding = 8;
    const barWidth = (width - (padding * (numBars + 1))) / numBars;

    let barsHtml = "";
    for (let i = 0; i < numBars; i++) {
      const x = padding + i * (barWidth + padding);
      const barHeight = (data.profit.trend[i] * height) / 25;
      const y = height - barHeight;
      barsHtml += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="#0097b2" rx="4" style="transition: all 0.3s ease;" />`;
    }

    plChartBody.innerHTML = `
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}">
        ${barsHtml}
      </svg>
    `;
  }

  // Update Pending Payments Donuts (SVG)
  const pendingSalesBody = document.getElementById('pending-sales-donut');
  const pendingPurchBody = document.getElementById('pending-purch-donut');
  
  if (pendingSalesBody && pendingPurchBody) {
    const size = 60;
    const radius = 22;
    const circ = 2 * Math.PI * radius;

    // Sales Paid circle
    const salesDash = (data.pending.salesPaid / 100) * circ;
    pendingSalesBody.innerHTML = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="rgba(0, 151, 178, 0.1)" stroke-width="5" />
        <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="#0097b2" stroke-width="5" 
                stroke-dasharray="${salesDash} ${circ - salesDash}" stroke-dashoffset="${circ/4}" stroke-linecap="round" />
        <text x="50%" y="55%" text-anchor="middle" font-size="10" font-weight="bold" fill="var(--text-primary)" font-family="var(--font-display)">${data.pending.salesPaid}%</text>
      </svg>
    `;

    // Purchase Paid circle
    const purchDash = (data.pending.purchasePaid / 100) * circ;
    pendingPurchBody.innerHTML = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="rgba(255, 122, 34, 0.1)" stroke-width="5" />
        <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="#ff7a22" stroke-width="5" 
                stroke-dasharray="${purchDash} ${circ - purchDash}" stroke-dashoffset="${circ/4}" stroke-linecap="round" />
        <text x="50%" y="55%" text-anchor="middle" font-size="10" font-weight="bold" fill="var(--text-primary)" font-family="var(--font-display)">${data.pending.purchasePaid}%</text>
      </svg>
    `;
  }

  // Update Top Expenses
  const expContainer = document.getElementById('top-expenses-list');
  if (expContainer) {
    expContainer.innerHTML = data.expenses.map(exp => `
      <div style="margin-bottom: 0.85rem;">
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.25rem;">
          <span style="font-weight:500; color:var(--text-primary);">${exp.category}</span>
          <span style="font-weight:700; color:var(--brand-orange);">$${exp.amount.toLocaleString()}</span>
        </div>
        <div style="height:6px; background:var(--bg-secondary); border-radius:3px; overflow:hidden;">
          <div style="height:100%; width:${exp.pct}%; background:linear-gradient(90deg, var(--brand-teal), var(--brand-orange)); border-radius:3px; transition: width 0.4s ease;"></div>
        </div>
      </div>
    `).join('');
  }
}

function initDashboardPeriodTabs() {
  const tabs = document.querySelectorAll('.dashboard-preview .period-tab');
  if (tabs.length === 0) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      const period = e.target.getAttribute('data-period');
      updateDashboard(period);
    });
  });

  // Load defaults
  updateDashboard('year');
}

// ==========================================================================
// 3. POS Simulator Checkout Module
// ==========================================================================
let cart = [];
let appliedCoupon = null;

const products = [
  { id: 'p1', name: 'Office Chair', price: 150, icon: '🪑' },
  { id: 'p2', name: 'Standard Desk', price: 350, icon: '🖥️' },
  { id: 'p3', name: 'Wireless Mouse', price: 45, icon: '🖱️' },
  { id: 'p4', name: 'Mech Keyboard', price: 95, icon: '⌨️' },
  { id: 'p5', name: 'LED Monitor', price: 220, icon: '📺' }
];

function initPOSSimulator() {
  const catalogContainer = document.getElementById('pos-products-grid');
  if (!catalogContainer) return;

  // Render product catalog
  catalogContainer.innerHTML = products.map(prod => `
    <div class="pos-product-card" data-id="${prod.id}">
      <div class="pos-product-img">${prod.icon}</div>
      <div class="pos-product-name">${prod.name}</div>
      <div class="pos-product-price">$${prod.price}</div>
    </div>
  `).join('');

  // Click handler for products
  catalogContainer.querySelectorAll('.pos-product-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      addToCart(id);
    });
  });

  // Coupon application handler
  const couponBtn = document.getElementById('pos-apply-coupon');
  const couponInput = document.getElementById('pos-coupon-input');
  if (couponBtn && couponInput) {
    couponBtn.addEventListener('click', () => {
      const code = couponInput.value.trim().toUpperCase();
      applyCoupon(code);
    });
  }

  // Pay button
  const payBtn = document.getElementById('pos-pay-btn');
  if (payBtn) {
    payBtn.addEventListener('click', () => {
      checkoutPOS();
    });
  }

  // Initial draw
  updatePOSCartView();
}

function addToCart(id) {
  const prod = products.find(p => p.id === id);
  if (!prod) return;

  const existing = cart.find(item => item.product.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ product: prod, qty: 1 });
  }

  updatePOSCartView();
}

function removeFromCart(id) {
  const existing = cart.find(item => item.product.id === id);
  if (existing) {
    existing.qty--;
    if (existing.qty <= 0) {
      cart = cart.filter(item => item.product.id !== id);
    }
  }
  updatePOSCartView();
}

function applyCoupon(code) {
  const statusEl = document.getElementById('pos-coupon-status');
  if (!statusEl) return;

  if (code === 'WELCOME10') {
    appliedCoupon = { code: 'WELCOME10', type: 'percent', val: 10 };
    statusEl.textContent = "Coupon WELCOME10 applied! (10% off)";
    statusEl.style.color = "#2ec4b6";
  } else if (code === 'FREESHIP') {
    appliedCoupon = { code: 'FREESHIP', type: 'flat', val: 15 };
    statusEl.textContent = "Coupon FREESHIP applied! ($15 off)";
    statusEl.style.color = "#2ec4b6";
  } else {
    appliedCoupon = null;
    statusEl.textContent = "Invalid Coupon Code";
    statusEl.style.color = "#ff5f56";
  }
  updatePOSCartView();
}

function updatePOSCartView() {
  const cartContainer = document.getElementById('pos-cart-items-list');
  if (!cartContainer) return;

  if (cart.length === 0) {
    cartContainer.innerHTML = `<div style="text-align:center; color:var(--text-secondary); padding: 2rem 0;">Cart is empty. Click items to buy!</div>`;
    updateSummary(0, 0, 0);
    return;
  }

  // Render items
  cartContainer.innerHTML = cart.map(item => `
    <div class="pos-cart-item">
      <div class="pos-item-details">
        <div class="pos-item-name">${item.product.name}</div>
        <div class="pos-item-meta">$${item.product.price} each</div>
      </div>
      <div class="pos-item-qty">
        <button class="pos-qty-btn" onclick="removeFromCart('${item.product.id}')">-</button>
        <span style="font-weight:600; min-width: 15px; text-align:center;">${item.qty}</span>
        <button class="pos-qty-btn" onclick="addToCart('${item.product.id}')">+</button>
      </div>
      <div class="pos-item-total">$${item.qty * item.product.price}</div>
    </div>
  `).join('');

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.qty * item.product.price), 0);
  let discount = 0;

  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discount = subtotal * (appliedCoupon.val / 100);
    } else if (appliedCoupon.type === 'flat') {
      discount = Math.min(appliedCoupon.val, subtotal);
    }
  }

  const total = subtotal - discount;
  updateSummary(subtotal, discount, total);
}

// Attach functions globally for inline HTML onclick calls safely
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;

function updateSummary(subtotal, discount, total) {
  const subEl = document.getElementById('pos-subtotal');
  const discEl = document.getElementById('pos-discount');
  const totEl = document.getElementById('pos-grand-total');

  if (subEl) subEl.textContent = `$${subtotal.toFixed(2)}`;
  if (discEl) discEl.textContent = `-$${discount.toFixed(2)}`;
  if (totEl) totEl.textContent = `$${total.toFixed(2)}`;
}

function checkoutPOS() {
  if (cart.length === 0) return;
  
  // Show toast notification
  showToast("POS Invoice Submitted & Ticket Printed Successfully!");
  
  // Reset
  cart = [];
  appliedCoupon = null;
  const couponInput = document.getElementById('pos-coupon-input');
  if (couponInput) couponInput.value = '';
  const statusEl = document.getElementById('pos-coupon-status');
  if (statusEl) statusEl.textContent = '';
  
  updatePOSCartView();
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.right = '24px';
  toast.style.background = 'var(--brand-teal)';
  toast.style.color = '#fff';
  toast.style.padding = '1rem 2rem';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = '0 8px 24px rgba(0, 151, 178, 0.3)';
  toast.style.fontFamily = 'var(--font-display)';
  toast.style.fontWeight = '600';
  toast.style.zIndex = '9999';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(20px)';
  toast.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
  
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Trigger entry animation
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 50);

  // Trigger exit and deletion
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 4000);
}

// ==========================================================================
// 4. Documentation & Search Logic (help.html)
// ==========================================================================
let allTopics = [];

function initDocumentation() {
  const sidebarNav = document.getElementById('docs-nav-categories');
  const searchInput = document.getElementById('docs-search-field');
  if (!sidebarNav || typeof docsData === 'undefined') return;

  // Flatten topics for search and global iteration
  docsData.forEach(cat => {
    cat.topics.forEach(top => {
      allTopics.push({
        id: top.id,
        title: top.title,
        content: top.content,
        category: cat.category
      });
    });
  });

  // Render sidebar navigation list
  sidebarNav.innerHTML = docsData.map(cat => `
    <div class="docs-cat-group" style="margin-bottom: 1.5rem;">
      <div class="docs-cat-title">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <span>${cat.category}</span>
      </div>
      <ul class="docs-cat-links">
        ${cat.topics.map(top => `
          <li>
            <a href="#" class="docs-nav-link" data-id="${top.id}" id="nav-link-${top.id}">${top.title}</a>
          </li>
        `).join('')}
      </ul>
    </div>
  `).join('');

  // Register link events
  sidebarNav.querySelectorAll('.docs-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const topicId = link.getAttribute('data-id');
      loadTopic(topicId);
    });
  });

  // Register search event
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      filterTopics(q);
    });
  }

  // Load first topic on load or from URL Hash
  const hash = window.location.hash.substring(1);
  const found = allTopics.find(t => t.id === hash);
  if (found) {
    loadTopic(hash);
  } else if (allTopics.length > 0) {
    loadTopic(allTopics[0].id);
  }
}

function loadTopic(id) {
  const topic = allTopics.find(t => t.id === id);
  if (!topic) return;

  // Set active link in sidebar
  document.querySelectorAll('.docs-nav-link').forEach(link => {
    link.classList.remove('active');
  });
  const activeLink = document.getElementById(`nav-link-${id}`);
  if (activeLink) {
    activeLink.classList.add('active');
    
    // Ensure parent category/sidebar scrolls to active link or displays it
    activeLink.scrollIntoView({ block: 'nearest' });
  }

  // Update hash
  window.location.hash = id;

  // Render topic content
  const article = document.getElementById('docs-view-article');
  if (article) {
    article.innerHTML = `
      <div style="font-size: 0.85rem; font-family:var(--font-display); color:var(--brand-orange); text-transform:uppercase; font-weight:700; letter-spacing:0.05em; margin-bottom: 0.5rem;">
        ${topic.category}
      </div>
      <h1>${topic.title}</h1>
      <div class="article-content">
        ${topic.content}
      </div>
    `;
    
    // Scroll reading pane back to top
    const pane = document.querySelector('.docs-content');
    if (pane) pane.scrollTop = 0;

    // Render footer buttons (prev / next)
    renderDocsFooterNav(id);
  }

  // On mobile drawer, close sidebar when clicking a link
  const sidebar = document.querySelector('.docs-sidebar');
  if (sidebar && window.innerWidth <= 992) {
    sidebar.style.display = 'none';
  }
}

function renderDocsFooterNav(currId) {
  const footerContainer = document.getElementById('docs-nav-footer-area');
  if (!footerContainer) return;

  const currIdx = allTopics.findIndex(t => t.id === currId);
  const prevTopic = currIdx > 0 ? allTopics[currIdx - 1] : null;
  const nextTopic = currIdx < allTopics.length - 1 ? allTopics[currIdx + 1] : null;

  let footerHtml = "";

  if (prevTopic) {
    footerHtml += `
      <a href="#" class="docs-footer-btn prev" onclick="event.preventDefault(); loadTopicGlobal('${prevTopic.id}');">
        <span class="docs-footer-label">← Previous Topic</span>
        <span class="docs-footer-title">${prevTopic.title}</span>
      </a>
    `;
  } else {
    footerHtml += `<div></div>`; // spacer
  }

  if (nextTopic) {
    footerHtml += `
      <a href="#" class="docs-footer-btn next" onclick="event.preventDefault(); loadTopicGlobal('${nextTopic.id}');">
        <span class="docs-footer-label">Next Topic →</span>
        <span class="docs-footer-title">${nextTopic.title}</span>
      </a>
    `;
  } else {
    footerHtml += `<div></div>`; // spacer
  }

  footerContainer.innerHTML = footerHtml;
}

// Make loadTopic available globally for inline anchor tags
window.loadTopicGlobal = loadTopic;

function filterTopics(query) {
  const groups = document.querySelectorAll('.docs-cat-group');
  if (groups.length === 0) return;

  if (!query) {
    // Show all
    groups.forEach(g => {
      g.style.display = 'block';
      g.querySelectorAll('.docs-nav-link').forEach(link => {
        link.parentElement.style.display = 'block';
      });
    });
    return;
  }

  // Loop categories
  groups.forEach(group => {
    let visibleInGroup = 0;
    const links = group.querySelectorAll('.docs-nav-link');
    
    links.forEach(link => {
      const id = link.getAttribute('data-id');
      const topic = allTopics.find(t => t.id === id);
      
      // Match title or content matching keywords
      const match = topic && (topic.title.toLowerCase().includes(query) || topic.content.toLowerCase().includes(query));
      
      if (match) {
        link.parentElement.style.display = 'block';
        visibleInGroup++;
      } else {
        link.parentElement.style.display = 'none';
      }
    });

    if (visibleInGroup > 0) {
      group.style.display = 'block';
    } else {
      group.style.display = 'none';
    }
  });
}

function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.querySelector('.docs-sidebar');
  if (!menuBtn) return;

  menuBtn.addEventListener('click', () => {
    if (sidebar) {
      if (sidebar.style.display === 'flex' || getComputedStyle(sidebar).display === 'flex') {
        sidebar.style.display = 'none';
      } else {
        sidebar.style.display = 'flex';
        sidebar.style.position = 'fixed';
        sidebar.style.top = '70px';
        sidebar.style.left = '0';
        sidebar.style.width = '280px';
        sidebar.style.height = 'calc(100vh - 70px)';
        sidebar.style.zIndex = '99';
      }
    }
  });
}

// ==========================================================================
// 5. App Entry Initializer
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initDashboardPeriodTabs();
  initPOSSimulator();
  initDocumentation();
  initMobileMenu();
});
