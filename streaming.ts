import "dotenv/config"; 
import { Agent , run } from "@openai/agents";


const agent = new Agent({
    name:"Story generator",
    instructions:"You are a helpful assistant. You will be given a prompt and you will generate a story based on that prompt. The story should be engaging, creative, and well-structured. Please ensure that the story has a clear beginning, middle, and end. Avoid using any offensive or inappropriate content in the story."
})

//way 3 our own generator function to stream the output as it is generated 
async function* streamOutput(q:string){
    const result = await run(agent,q , {stream:true});
     const stream = result.toTextStream();
    for await(const val of stream){
        yield{ isCompleted:false,value:val }
    }
    yield {isCompleted:true,value:result.finalOutput}
}

async function main(query: string){
    for await(const val of streamOutput(query)){
        console.log(val)
    }

    // const result = await run(agent,query , {stream:true});
    // result.toTextStream({compatibleWithNodeStreams:true}).pipe(process.stdout); //way 2, Stream the output as it is generated

    //way 1, Stream the output as it is generated
    // const stream = result.toTextStream();
    // for await(const val of stream){
    //     console.log(val)
    // }
}


main("Tell me a story about macbook in 100 words")