let express = require("express");
let app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  next();
});
var port = process.env.PORT || 2410
app.listen(port, () => console.log(`Node app Listening on port ${port}!`))
let { data } = require("./shopsData.js")
const { shops, products, purchases } = data;

let fs = require("fs");
let fname = "shops.json";
let fname1 = "products.json";
let fname2 = "purchases.json"


app.get("/shops/resetData", function (req, res) {
  let data = JSON.stringify(shops)
  console.log(data);
  fs.writeFile(fname, data, function (err) {
    if (err) res.status(404).send(err)
    else res.send("Data in the file is reset")
  })
})

app.get("/shops", function (req, res) {
  fs.readFile(fname, "utf-8", function (err, data) {
    if (err) res.status(404).send(err)
    else {
      let shopsArr = JSON.parse(data)
      res.send(shopsArr)
    }
  })
})

app.post("/shops", function (req, res) {
  let body = req.body;
  fs.readFile(fname, "utf-8", function (err, data) {
    if (err) res.status(404).send(err)
    else {
      let shopsArr = JSON.parse(data);
      let maxid = shopsArr.reduce((acc, curr) => curr.shopId >= acc ? curr.shopId : acc, 0);
      let newid = maxid + 1;
      let newShop = { shopId: newid, ...body }
      shopsArr.push(newShop);
      let data1 = JSON.stringify(shopsArr);
      fs.writeFile(fname, data1, function (err) {
        if (err) res.status(404).send(err)
        else res.send(newShop)
      })


    }
  })
})




app.get("/products/resetData", function (req, res) {
  let data = JSON.stringify(products);
  fs.writeFile(fname1, data, function (err) {
    if (err) res.status(404).send(err)
    else res.send("Products Data in the file is reset")
  })
})

app.get("/products", function (req, res) {
  fs.readFile(fname1, "utf-8", function (err, data) {
    if (err) res.status(404).send(err)
    else {
      let productsArr = JSON.parse(data)
      res.send(productsArr)
    }
  })
})

app.post("/products", function (req, res) {
  let body = req.body;
  fs.readFile(fname1, "utf-8", function (err, data) {
    if (err) res.status(404).send(err)
    else {
      let productsArr = JSON.parse(data);
      let maxid = productsArr.reduce((acc, curr) => curr.productId >= acc ? curr.productId : acc, 0);
      let newid = maxid + 1;
      let newProduct = { productId: newid, ...body }
      productsArr.push(newProduct);
      let data1 = JSON.stringify(productsArr);
      fs.writeFile(fname1, data1, function (err) {
        if (err) res.status(404).send(err)
        else res.send(productsArr)
      })


    }
  })
})

app.get("/products/:id", function(req,res){
  let id = +req.params.id;
  fs.readFile(fname1, "utf-8", function(err, data)
  {
      if(err) res.status(404).send(err)
      else {
          let productsArr = JSON.parse(data)
          let product = productsArr.find((p) => p.productId === id)
          if(product)
          {
              res.send(product)
          }
          else
          {
              res.status(404).send("No product found")
          }
    }
  })
})


app.put("/products/:id", function (req, res) {
  let body = req.body;
  let id = +req.params.id
  fs.readFile(fname1, "utf-8", function (err, data) {
    if (err) res.status(404).send(err)
    else {
      let productsArr = JSON.parse(data);
      let index = productsArr.findIndex((p) => p.productId === id)
      if (index >= 0) {
        let updateProduct = { productId: productsArr[index].productId, productName: productsArr[index].productName, ...body }
        productsArr[index] = updateProduct;
        let data1 = JSON.stringify(productsArr)
        fs.writeFile(fname1, data1, function (err) {
          if (err) res.status(404).send(err);
          else res.send(updateProduct)
        })
      }
      else {
        res.status(404).send("No product found")
      }
    }
  })
})




app.get("/purchases/resetData", function (req, res) {
  let data = JSON.stringify(purchases)
  console.log(data);
  fs.writeFile(fname2, data, function (err) {
    if (err) res.status(404).send(err)
    else res.send("Purchases Data in the file is reset")
  })
})





