const express=require('express')
const cors=require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
// -------port----------
const port=process.env.PORT || 5000
const app=express()
// ------middleware--------
app.use(cors())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.25fgudl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// ------Create a MongoClient with a MongoClientOptions object to set the Stable API version-------
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const DataBase=client.db('BistroBoss_restaurent')
const menuCollection=DataBase.collection('menu')
const reviewCollection=DataBase.collection('review')
const AddToCart=DataBase.collection('AddToCart')

// add to cart collection
app.post('/addtocart',async(req,res)=>{
  const data=req.body;
  const result=await AddToCart.insertOne(data)

  res.send(result);
})

// menu collection
app.get('/menu',async(req,res)=>{
    const result=await menuCollection.find().toArray()
    res.send(result)
})
// review collection
app.get('/review',async(req,res)=>{
    const result=await reviewCollection.find().toArray()
    res.send(result)
})


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


//---------start server--------
app.get('/',(req,res)=>{
    res.send("bistro boss server is connecting");
})

//----------connecting port--------
app.listen(port,()=>{
    console.log("connecting port is: ",port)
})