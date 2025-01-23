import  express  from "express";
import z from 'zod'
import { PrismaClient } from "@prisma/client";
import bcrypt, { hash } from 'bcrypt'

const app = express()

const client  = new PrismaClient();
app.use(express.json())

app.get('/',(req,res)=>{
    res.status(200).json({
        message:"hello"
    })
})





app.post('/signup',async(req,res)=>{

    const userSchema = z.object({
        firstName: req.body.clotheId.min(3,{message:"minimum length should be 3"}).max(20,{message:"maximum length is 20"}),
        lastName: z.string().min(3,{message:"minimum length should be 3"}).max(20,{message:"maximum length is 20"}).optional(),
        email: z.string().email({message:"Invalid Email Formate"}),
        age: z.number({message:"enter number "}).min(16,{message:"should be 16"}).max(80).optional(),
        phone:z.number().max(15).optional(),
        gender:z.enum(["Male","Female"],{message:"enter your gender"}).optional(),
        password:z.string().min(8,{message:"week password"}).max(50,{message:"maximum length reached"}).regex(new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$'), {
            message:
            'Password must be at least 8 characters and contain an uppercase letter, lowercase letter, and number'
        })

    })

    const isValid = userSchema.safeParse({
        firstName: req.body.firstName,
        lastName: req.body.lastName, 
        email: req.body.email, 
        age: req.body.age, 
        phone:req.body.phone, 
        gender :req.body.gender, 
        password: req.body.password
    })
    

    if(!isValid.success){
        const validationError = isValid.error.formErrors;
        res.status(411).json({
            firstName: validationError.fieldErrors.firstName, 
            lastName: validationError.fieldErrors.lastName, 
            email:validationError.fieldErrors.email,
            phone:validationError.fieldErrors.phone,
            age:validationError.fieldErrors.age,
            gender:validationError.fieldErrors.gender,
            password:validationError.fieldErrors.password,
        })
        return;
    }


    const {email} = req.body.email; 
    const isEmailExist = await client.user.findFirst(email);

    if(!isEmailExist){
        const hashedPassword = await bcrypt.hash(req.body.password,5)
        try{
          await client.user.create({
                data:{
                    firstName:req.body.firstName, 
                    lastName: req.body.lastName,
                    email: req.body.email, 
                    password:hashedPassword,
                    age:req.body.age,
                    gender:req.body.gender,
                    phone:req.body.phone
                }
            })
            res.status(200).json({
                message:"signup sucessfull"
            })

        }catch(err){
            res.status(500).json({
                message:"internal server error"
            })
        }

        return;
    }else{
        res.status(403).json({
            message:"email already in use"
        })
    }

})

app.post('/login',async(req,res)=>{
    const userSchema = z.object({
        email: z.string().email({message:"Invalid Email Formate"}),
        password:z.string().min(8,{message:"week password"}).max(50,{message:"maximum length reached"}).regex(new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$'), {
            message:
            'Password must be at least 8 characters and contain an uppercase letter, lowercase letter, and number'
        })

    }) 

    const isValid = userSchema.safeParse({
        email: req.body.email,
        password: req.body.password
    })

    if(!isValid.success){
        const validationError = isValid.error.formErrors; 
        res.status(411).json({
            email:validationError.fieldErrors.email,
            password:validationError.fieldErrors.password,
        })
        return;
    }

    const {email,password} = req.body; 

    const userExist = await client.user.findFirst({where:{email:email}});

    if(!userExist){
        res.status(404).json({
            message:"email not found!!"
        })
        return; 
    }


    const passwordMatched =await bcrypt.compare(password,String(userExist?.password))

    if(passwordMatched){
        res.status(200).json({
            message:"sucess",
            firstName:userExist.firstName
        })
        return;
    }else{
        res.status(403).json({
            message:"password didn't match"
        })
    }
})

// add Clothes
// clotheId :1 ,
// title: black and white hoodie
// price: 500,
// size : xl, i have to put it in a array, 
// gender: [male,femaile,all
// stock: 10,
// colors:[red,balck],
//   discription : laf fljaslkfdjkas askdfjaslfsf  fjklasfjkas f fkafnlakfj
//   imageId

// first i have to check if the size,color,category of clothe is present or not. 


app.post('/addCategory',async(req,res)=>{
    const CategroyInput= z.object({
        name:z.string().min(2).max(15),
        imageId:z.string().array().nonempty()
    })

    const isValid = CategroyInput.safeParse({
        name:req.body.name,
        imageId: req.body.imageId
    })

    if(!isValid.success){
        const errorMessage = isValid.error.formErrors; 
        
        res.status(403).json({

        name:errorMessage.fieldErrors.name,
        imageId:errorMessage.fieldErrors.imageId

        })
    }

    const {name,imageId} = req.body
    const isAlreadyPresent = await client.category.findFirst({where:{name:name}})
    if(!isAlreadyPresent){
        try{
            await client.category.create({
                data:{
                    name:name,
                    imageUrl:imageId
                }
            })

            res.status(200).json({
                message:"success"
            })
        }catch(err){
            res.status(500).json({
                message:"internal server error"
            })
        }
    }else{
        res.status(411).json({
            message:"already present"
        })
    }

})


app.post('/addClothes',async(req,res)=>{

    const UserInput = z.object({
        categoryId: z.number(),
        title:z.string().min(4),
        price: z.number().positive(),
        size:z.string(),
        gender:z.string(),
        colors:z.string(),
        discription:z.string().min(10),
        imageUrl:z.array(z.string()).nonempty({message:"can't be empty"})
    })

    console.log(req.body)

    const isValid = UserInput.safeParse({
        categoryId:req.body.categoryId,
        title:req.body.title,
        size:req.body.size,
        gender:req.body.gender,
        stock:req.body.stock,
        colors:req.body.colors,
        discription:req.body.discription,
        imageUrl:req.body.imageUrl,
        price: req.body.price
    })

    if(!isValid.success){
        const errorMessage = isValid.error.formErrors; 
        res.status(403).json({

        categoryId:errorMessage.fieldErrors.categoryId,
        title:errorMessage.fieldErrors.title,
        size:errorMessage.fieldErrors.size,
        gender:errorMessage.fieldErrors.gender,
        colors:errorMessage.fieldErrors.colors,
        discription:errorMessage.fieldErrors.discription,
        imageUrl:errorMessage.fieldErrors.imageUrl,
        price: errorMessage.fieldErrors.price
        })

        return; 
        
    }

    const {categoryId,price,title,size,gender,colors,discription,imageUrl} = req.body
    const CategoryId = await client.category.findFirst({where:{id:categoryId}})
    if(categoryId != CategoryId?.id){
        res.status(404).json({
            message:"couln't find the category"
        })
        return;
    }
    try{
        await client.clothe_Details.create({
            data:{
                categoryId: categoryId,
                price:price,
                size:size,
                gender:gender,
                imageUrl:imageUrl,
                title:title,
                color:colors,
                discription:discription
            }
        })

        res.status(200).json({
            message:"success"
        })
    }catch(err){
        res.status(500).json({
            message:"internal server error"
        })
    }


})



app.listen(3001,()=>{
    console.log("app is running")
})