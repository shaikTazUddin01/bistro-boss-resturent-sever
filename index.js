const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
// -------port----------
const port = process.env.PORT || 5000
const app = express()
// ------middleware--------
app.use(cors())
app.use(express.json())

//middlere varify token 
const varifyToken = (req, res, next) => {
  if (!req.headers?.authorization) {
    return res.status(401).send({ messages: 'forbiden access' })
  }
  const token = req.headers.authorization.split(' ')[1]
  jwt.verify(token, process.env.JWT_SECRET_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(401).send({ messages: 'forbiden access' })

    }
    req.decoded = decoded

    next()
  })
  // inodem 

}
//verify admin
const verifyAdmin = async (req, res, next) => {
  const email = req.decoded.email;
  const query = { email: email }
  const user = await userCollection.findOne(query)
  const isAdmin = user?.role === 'admin';
  if (!isAdmin) {
    return res.status(401).send({ messages: 'forbiden access' })

  }
  next()
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.25fgudl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// ------Create a MongoClient with a MongoClientOptions object to set the Stable API version-------
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const DataBase = client.db('BistroBoss_restaurent')
const menuCollection = DataBase.collection('menu')
const reviewCollection = DataBase.collection('review')
const AddToCart = DataBase.collection('AddToCart')
const userCollection = DataBase.collection('user')

//jwt related api
app.post('/jwt', async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.JWT_SECRET_TOKEN, {
    expiresIn: '24h'
  })
  res.send({ token })
})


//user api and oparation
app.get('/user/admin/:email', varifyToken, async (req, res) => {
  const email = req.params.email;
  console.log(req.decoded)
  console.log(email)
  if (email !== req.decoded.email) {
    return res.status(4030).send({ message: 'unauthorized access' })
  }
  const query = { email: email };
  const user = await userCollection.findOne(query)
  let admin = false;
  if (user) {
    admin = user?.role === "admin"
  }
  res.send({ admin });
})
app.patch('/user/admin/:id', async (req, res) => {
  const id = req.params.id
  const filter = { _id: new ObjectId(id) }
  console.log(filter)


  const updateDoc = {
    $set: {
      role: 'admin'
    }
  }
  const result = await userCollection.updateOne(filter, updateDoc)
  res.send(result)
})
app.delete('/user/:id', async (req, res) => {
  const id = req.params.id
  const query = { _id: new ObjectId(id) }
  const result = await userCollection.deleteOne(query)

  res.send(result)
  console.log(result)
})

app.get('/user', varifyToken,verifyAdmin, async (req, res) => {
  // const token = req.headers.authorization
  // console.log(token)
  const result = await userCollection.find().toArray()
  res.send(result)
})
app.post('/user', async (req, res) => {
  const userData = req.body;
  const userEmail = req.query.email
  const query = { email: userEmail }
  const isExist = await userCollection.findOne(query)
  if (isExist) {
    return res.send('already user is exist')
  }
  const result = await userCollection.insertOne(userData)
  res.send(result)
})
// add to cart collection
app.delete('/addtocart/:id', async (req, res) => {
  const id = req.params.id;
  // console.log(id)
  const query = { _id: new ObjectId(id) }
  const result = await AddToCart.deleteOne(query)
  res.send(result)
})
app.get('/addtocart', async (req, res) => {
  const email = req.query.email;
  // console.log(email)
  const filter = { user: email }
  const result = await AddToCart.find(filter).toArray()
  res.send(result);
})
app.post('/addtocart', async (req, res) => {
  const data = req.body;
  const result = await AddToCart.insertOne(data)
  res.send(result);
})

// menu collection
app.get('/menu', async (req, res) => {
  const result = await menuCollection.find().toArray()
  res.send(result)
})
// review collection
app.get('/review', async (req, res) => {
  const result = await reviewCollection.find().toArray()
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
app.get('/', (req, res) => {
  res.send("bistro boss server is connecting");
})

//----------connecting port--------
app.listen(port, () => {
  console.log("connecting port is: ", port)
})