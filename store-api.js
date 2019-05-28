var express = require('express');
var app = express();
var fs = require("fs");

var mysql = require('mysql');
var config = require('./db_config.js');
var con = mysql.createConnection(config);

app.use(express.json());

//Sign up
app.post('/signupEmployee', function (req, res) {
      var employee_username = req.body.employee_username;
      var employee_password = req.body.employee_password;
      var employee_phone = req.body.employee_phone;
      var employee_email = req.body.employee_email;
      //check if employee is registered already
      var check_employee = "SELECT employee_username FROM employees WHERE employee_username = ? OR employee_phone = ? OR employee_email = ?";
      con.query(check_employee, [employee_username, employee_phone, employee_email], function (err, result) {
      if (result.length > 0) {
         console.log(err);
       res.json( {Status:2,Message:"Employee with username or phone or email already exists.",ResponseCode:200} );
      } else {
        //insert employee details
        var current_date_time = new Date().toJSON()
        var create_employee = "INSERT INTO employees (employee_username, employee_password, employee_phone, employee_email, created_at, updated_at) VALUES(?,?,?,?,?,?)";
        con.query(create_employee, [employee_username, employee_password, employee_phone, employee_email, current_date_time, current_date_time], function (err, result) {
        if (err) throw err;
         res.json( {Status:1,Message:"Employee has been registered successfully!",ResponseCode:200} );
        });
      }
    });
})


//Log in
app.post('/loginEmployee', function (req, res) {
   var employee_username = req.body.employee_username;
   var employee_password = req.body.employee_password;
   var login_employee = "SELECT employee_id, employee_username, employee_password FROM employees WHERE employee_username = ? AND employee_password = ?";
   con.query(login_employee, [employee_username, employee_password], function (err, result) {
   if (result.length == 0) {
    res.json( {Status:2,Message:"Employee with this username or password doesn't exist.",ResponseCode:200} );
   } else {
      res.json( {Status:1,Message:"Logged in successfully",ResponseCode:200,EmployeeID:result[0].employee_id} );
   }
 });
})


//Update Employee
app.put('/updateEmployee', function (req, res) {
   var employee_username = req.body.employee_username;
   var employee_phone = req.body.employee_phone;
   var employee_email = req.body.employee_email;
   var employee_id = req.body.employee_id;
   //check if updation exists already
   var check_employee = "SELECT employee_username FROM employees WHERE employee_username = ? OR employee_phone = ? OR employee_email = ?";
   con.query(check_employee, [employee_username, employee_phone, employee_email], function (err, result) {
   if (result.length != 0) {
    res.json( {Status:2,Message:"Employee with username or phone or email already exists.",ResponseCode:200} );
   } else {
     //update employee details
     var current_date_time = new Date().toJSON()
     var update_employee = "UPDATE employees SET employee_username=?, employee_phone=?, employee_email=?, updated_at=? WHERE employee_id=?";
     con.query(update_employee, [employee_username, employee_phone, employee_email, current_date_time, employee_id], function (err, result) {
     if (err) throw err;
      if (result.affectedRows == 0) {
         res.json( {Status:3,Message:"Failed",ResponseCode:200} );
      } else {
         res.json( {Status:1,Message:"Employee details has been updated successfully!",ResponseCode:200} );
      }
     });
   }
 });
})


//Delete
app.delete('/deleteEmployee', function (req, res) {
   var employee_id = req.body.employee_id;
   var check_employee = "SELECT employee_id FROM employees WHERE employee_id = ?";
   con.query(check_employee, [employee_id], function (err, result) {
   if (result.length == 0) {
    res.json( {Status:2,Message:"Employee ID doesn't exist.",ResponseCode:200} );
   } else {
      //check items of this employee first
      var check_employee_items = "SELECT employee_id FROM items WHERE employee_id = ?";
      con.query(check_employee_items, [employee_id], function (err, result) {
      if (result.length == 0) {
         var delete_employee = "DELETE FROM employees WHERE employee_id=?";
         con.query(delete_employee, [employee_id], function (err, result) {
            if (err) throw err;
               if (result.affectedRows == 0) {
                  res.json( {Status:3,Message:"Failed",ResponseCode:200} );
               } else {
                  res.json( {Status:1,Message:"Employee details has been deleted successfully!",ResponseCode:200} );
               }
            });       
      } else {
         //delete employee details
         var delete_items = "DELETE FROM items WHERE items.employee_id=?";
         var delete_employee = "DELETE FROM employees WHERE employee_id=?";
         con.query(delete_items, [employee_id], function (err, result) {
            if (err) throw err;
               if (result.affectedRows == 0) {
                  res.json( {Status:3,Message:"Failed",ResponseCode:200} );
               } else {
                  con.query(delete_employee, [employee_id], function (err, result) {
                     if (err) throw err;
                        if (result.affectedRows == 0) {
                           res.json( {Status:3,Message:"Failed",ResponseCode:200} );
                        } else {
                           res.json( {Status:1,Message:"Employee details has been deleted successfully!",ResponseCode:200} );
                        }
                     });
               }
            });
      }
      });
   }
 });
})


