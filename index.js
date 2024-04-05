const express=require('express')
const cors=require('cors')

// port
const PORT=process.env.PORT || 5000
const app=express()

// middleware
app.use(cors)


app.get('/',(req,res)=>{
    res.send("bistro boss server is connecting");
})

//connecting port
app.listen(PORT,()=>{
    console.log("connecting port is: ",PORT)
})