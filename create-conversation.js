import "dotenv/config"
import { OpenAI } from "openai"


//Server-managed conversations : its really a nice handy way of storing messages into OpenAI server , rather then managing it on our own DB. 

const client = new OpenAI()

client.conversations.create({}).then((e)=>{
    console.log(`Convsersation thread created id ${e.id}`)
})
