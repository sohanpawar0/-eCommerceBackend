const Cart = require('../models/cart');
const OrderDetails = require('../models/order-details');
const Order = require('../models/order');
const Product = require('../models/product');

let itemsPerPage = 2;
let cartItemsPerPage = 2;
let totalItems;
let totalCartItems;

exports.getProducts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const hasNextPage = (currentPage*itemsPerPage) < totalItems ? true : false;
  let lastPage;

  // getting products using sequelize
  Product
  .count()
  .then(count=> {
    totalItems = count;
    lastPage = Math.ceil(totalItems/itemsPerPage);
    return Product.findAll({
      limit: itemsPerPage,
      offset: (currentPage-1)*itemsPerPage
    })
  })
  .then((products)=>{
    res.json({products,totalItems,currentPage,hasNextPage,lastPage});
  })
  .catch((err)=> console.log(err));
};


exports.getProductDetails = (req,res,next)=>{
  const prodId = req.params.productId;

  // sequelize uses findByPk to find elements by Id in database
  // returns a single element
  Product.findByPk(prodId)
  .then((product)=>{
    res.render('shop/product-detail', {
      product: product,
      pageTitle: 'Product',
      path: `/products`
    });
  })
  .catch((err)=>console.log(err));

  // we could have used findAll({where: {id:prodId}})
  // it does the same just returns an array of elements
}

// sequelize uses findAll to return all data from database
exports.getIndex = (req, res, next) => {
  Product.findAll()
  .then((products)=>{
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  })
  .catch((err)=> console.log(err));
};

// for adding the element to cart 
// (redirecting to '/' for now, will be modified)
exports.addToCart = (req,res,next)=>{
  const productId = req.body.prodId;
  let fetchedCart;
  let newQuantity = 1;

  req.user
  .getCart()
  .then(cart=>{
    fetchedCart = cart;
    return cart.getProducts({ where: { id: productId }})
  })
  .then(products=>{
    let product;

    if(products.length > 0){
      product = products[0];
    }

    if(product){
      const oldQuantity = product.cartItem.quantity;
      newQuantity = oldQuantity + 1;
      return product;
    }

    return Product.findByPk(productId);
    })
    .then((product)=>{
        return fetchedCart.addProduct(product,{through: {quantity: newQuantity}});

    })
    .then(()=> res.redirect('/cart'))
    .catch(err=> console.log(err));
}

exports.getCart = (req, res, next) => {
  let fetchedCart;
  const currentCart = req.query.cart || 1;
  const hasNextCart = (currentCart*cartItemsPerPage) < totalCartItems ? true : false;
  let lastCart;
  req.user
    .getCart()
    .then((cart)=>{
      fetchedCart = cart;
      return cart
      .getProducts()
      .then(products => {
          totalCartItems = products.length;
          lastCart = Math.ceil(totalCartItems/cartItemsPerPage);
          return fetchedCart
          .getProducts({
            limit: cartItemsPerPage,
            offset: (currentCart-1)*cartItemsPerPage
          })
          .then((products)=>{
            res.json({products,totalCartItems,currentCart,hasNextCart,lastCart});
          // res.render('shop/cart', {
          //   products: products,
          //   path: '/cart',
          //   pageTitle: 'Your Cart'
          // });
          })

       })
       .catch(err=>console.log(err));
    })
    .catch((err)=> console.log(err));
};

exports.postCartDelete = (req,res,next)=>{
 const productId = req.body.prodId;
 console.log(`${productId} in postCart1`);
 
 req.user
 .getCart()
 .then(cart=>{
   console.log(`${productId} in postCart2`);
   return cart.getProducts({where: {id:productId}})
 })
 .then((products)=>{
  console.log(`${productId} in postCart3`);
  const product = products[0];

  return product.cartItem.destroy();
 })
 .then((r)=> {
  console.log(`${productId} in postCart4`);
  res.json(r)})
 .catch((err)=>console.log(err));
}

exports.getOrders = async(req, res, next) => {

  const orders = await req.user.getOrders({include: ['products']});
  const orderDetails = orders.map(order=> {
    return {id:order.id,products: order.products}
  });
  const cart = await req.user.getCart();
  await cart.setProducts(null);

  res.json(orderDetails);
};

exports.postOrders = (req, res, next) =>{
  let productsToBeAdded;
  let orderId;
  req.user
  .getCart()
  .then((cart)=>{
    return cart.getProducts();
  })
  .then((products)=>{
    productsToBeAdded = products;
    return req.user.createOrder();
  })
  .then((order)=>{
    orderId = order.id;
    return order.addProducts(productsToBeAdded);
  })
  .then(()=>{
    productsToBeAdded.forEach(product => {
      product.cartItem.destroy();
    });
  })
  .then(()=>{
    res.json(orderId);
  })
  .catch((error)=>console.log(error));
}

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