//Add items
app.post('/addItems', function (req, res) {
   var item_name = req.body.item_name;
   var item_stock = req.body.item_stock;
   var employee_id = req.body.employee_id;
   //check if item is in stock already
   var check_employee = "SELECT item_stock FROM items WHERE item_name = ? AND employee_id = ?";
   con.query(check_employee, [item_name, employee_id], function (err, result) {
   if (result.length != 0) {
        res.json( {Status:1,Message:"Item stock already exists",ResponseCode:200} );
   } else {
        //insert new item stock
        var current_date_time = new Date().toJSON()
        var create_employee = "INSERT INTO items (item_name, item_category, item_stock, employee_id, created_at, updated_at) VALUES(?,'Electronics',?,?,?,?)";
        con.query(create_employee, [item_name, item_stock, employee_id, current_date_time, current_date_time], function (err, result) {
        if (err) throw err;
         if (result.affectedRows == 0) {
            res.json( {Status:3,Message:"Failed",ResponseCode:200} );
         } else {
            res.json( {Status:1,Message:"Item stock has been inserted successfully!",ResponseCode:200} );
         }         
        });  
   }
 });
})


//Update items
app.put('/updateItems', function (req, res) {
   var item_name = req.body.item_name;
   var item_stock = req.body.item_stock;
   var employee_id = req.body.employee_id;
   //check if item is in stock already
   var check_employee = "SELECT item_stock FROM items WHERE item_name = ? AND employee_id = ?";
   con.query(check_employee, [item_name, employee_id], function (err, result) {
   if (result.length == 0) {
    res.json( {Status:2,Message:"Item stock failed to update",ResponseCode:200} );
   } else {
     //update item stock
     var current_date_time = new Date().toJSON()
     var update_employee = "UPDATE items SET item_name=?, item_stock=?+?, updated_at=? WHERE employee_id=?";
     con.query(update_employee, [item_name, result[0].item_stock, item_stock, current_date_time, employee_id], function (err, result) {
     if (err) throw err;
      if (result.affectedRows == 0) {
         res.json( {Status:3,Message:"Failed",ResponseCode:200} );
      } else {
         res.json( {Status:1,Message:"Item stock has been updated successfully!",ResponseCode:200} );
      }
     });
   }
 });
})



//Get electronic items with stock status by employee ID
app.get('/getItemsByEmpID', function (req, res) {
   var employee_id = req.body.employee_id;
   var get_items_by_employee_id = "SELECT item_id, item_name, item_category, item_stock, created_at, updated_at FROM items WHERE employee_id = ?";
   con.query(get_items_by_employee_id, [employee_id], function (err, result, fields) {
   if (result.length == 0) {
    res.json( {Status:2,Message:"Employee ID doesn't exist.",ResponseCode:200} );
   } else {
      Object.keys(result).forEach(function(key) {
         var row = result[key];
         res.json( {item_id : row.item_id, item_name : row.item_name, item_category : row.item_category, item_stock : row.item_stock, created_at : row.created_at, updated_at : row.updated_at } );
       });
   }
 });
})



//create servrer
var server = app.listen(10000, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Electronic store application listening at http://%s:%s/", host, port)
})

//handle wrong route 
app.use(function(req, res, next) {
   res.status(404).json( {Status:1,Message:"Sorry, that route doesn't exist. Have a nice day",ResponseCode:200} );
});