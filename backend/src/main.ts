import  express  from "express";



const app = express()


app.get('/',(req,res)=>{
    console.log("hello")
})

app.listen(3001,()=>{
    console.log("app is running")
})