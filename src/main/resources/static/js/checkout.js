const PHIVANCHUYEN = 30000;
let priceFinal = document.getElementById("checkout-cart-price-final");
let selectedDate;
// Trang thanh toan
async function thanhtoanpage(option,product) {
    let currentUser = JSON.parse(localStorage.getItem('currentuser'));
    // Xu ly ngay nhan hang
    let today = new Date();
    let ngaymai = new Date();
    let ngaykia = new Date();
    ngaymai.setDate(today.getDate() + 1);
    ngaykia.setDate(today.getDate() + 2);
    let formatDate = (date) => {
        let day = date.getDate().toString().padStart(2, '0');
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let year = (date.getFullYear())
        return `${day}/${month}/${year}`;
    };
    let dateorderhtml = `<a href="javascript:;" class="pick-date active" data-date="${today.toISOString()}">
        <span class="text">Hôm nay</span>
        <span class="date">${formatDate(today)}</span>
        </a>
        <a href="javascript:;" class="pick-date" data-date="${ngaymai.toISOString()}">
            <span class="text">Ngày mai</span>
            <span class="date">${formatDate(ngaymai)}</span>
        </a>

        <a href="javascript:;" class="pick-date" data-date="${ngaykia.toISOString()}">
            <span class="text">Ngày kia</span>
            <span class="date">${formatDate(ngaykia)}</span>
    </a>`
    document.querySelector('.date-order').innerHTML = dateorderhtml;

    selectedDate = formatDate(today);
    let pickdate = document.getElementsByClassName('pick-date')
    for(let i = 0; i < pickdate.length; i++) {
        pickdate[i].onclick = function () {
            document.querySelector(".pick-date.active").classList.remove("active");
            this.classList.add('active');
            let chosenDate = new Date(this.getAttribute('data-date'));
            selectedDate = formatDate(chosenDate);
        }
    }

    let totalBillOrder = document.querySelector('.total-bill-order');
    let totalBillOrderHtml;
    let amount=0;
    try {
        const response = await fetch(`http://localhost:8080/cart/get-cart/${currentUser.id}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const result = await response.json();
        amount = result.data.cartItems.length;
    } catch (error) {
        console.error("Có lỗi xảy ra trong quá trình lấy sản phẩm:", error);
    }
    // Xu ly don hang
    switch (option) {
        case 1: // Truong hop thanh toan san pham trong gio
            // Hien thi don hang
            showProductCart();
            // Tinh tien
            totalBillOrderHtml = `<div class="priceFlx">
            <div class="text">
                Tiền hàng 
                <span class="count">${amount} món</span>
            </div>
            <div class="price-detail">
                <span id="checkout-cart-total">${vnd(getCartTotal())}</span>
            </div>
        </div>
        <div class="priceFlx chk-ship">
            <div class="text">Phí vận chuyển</div>
            <div class="price-detail chk-free-ship">
                <span>${vnd(PHIVANCHUYEN)}</span>
            </div>
        </div>`;
            // Tong tien
            priceFinal.innerText = vnd(getCartTotal() + PHIVANCHUYEN);
            break;
        case 2: // Truong hop mua ngay
            // Hien thi san pham
            showProductBuyNow(product);
            // Tinh tien
            totalBillOrderHtml = `<div class="priceFlx">
                <div class="text">
                    Tiền hàng 
                    <span class="count">1 món</span>
                </div>
                <div class="price-detail">
                    <span id="checkout-cart-total">${vnd(product.soluong * product.price)}</span>
                </div>
            </div>
            <div class="priceFlx chk-ship">
                <div class="text">Phí vận chuyển</div>
                <div class="price-detail chk-free-ship">
                    <span>${vnd(PHIVANCHUYEN)}</span>
                </div>
            </div>`
            // Tong tien
            priceFinal.innerText = vnd((product.soluong * product.price) + PHIVANCHUYEN);
            break;
    }

    // Tinh tien
    totalBillOrder.innerHTML = totalBillOrderHtml;

    // Xu ly hinh thuc giao hang
    let giaotannoi = document.querySelector('#giaotannoi');
    let tudenlay = document.querySelector('#tudenlay');
    let tudenlayGroup = document.querySelector('#tudenlay-group');
    let chkShip = document.querySelectorAll(".chk-ship");
    
    tudenlay.addEventListener('click', () => {
        giaotannoi.classList.remove("active");
        tudenlay.classList.add("active");
        chkShip.forEach(item => {
            item.style.display = "none";
        });
        tudenlayGroup.style.display = "block";
        switch (option) {
            case 1:
                priceFinal.innerText = vnd(getCartTotal());
                break;
            case 2:
                priceFinal.innerText = vnd((product.soluong * product.price));
                break;
        }
    })

    giaotannoi.addEventListener('click', () => {
        tudenlay.classList.remove("active");
        giaotannoi.classList.add("active");
        tudenlayGroup.style.display = "none";
        chkShip.forEach(item => {
            item.style.display = "flex";
        });
        switch (option) {
            case 1:
                priceFinal.innerText = vnd(getCartTotal() + PHIVANCHUYEN);
                break;
            case 2:
                priceFinal.innerText = vnd((product.soluong * product.price) + PHIVANCHUYEN);
                break;
        }
    })

    // Su kien khu nhan nut dat hang
    document.querySelector(".complete-checkout-btn").onclick = () => {
        switch (option) {
            case 1:
                xulyDathang();
                break;
            case 2:
                xulyDathang(product);
                break;
        }
    }
}

// Hiển thị sản phẩm trong giỏ hàng
async function showProductCart() {
    let currentUser = JSON.parse(localStorage.getItem('currentuser'));
    let listOrder = document.getElementById("list-order-checkout");
    let listOrderHtml = '';

    try {
        let response = await fetch(`http://localhost:8080/cart/get-cart/${currentUser.id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (response.ok) {
            let cartData = await response.json();
            let cartItems = cartData.data.cartItems;

            cartItems.forEach(item => {
                listOrderHtml += `
                    <div class="food-total">
                        <div class="count">${item.quantity}x</div>
                        <div class="info-food">
                            <div class="name-food">${item.product.title}</div>
                        </div>
                    </div>`;
            });

            listOrder.innerHTML = listOrderHtml;
        } else {
            console.error('Failed to fetch cart items from backend');
            listOrder.innerHTML = '<div class="error">Không thể tải giỏ hàng!</div>';
        }
    } catch (error) {
        console.error('Error fetching cart:', error);
        listOrder.innerHTML = '<div class="error">Lỗi kết nối đến server!</div>';
    }
}

