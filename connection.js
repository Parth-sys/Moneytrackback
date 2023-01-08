import { MongoClient } from "mongodb";

async function connection(){
    
    const url=  process.env.url ;        
    const client=new MongoClient(url);
  
    await client.connect();
     console.log("mongodb connected");
      return client
    
}



export default connection;


