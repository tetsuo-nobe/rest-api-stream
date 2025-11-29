import { pipeline } from 'node:stream/promises';
import { BedrockRuntimeClient, ConverseStreamCommand } from "@aws-sdk/client-bedrock-runtime";

export const handler = awslambda.streamifyResponse(async (event, responseStream, _context) => {
  const client = new BedrockRuntimeClient({ region: "us-west-2" });  

  const command = new ConverseStreamCommand({
    modelId: "us.amazon.nova-lite-v1:0",
    messages: [{role: "user", content:[{text: "私は旅行に興味があります。京都の有名な観光地を5つ挙げて下さい。"}]}]
  });
  
  const response = await client.send(command);

  responseStream = awslambda.HttpResponseStream.from(responseStream, {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    }
  });

  for await (const chunk of response.stream) {
    responseStream.write(JSON.stringify(chunk) + '\n');
  }

  responseStream.end();
});

  