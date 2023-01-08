import bcrypt from 'bcrypt'
import { Timestamp } from 'mongodb';

 async function genPassword(password){
    const salt=await bcrypt.genSalt(10);
    return await bcrypt.hash(password,salt);
}



async function createManager(client, name, hashpassword,email,pay,user) {
     
    // const mail=await Client.db("users").collection("Manager").findOne(email)
       
return await client.db("Moneytrack").collection("user2").insertOne({ name: name, password: hashpassword,email:email,pay:pay,user:user},{timestamp:true});
  
    
        
    }
  
  
   
    async function checkuser(client,email) {
     
        // const mail=await Client.db("users").collection("Manager").findOne(email)
                
         return await client.db('users').collection('user2').findOne({email:email});
        
            
        }

         async function sum(client){
            
            return await client.db("Moneytrack").collection("transaction").aggregate([
                {
                  $group: {
                    _id: "null",
                    sum: {
                      "$sum": "$amount"
                    }
                  }
                }
              ])
         }


  
        async function addtransaction(client,currentuser,text,amount,date,total){
            return await client.db('Moneytrack').collection('transaction').insertOne({text:text,amount:amount,currentuser:currentuser,date:date,total:total})
         }

  export {checkuser,createManager,genPassword,addtransaction,sum}  