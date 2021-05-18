//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-aaradhya:Test123@cluster0.mmn5s.mongodb.net/todolistDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
useUnifiedTopology:true
});
const itemsSchema={
  name:String
};
const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome to your todolist"
});

const item2=new Item({
  name:"Hit the + button to add a new item."
});
const item3=new Item({
  name:"<-- Hit this to delete an item."
});

const listSchema={
  name:String,
  items:[itemsSchema]
};
  const defItems=[item1, item2, item3];
const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {
Item.find({},function(err,foundItems){
if(foundItems.length===0)
{

  Item.insertMany(defItems,function(err){
  if(err){
    console.log(err);
  }
  else{
    console.log("Success");
  }
  });
res.redirect("/");

}
else{
    res.render("list", {listTitle:"Today", newListItems: foundItems});
}
})


});
app.get("/:custom",function(req,res){
  const customlis=_.capitalize(req.params.custom);
  List.findOne({name:customlis},function(err,results){
if(!err){
  if(!results){
    const list=new List({
      name:customlis,
      items:defItems
    });
    list.save();
    res.redirect("/"+customlis);
  }
  else {
    res.render("list", {listTitle:results.name, newListItems: results.items});
  }
}
     })

})

app.post("/", function(req, res){

  const item = req.body.newItem;
const listNme=req.body.list;
const itemNme=new Item({
  name:item
});
if(listNme==="Today"){
  itemNme.save();
      res.redirect("/");
}else{
  List.findOne({name:listNme},function(err,foundList) {
if(err)
{console.log(err);
}
else
{ foundList.items.push(itemNme);
    foundList.save();
    res.redirect("/"+listNme);
  }
});
}


});
app.post("/delete", function(req, res){
const delitem=req.body.checkbox;
const  delList=req.body.deleteItem;
if(delList==="Today"){
  Item.findByIdAndRemove(delitem,function(err){
    if(!err){
    console.log("success");
  res.redirect("/");
  }
  });
}
else{
  List.findOneAndUpdate(
    {name:delList},
    {$pull:{items:{_id:delitem}}},
    function(err,foundList)
    {
      if(!err){
        res.redirect("/"+delList);
      }
    }
  )

}


});


app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
port=3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
