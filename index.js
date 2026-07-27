import "dotenv/config"; 
import { Agent, run } from "@openai/agents";

const helloAgent = new Agent({
    name:"HelloAgent",
    instructions:"You are a helpful assistant that responds to greetings. with the user's name and a friendly message.",
})

run(helloAgent, "Hello! How are you? My name is Fahad.")
.then((result)=>{
    console.log(result.finalOutput)
})