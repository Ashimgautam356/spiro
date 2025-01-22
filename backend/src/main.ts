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
        firstName: z.string().min(3,{message:"minimum length should be 3"}).max(20,{message:"maximum length is 20"}),
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

app.listen(3001,()=>{
    console.log("app is running")
})