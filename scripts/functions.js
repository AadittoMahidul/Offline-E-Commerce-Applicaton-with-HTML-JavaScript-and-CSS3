var db = openDatabase('Stocksdb','1.0','store database',5*1024*1024);
var unit8Array = [];
var fileType = "";
function createTables() {
    db.transaction(tx=> {
        var sql = `CREATE TABLE IF NOT EXISTS customers
        (
            customerid INTEGER PRIMARY KEY AUTOINCREMENT,
            customername VARCHAR(30),
            phone VARCHAR(20),
            email VARCHAR(50),
            address VARCHAR(100),
            password VARCHAR(10)
        )`;
        tx.executeSql(sql, [], tx=> {
            console.log('Customers table created');
        }, err=> {
            console.log('Failed to create customes table: ' + err);
        });
        sql = `CREATE TABLE IF NOT EXISTS products
        (
            productid INTEGER PRIMARY KEY AUTOINCREMENT,
            productname VARCHAR(30),
            price REAL,
            description VARCHAR(150),
            picture BLOB,
            pictype VARCHAR(50)
        )`;
        tx.executeSql(sql, [], (tx, result)=> {
            console.log('Products table created');
        }, err=> {
            console.log('Failed to create products table: '+err);
        });
        sql = `CREATE TABLE IF NOT EXISTS orders
        (
            orderid INTEGER PRIMARY KEY AUTOINCREMENT,
            orderdate DATETIME,
            productid INTEGER REFERENCES products(productid),
            customerid INTEGER REFERENCES customes (customerid),
            quantity INTEGER,
            status VARCHAR(20)
        )`;
        tx.executeSql(sql, [], tx=> {
            console.log('Orders table created');
        }, err=> {
            console.log('Failed to create orders table: '+err);
        });
    });
}
function exec(sql, data){
   console.log(data)
    return new Promise((resolve, reject)=>{
        db.transaction(tx=>{
            tx.executeSql(sql, data, 
                (tx, result)=>{
                    resolve({success: true, insertId: result.insertId, rowsAffected: result.rowsAffected});
                },
                (tx, err)=>{
                    reject({success: false, error: err.message || err});
                });
        });
       
    });
}
function select(sql, data){
     return new Promise((resolve, reject)=>{
        db.transaction(tx=>{
            tx.executeSql(sql, data, 
                (tx, result)=>{
                    console.log(result)
                    resolve({success: true, data:result.rows});
                },
                (tx, err)=>{
                    reject({success: false, error: err.message || err});
                })
        });
        
     });
 }
 function checkLogin() {
    return sessionStorage.getItem('user-data') != null;
 }
 function login(email,p, scb, ecb) {
    select("SELECT customerid, customername FROM customers WHERE email=? AND password=?",[email, p])
    .then(r=>{
        let data={id: r.data.item(0).customerid, name: r.data.item(0).customername};
        sessionStorage.setItem("user-data", JSON.stringify(data));
        scb(data);
    })
    .catch(err=>{
        ecb(err.error);
    });
 }
 function getCartItemCount(){
    var cart = localStorage.getItem("cart");
    let count = 0;
    if(cart == null) cart = {items:[]};
    else cart = JSON.parse(cart);
    cart.items.forEach(x => {
        count += x.qty;
    });
    return count;
 }
 function fileToUnit8Array(f) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(f);
    reader.onloadend = function (evt) {
        if (evt.target.readyState == FileReader.DONE) {
            var arrayBuffer = evt.target.result,
                array = new Uint8Array(arrayBuffer);
            for (var i = 0; i < array.length; i++) {
                unit8Array.push(array[i]);
            }

        }
    }
}
function unit8ArrayToPicture(id, bytes, type) {
    const content = new Uint8Array(bytes.split(','));
    document.getElementById(id).src = URL.createObjectURL(
        new Blob([content.buffer], { type: type })
    );
}
function formatDate(d) {
    return [
        d.getFullYear(),
        (d.getMonth() + 1).toString().padStart(2, '0'),
        d.getDate().toString().padStart(2, '0')
    ].join('-');
}