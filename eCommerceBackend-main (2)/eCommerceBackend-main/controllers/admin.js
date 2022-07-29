const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true,
    editing: false
  });
};

exports.getEditProduct = (req,res,next) =>{
  const productId = req.params.productId;
  const editMode = req.query.edit;

  if(!editMode)
   return res.redirect('/');

  // opening the edit mode using req.user.getProducts()
  // this returns us products array
  req.user
  .getProducts({where: {id: productId}})
  .then((products)=>{
    const product = products[0];
    if(!product){
      return res.redirect('/');
    }

    res.render('admin/edit-product', {
      product: product,
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      formsCSS: true,
      editing: editMode
    });
  })
  .catch((err)=>console.log(err));
}

exports.postEditProduct = (req,res,next) =>{
  const prodId = req.body.id;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  // modifying the details after edit and then .save()
  // to save in database
  Product.findByPk(prodId)
  .then((product) => {
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDesc;
    product.imageUrl = updatedImageUrl;
    return product.save();
  })
  .then(result=>{
    console.log('UPDATED PRODUCT!');
    res.redirect('/admin/products');
  })
  .catch(err=>console.log(err));
}

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  // creating or adding products using sequelize to 
  // mysql, using createProduct instead of create
  // as a special method offered by association
  // req.user is added from middleware
  req.user
  .createProduct({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description
  })
  .then((result)=>{
    res.redirect('/admin/products');
    console.log(result);
  })
  .catch((err)=>console.log(err));
};

exports.getProducts = (req, res, next) => {
  req.user.getProducts()
  .then((products)=>{
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    })
  })
  .catch((err)=> console.log(err));

};

exports.getDeleteProduct = (req,res, next)=>{
  const productId = req.body.id;
  Product.findByPk(productId)
  .then((product)=>{
    return product.destroy();
  })
  .then(()=>{
    res.redirect('/admin/products');
  })
  .catch((err)=>console.log(err));
}