// Hien thi hang mua ngay
function showProductBuyNow(product) {
    let listOrder = document.getElementById("list-order-checkout");
    let listOrderHtml = `<div class="food-total">
        <div class="count">${product.soluong}x</div>
        <div class="info-food">
            <div class="name-food">${product.title}</div>
        </div>
    </div>`;
    listOrder.innerHTML = listOrderHtml;
}

//Open Page Checkout
let nutthanhtoan = document.querySelector('.thanh-toan')
let checkoutpage = document.querySelector('.checkout-page');
nutthanhtoan.addEventListener('click', () => {
    checkoutpage.classList.add('active');
    thanhtoanpage(1);
    closeCart();
    body.style.overflow = "hidden"
})

// Đặt hàng ngay
function dathangngay() {
    let productInfo = document.getElementById("product-detail-content");
    let datHangNgayBtn = productInfo.querySelector(".button-dathangngay");
    datHangNgayBtn.onclick = () => {
        if(localStorage.getItem('currentuser')) {
            let productId = datHangNgayBtn.getAttribute("data-product");
            let soluong = parseInt(productInfo.querySelector(".buttons_added .input-qty").value);
            let notevalue = productInfo.querySelector("#popup-detail-note").value;
            let ghichu = notevalue == "" ? "Không có ghi chú" : notevalue;
            let products = JSON.parse(localStorage.getItem('products'));
            let a = products.find(item => item.id == productId);
            a.soluong = parseInt(soluong);
            a.note = ghichu;
            checkoutpage.classList.add('active');
            thanhtoanpage(2,a);
            closeCart();
            body.style.overflow = "hidden"
        } else {
            toast({ title: 'Warning', message: 'Chưa đăng nhập tài khoản !', type: 'warning', duration: 3000 });
        }
    }
}

// Close Page Checkout
function closecheckout() {
    checkoutpage.classList.remove('active');
    body.style.overflow = "auto"
}

