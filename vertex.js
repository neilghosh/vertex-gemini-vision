const { VertexAI } = require('@google-cloud/vertexai');

const vertex_ai = new VertexAI({ project: 'demoneil', location: 'us-central1' });
const model = 'gemini-1.0-pro-vision-001';
// Instantiate the models
const generativeModel = vertex_ai.preview.getGenerativeModel({
    model: model,
    generationConfig: {
        'maxOutputTokens': 2048,
        'temperature': 0,
        'topP': 0.4,
        'topK': 32,
    },
    safetySettings: [
        {
            'category': 'HARM_CATEGORY_HATE_SPEECH',
            'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
            'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
            'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
            'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
            'category': 'HARM_CATEGORY_HARASSMENT',
            'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
        }
    ],
});

class Vertex {  // Initialize Vertex with your Cloud project and location
    constructor() {
    }

    async generateContent(file_data, dimensions) {
    
        var base64Image = file_data.toString('base64');
        const image1 = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image

            }
        };

        const promotText = `Give the co-ordinates of the cropped to the bird  and name of the bird of given the original size is ` + dimensions.w + `×` + dimensions.h + ` pixels
        Response in JSON with bounding box array attribute `;
        console.log(`Promt Text `+ promotText);
        const request = {
            contents: [
                {
                    role: 'user', parts: [{
                        text: promotText}, image1]
                }
            ],
        };

        // console.log('Non-Streaming Response Text:');
        // const result = await generativeModel.generateContent(request);
        // const response = result.response;
        // console.log('Response: ', JSON.stringify(response));
        console.log('Requesting Gemini '+model);
        const streamingResult = await generativeModel.generateContentStream(request);
        const contentResponse = await streamingResult.response;
        console.log('Response obtained from Gemini '+ JSON.stringify(contentResponse.usageMetadata));
        const markDown = contentResponse.candidates[0].content.parts[0].text;
        //console.log(markDown);
        //Strip th emarkdown to only have the JSON string.
        const json = markDown.substring(9, markDown.length - 3);
        console.log(JSON.stringify(json));
        return json;
    }
}

module.exports = {
    Vertex
}