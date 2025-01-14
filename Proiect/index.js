const express= require("express");
const path= require("path");
const fs=require("fs");
const sharp= require("sharp")



app= express();

app.set("view engine", "ejs");

console.log("Folder index.js", __dirname);
console.log("Folder curent", process.cwd());
console.log("Cale fisier", __filename);

obGlobal ={
    obErori: null,
    obImagini: null
}

vectorFoldere=["temp","poze_uploadate", "backup", "temp1"]
for (let folder of vectorFoldere){
  let folderAbsolutPath=path.join(__dirname,folder)
  if (!fs.existsSync(folderAbsolutPath))
    fs.mkdirSync(folderAbsolutPath)
}

app.get("/favicon.ico", function(req, res){
  res.sendFile(path.join(__dirname, "resurse/imagini/favicon/favicon.ico"));
})

app.get("/galerie", function(req, res) {
  res.render("pagini/galerie", { imagini: obGlobal.obImagini.imagini });
});

app.get(["/","/index","/home"], function(req,res){
    console.log(req.params)
    res.render("pagini/index", {ip: req.ip, imagini:obGlobal.obImagini.imagini});
})

app.get("*.ejs", function(req, res){
  afisareEroare(res, 400);
})

app.get(/^\/resurse\/[a-z0-9A-Z\/]*\/$/, function(req, res){
  afisareEroare(res, 403);
}) 
// send file automat
app.use("/resurse", express.static(path.join(__dirname,"resurse")));

app.get("/*", function(req, res){
    console.log(req.url)
    try {
      res.render("pagini"+req.url, function(err, rezRandare){
        console.log("Eroare", err);
        console.log("Rezultat Randare", rezRandare);
        if (err){
          // res.render("pagini/eroare");
          if (err.message.startsWith("Failed to lookup view")){
            afisareEroare(res, 404, "Pagina negasita", "Verificati URL-ul");
          }
          else {
            afisareEroare(res, -1);
          }
        }
        else {
          res.send(rezRandare);
        }
      })
    }
    catch (err1){
      if (err1.message.startsWith("Cannot find module")){
        afisareEroare(res, 404, "Pagina negasita", "Verificati URL-ul");
      }
      else {
        afisareEroare(res, -1);
      }
    }
})


//    app.get("/ceva", function(req, res){
//        res.send("test")
//     })


function initErori(){
    let continut = fs.readFileSync(path.join(__dirname, "resurse/json/erori.json")).toString("utf-8");
    obGlobal.obErori=JSON.parse(continut)
    console.log(obGlobal.obErori)
    obGlobal.obErori.eroare_default.imagine=path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine)
    for (let eroare of obGlobal.obErori.info_erori){
        eroare.imagine=path.join(obGlobal.obErori.cale_baza, eroare.imagine)
    }
    console.log(obGlobal.obErori);
}

initErori()


function afisareEroare(res, identificator, titlu, text, imagine){
  let eroare= obGlobal.obErori.info_erori.find(function(elem){
                return elem.identificator==identificator
              });
  if(eroare){
    if (eroare.status)
      res.status(identificator)
    var titluCustom=titlu || eroare.titlu;
    var textCustom=text || eroare.text;
    var imagineCustom=imagine || eroare.imagine;
  }
  else {
    var err= obGlobal.obErori.eroare_default
    var titluCustom=titlu || err.titlu;
    var textCustom=text || err.text;
    var imagineCustom=imagine || err.imagine;
  }
  res.render("pagini/eroare", { //trasnmit obiectul locals
    titlu: titluCustom,
    text: textCustom,
    imagine: imagineCustom
})
}

function initImagini(){
  var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");

  obGlobal.obImagini=JSON.parse(continut);
  let vImagini=obGlobal.obImagini.imagini;

  let caleAbs=path.join(__dirname,obGlobal.obImagini.cale_galerie);
  let caleAbsMediu=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mediu");
  if (!fs.existsSync(caleAbsMediu))
      fs.mkdirSync(caleAbsMediu);

  //for (let i=0; i< vErori.length; i++ )
  for (let imag of vImagini){
      [numeFis, ext]=imag.fisier_imagine.split(".");
      let caleFisAbs=path.join(caleAbs,imag.fisier_imagine);
      let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
      sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
      imag.fisier_mediu=path.join("/", obGlobal.obImagini.cale_galerie, "mediu",numeFis+".webp" )
      imag.fisier_imagine=path.join("/", obGlobal.obImagini.cale_galerie, imag.fisier_imagine )
      
  }
  console.log(obGlobal.obImagini)
}
initImagini();

app.listen(8080);