// Thong tin cac don hang da mua - Xu ly khi nhan nut dat hang
async function xulyDathang(product) {
    let diachinhan = "";
    let hinhthucgiao = "";
    let thoigiangiao = "";
    let giaotannoi = document.querySelector("#giaotannoi");
    let tudenlay = document.querySelector("#tudenlay");
    let giaongay = document.querySelector("#giaongay");
    let giaovaogio = document.querySelector("#deliverytime");
    let ghichudon = "";
    let currentUser = JSON.parse(localStorage.getItem('currentuser'));

    
    // Hinh thuc giao & Dia chi nhan hang
    if (giaotannoi.classList.contains("active")) {
        diachinhan = document.querySelector("#diachinhan").value;
        hinhthucgiao = giaotannoi.innerText;
    }
    if (tudenlay.classList.contains("active")) {
        let chinhanh1 = document.querySelector("#chinhanh-1");
        let chinhanh2 = document.querySelector("#chinhanh-2");
        diachinhan = "Tự đến tại quầy";
        if (chinhanh1.checked) {
            diachinhan = "Học viện Công nghệ Bưu Chính Viễn Thông 1";
        }
        if (chinhanh2.checked) {
            diachinhan = "Học viện Công nghệ Bưu Chính Viễn Thông 2";
        }
        hinhthucgiao = tudenlay.innerText;
    }

    // Thoi gian nhan hang
    if (giaongay.checked) {
        thoigiangiao = "Giao ngay khi xong";
    }
    if (giaovaogio.checked) {
        thoigiangiao = document.querySelector(".choise-time").value;
    }

    let products=[];

    try {
        if(product==undefined){
            let response = await fetch(`http://localhost:8080/cart/get-cart/${currentUser.id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (response.ok) {
                let cartData = await response.json();
                let cart = cartData.data.cartItems;
                let tongtien = 0;

                if (cart.length === 0) {
                    toast({ title: 'Chú ý', message: 'Giỏ hàng trống! Không thể đặt hàng.', type: 'warning', duration: 4000 });
                    return;
                }

                products = cart.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    note: item.note
                }));
            } else {
                console.error('Failed to fetch cart items from backend');
                toast({ title: 'Lỗi', message: 'Không thể tải giỏ hàng!', type: 'error', duration: 4000 });
            }
        } else {
            let noteSolve="";
            if(product.note == ""){
                noteSolve = "Không có ghi chú";
            }
            else{
                noteSolve = product.note;
            }
            products.push({
                productId: product.id,
                quantity: product.soluong,
                note: noteSolve
            });
        }

    } catch (error) {
        console.error('Error fetching cart:', error);
        toast({ title: 'Lỗi', message: 'Lỗi kết nối đến server!', type: 'error', duration: 4000 });
    }
    let tennguoinhan = document.querySelector("#tennguoinhan").value;
    let sdtnhan = document.querySelector("#sdtnhan").value;
    ghichudon = document.querySelector(".note-order").value;
    if (ghichudon == "") {
        ghichudon = "Không có ghi chú";
    }
    thoigiangiao += " " + selectedDate;
    if (tennguoinhan === "" || sdtnhan === "" || diachinhan === "") {
        toast({ title: 'Chú ý', message: 'Vui lòng nhập đầy đủ thông tin !', type: 'warning', duration: 4000 });
    } else {
        let orderRequest = {
            userId: currentUser.id, 
            shippingMethod: hinhthucgiao,
            deliveryAddress: diachinhan,
            recipientName: tennguoinhan,
            recipientPhone: sdtnhan,
            expectedDeliveryDate: thoigiangiao,
            products: products,
            status: 0,
            noteOrder: ghichudon
        };
        fetch('http://localhost:8080/order/insert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderRequest),
        })
        .then(response => {
            return response.json();
        })
        .then(async data => {
            if (data.success) {
                toast({ title: 'Thành công', message: 'Đặt hàng thành công !', type: 'success', duration: 1000 });
                await deleteCart(currentUser.id);
                setTimeout(() => {
                    window.location = "/index";
                }, 2000);
            } else {
                toast({ title: 'Thất bại', message: 'Đặt hàng không thành công !', type: 'error', duration: 4000 });
            }
        })
        .catch(error => {
            console.error('Lỗi:', error);
            toast({ title: 'Lỗi', message: 'Có lỗi xảy ra, vui lòng thử lại !', type: 'error', duration: 4000 });
        });
    }
}

// Hàm xóa giỏ hàng
async function deleteCart(userId) {
    try {
        let response = await fetch(`http://localhost:8080/cart/deleteAll/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`
            }
        });
    } catch (error) {
        console.error('Lỗi kết nối khi xóa giỏ hàng:', error);
    }
}

function getpriceProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    let sp = products.find(item => {
        return item.id == id;
    })
    return sp.price;
}