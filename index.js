import "dotenv/config"; 
import { Agent, run } from "@openai/agents";

const helloAgent = new Agent({
    name:"HelloAgent",
    instructions:"You are a helpful assistant that responds to greetings.",
})

run(helloAgent, "Hello! How are you?")
.then((result)=>{
    console.log(result.finalOutput)
})