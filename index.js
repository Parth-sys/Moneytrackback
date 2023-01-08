import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connection from "./connection.js"
import { genPassword, createManager,checkuser,addtransaction,sum } from "./helper.js";
import jwt from 'jsonwebtoken';
import bcrypt, { compare } from 'bcrypt';
import { Timestamp } from "mongodb";



const app=express()

app.use(express.json({extended:false}));
app.use(cors());
dotenv.config();








const Port=process.env.Port


app.get('/',(req,res)=>{
    res.send("server is running");
})



//user login
app.post('/Login',async(req,res)=>{
  
  


    try {
        const client= await connection()

        const {email,password}=req.body;
        
        
        const result=  await client.db('Moneytrack').collection('user2').findOne({email:email});
        console.log(result)

        
             
       const storedpass=result.password;
       if(!result){
           res.status(403).json({message:"Wrong username or password"})
           
        }
        
        
        
        const isMatch= await bcrypt.compare(password,storedpass); 
        //   const user=client.db("users").collection("users2").find({email:email,password:password})
        //   console.log(user.data)
        if(isMatch){
            
            
            const token=jwt.sign({id:result._id},process.env.SECRET_KEY) //jwt token
            
              var currentuser={
                email:result.email
              }    
            
            res.status( 200).send({ token:token,currentuser:currentuser});
        } 
        
        
        
        
    } catch (error) {
        console.log(error);
    }
    

});

// user signup
app.post('/signup', async (req,res)=>{
    
    const client=await connection();
     

    const { email, name,password,pay,user}=req.body;
    
    


    const hashpassword=  await genPassword(password);
    //console.log(username,password)
       
    

    const result= await createManager(client, name, hashpassword,email,pay,user);
    
    console.log(result)
                              
    //console.log(adduser,result); 
    res.send(result);


});





//split money
app.post('/userpay',async(req,res)=>{
    try{
      
 
     const client=await connection()

     const {pay,currentuser}=req.body;

 

    const res=client.db("Moneytrack").collection("user2").updateMany({},{$set:{pay:pay,user:currentuser}},{multi:true})
     
     
     res.status(200).send({message:"payment split success"})
    }
    
    catch(error){
      res.status(400).json(error);
    }



  

})






app.delete('/delete/:_id',async(req,res)=>{
   
    try{
        const{_id}=req.params;

        console.log(_id)
    
        const client=await connection();

        var result=await client.db("Moneytrack").collection("transaction").deleteOne({_id:_id})
         console.log(result)
         res.status(200).send({message:"user deleted"})
      }
      
      catch(error){
        res.status(400).json(error);
      }
  

})








//edit transaction

app.patch('/data/:_id',async(req,res)=>{


  try {
      const {_id}=req.params;
      const {text,amount,date}=req.body;
            

     const client=await connection()
      
     const resp= await client.db('Moneytrack').collection('transaction').updateOne({_id:_id}, {$set :{text:text,amount:amount,date:date}},{upsert:true})
      console.log(resp);
      res.send(resp)
    
  } catch (error) {
    console.log(error)
    res.status(400).json({error})
    
  }

})



//add transaction
app.post('/data',async(req,res)=>{

    

    try {
           
          
         var currentuser=req.body.currentuser;
         var text=req.body.text;
         var amount=parseInt(req.body.amount);
         var date=req.body.date
         
         const client=await connection();
         
         
         const resp=await  addtransaction(client,currentuser,text,amount,date,total)
         console.log(resp)
           
         
   res.status(200).send({result:resp})
} catch (error) {
        res.json({message:error});
    }
})

//transaction data with sum



app.get('/data',async(req,res)=>{
    try {
        const client= await connection();
        const result=await client.db("Moneytrack").collection("transaction").find().toArray();
       
        
    //db.teams.aggregate([{$group: {_id:null, sum_val:{$sum:"$points"}}}])
    
    res.status(200).send(result)
  

} catch (error) {
    res.send(error)
    
}

})


app.post('/userbud',async(req,res)=>{
  const {budget,currentuser}=req.body
try {
    
    const client=await connection();
    const res=await client.db("Moneytrack").collection("userbud").insertOne({budget:budget,user:currentuser});
    
    console.log(res);
  
res.status(200).send(res)
  
    
} catch (error) {
    console.log(error)
}


})



app.get('/budget',async(req,res)=>{
 
  try {
      
  
  

      const client=await connection();
      const resp= await client.db("Moneytrack").collection("userbud").find().toArray()
      
      console.log(resp);
    
      res.status(200).send(resp)
    
      
  } catch (error) {
      console.log(error)
  }
  
  
  })
  
  



//userlist with count
app.get('/users',async(req,res)=>{
   try {
       const client=await connection();
       const result=await client.db('Moneytrack').collection('user2').find().toArray()
       const count=await client.db('Moneytrack').collection('user2').countDocuments()
      res.status(200).send({data:result,count:count});
      
    } catch (error) {
        res.status(404).send({message:"Not found"})    
   }

})








app.listen(Port,()=>{
    console.log("server running at ",Port)
})