app.get("/purchases", function (req, res) {
  let productId = req.query.product ? req.query.product.split(",").map(Number) : [];
  let shopId = req.query.shop;
  let sort = req.query.sort
  console.log(shopId)
  fs.readFile(fname, "utf-8", function (err, data) {
    if (err) {
      res.status(404).send(err);
    } else {
       let shopsArr  = JSON.parse(data);
      
      fs.readFile(fname1, "utf-8", function (err, data) {
        if (err) {
          res.status(404).send(err);
        } else {
          let productsArr = JSON.parse(data);
          

          fs.readFile(fname2, "utf-8", function (err, data) {
            if (err) {
              res.status(404).send(err);
            } else {
              let purchaseArr = JSON.parse(data);
              const joinArr = purchaseArr.map((p) => {
                const productData = productsArr.find((pr) => pr.productId === p.productid);
                const shopData = shopsArr.find((s) => s.shopId === p.shopId )
                return {...p, ...shopData, ...productData}
              })
              let arr1 = joinArr;
              if(productId.length > 0)
              {
                arr1 = arr1.filter((p) => productId.indexOf(p.productid) !== -1);
              }
              if(shopId)
              {
                let str = shopId.substring(2,3)
                arr1 = arr1.filter((p) => p.shopId === +str )
              }
              if(sort)
              {
                switch(sort){
                  case "QtyAsc":
                    arr1.sort((a,b) => a.quantity - b.quantity )
                    break;
                  case "QtyDesc":
                    arr1.sort((a,b) => b.quantity - a.quantity )
                    break;
                  case "ValueAsc":
                    arr1.sort((a,b) => a.quantity*a.price - b.quantity*b.price )
                    break;
                  case "ValueDesc":
                    arr1.sort((a,b) => b.quantity*b.price - a.quantity*a.price )
                    break;
                  

                    default:
                      break;
                }
              }
              res.send(arr1);
            }
          });
        }
      });
    }
  });
});





app.get("/purchases/products/:id", function (req, res) {
 let id = +req.params.id
  fs.readFile(fname, "utf-8", function (err, data) {
    if (err) {
      res.status(404).send(err);
    } else {
       let shopsArr  = JSON.parse(data);
      
      fs.readFile(fname1, "utf-8", function (err, data) {
        if (err) {
          res.status(404).send(err);
        } else {
          let productsArr = JSON.parse(data);
          

          fs.readFile(fname2, "utf-8", function (err, data) {
            if (err) {
              res.status(404).send(err);
            } else {
              let purchaseArr = JSON.parse(data);
              const joinArr = purchaseArr.map((p) => {
                const productData = productsArr.find((pr) => pr.productId === p.productid);
                const shopData = shopsArr.find((s) => s.shopId === p.shopId )
                return {...p, ...shopData, ...productData}
              })
              let arr1 = joinArr.filter((j) => j.productId === id)
              res.send(arr1);
            }
          });
        }
      });
    }
  });
});

app.get("/purchases/shops/:id", function (req, res) {
  let id = +req.params.id
   fs.readFile(fname, "utf-8", function (err, data) {
     if (err) {
       res.status(404).send(err);
     } else {
        let shopsArr  = JSON.parse(data);
       
       fs.readFile(fname1, "utf-8", function (err, data) {
         if (err) {
           res.status(404).send(err);
         } else {
           let productsArr = JSON.parse(data);
           
 
           fs.readFile(fname2, "utf-8", function (err, data) {
             if (err) {
               res.status(404).send(err);
             } else {
               let purchaseArr = JSON.parse(data);
               const joinArr = purchaseArr.map((p) => {
                 const productData = productsArr.find((pr) => pr.productId === p.productid);
                 const shopData = shopsArr.find((s) => s.shopId === p.shopId )
                 return {...p, ...shopData, ...productData}
               })
               let arr1 = joinArr.filter((j) => j.shopId === id)
               res.send(arr1);
             }
           });
         }
       });
     }
   });
 });
 



app.post("/purchases", function (req, res) {
  let body = req.body;
  fs.readFile(fname2, "utf-8", function (err, data) {
    if (err) res.status(404).send(err)
    else {
      let purchasesArr = JSON.parse(data);
      let maxid = purchasesArr.reduce((acc, curr) => curr.purchaseId >= acc ? curr.purchaseId : acc, 0);
      let newid = maxid + 1;
      let newPurchase = { purchaseId: newid, ...body }
      purchasesArr.push(newPurchase);
      let data1 = JSON.stringify(purchasesArr);
      fs.writeFile(fname2, data1, function (err) {
        if (err) res.status(404).send(err)
        else res.send(purchasesArr)
      })
    }
  })
})



app.get("/totalPurchase/:forType/:id", function (req, res) {
  const Id = +req.params.id;
  const forType = req.params.forType; 
  fs.readFile(fname2, "utf-8", function (err, data) {
    if (err) res.status(404).send(err);
    else {
      const purchasesArr = JSON.parse(data);
      let shopPurchases;

      if (forType === "shop") {
        shopPurchases = purchasesArr.filter((p) => p.shopId === Id);
      } else if (forType === "product") {
        shopPurchases = purchasesArr.filter((p) => p.productid === Id);
      } 
      res.send(shopPurchases);
    }
  });
});





