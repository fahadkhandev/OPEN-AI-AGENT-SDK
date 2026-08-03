import "dotenv/config"; 
import { Agent , run ,tool} from "@openai/agents";
import { z } from "zod";


interface MyContext {
    userId:string,
    userName:string,

    fetchUserInfoFromDB: (userId:string)=>Promise<string>
}

const getUserInfoTool = tool({
    name:"getUserInfo",
    description:"Get user information.",
    parameters: z.object({}),
    exexute: async (_, ctx?:RunContext<MyContext>): Promise<string> => {
        const result = await ctx?.context.fetchUserInfoFromDB();
        return result; //what is returing here is RunTime context
    }
     
})

const customerSupportAgent = new Agent<MyContext>({
    name:"Customer support agent",
    tools:[getUserInfoTool],
    instructions:({context})=>{
        return `You are an expert customer support agent\nContext:${JSON.stringify(context)}`
    }
})


async function main(query: string ,ctx:MyContext){
    const result = await run(customerSupportAgent,query,{
        context:ctx
    })
    console.log(result.finalOutput);
}

main(`Hey, whats my name?`,
    //below is local context
    {
    userId:"123",
    userName:"John Doe",
    fetchUserInfoFromDB: async (id)=>{
        // Simulate fetching user info from a database
        return `User ID: ${id}, User Name: John Doe`;
    }
})