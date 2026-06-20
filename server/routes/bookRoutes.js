const router = require("express").Router();
const db = require("../config/db");

router.get("/", (req,res)=>{
  db.query("SELECT * FROM books",(err,result)=>{
    if(err) return res.status(500).json(err);
    res.json(result);
  });
});

router.post("/", (req,res)=>{
  const {title,author,isbn,quantity} = req.body;
  if(!title || !author){
    return res.status(400).json({message:"title and author are required"});
  }
  const qty = Number.isFinite(Number(quantity)) && Number(quantity) > 0 ? Number(quantity) : 1;

  db.query(
    "INSERT INTO books(title,author,isbn,quantity,available) VALUES(?,?,?,?,?)",
    [title,author,isbn ?? null,qty,qty],
    (err,result)=>{
      if(err) return res.status(500).json(err);
      res.json({message:"Book added"});
    }
  );
});

router.delete("/:id", (req,res)=>{
  const { id } = req.params;
  db.query("DELETE FROM books WHERE id = ?", [id], (err, result)=>{
    if(err) return res.status(500).json(err);
    if(result.affectedRows === 0) return res.status(404).json({message:"Book not found"});
    res.json({message:"Book deleted"});
  });
});

module.exports = router;