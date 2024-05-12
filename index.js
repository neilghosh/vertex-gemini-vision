const express = require("express");
const fileupload = require("express-fileupload");
const { VertexAI } = require('@google-cloud/vertexai');

const app = express();


app.use(fileupload());

const port = parseInt(process.env.PORT) || 4051;

//app.use('/',express.static('public'))
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.use(express.raw({ type: 'application/octet-stream' }))

app.get("/test", (req, res) => {
  res.send("Hello World!");
});

app.post("/upload", (req, res) => {
  console.log(req.files);
  const dimensions = JSON.parse(req.body.dimensions);
  console.log(dimensions)
  // Initialize Vertex with your Cloud project and location
  const vertex_ai = new VertexAI({ project: 'demoneil', location: 'us-central1' });
  const model = 'gemini-1.0-pro-vision-001';
  // Instantiate the models
  const generativeModel = vertex_ai.preview.getGenerativeModel({
    model: model,
    generationConfig: {
      'maxOutputTokens': 2048,
      'temperature': 0.4,
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
  var file_data= req.files.file.data;
  var base64Image = file_data.toString('base64');
  const image1 = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image

    }
  };

  async function generateContent() {
    // const request = {
    //   contents: [
    //     {
    //       role: 'user', parts: [{
    //         text: `give coordinates of image crop where the bird is.
    //         Original size is 2902 × 2049 pixels
    //         response in JSON`}, image1]
    //     }
    //   ],
    // };

    const request = {
      contents: [
        {
          role: 'user', parts: [{
            text: `Given co-ordinates of the cropped to the bird  and name of the image given the original size is `+dimensions.w+`×`+dimensions.h+` pixels
            Response in JSON with bounding box array attribute `}, image1]
        }
      ],
    };

    // // Create the response stream
    // const responseStream =
    //   await generativeModel.generateContentStream(request);
  
    // // Wait for the response stream to complete
    // const aggregatedResponse = await responseStream.response;
  
    // // Select the text from the response
    // const fullTextResponse =
    //   aggregatedResponse.candidates[0].content.parts[0].text;
    // console.log(fullTextResponse);

    // console.log('Non-Streaming Response Text:');

    // const result = await generativeModel.generateContent(request);
    // const response = result.response;
    // console.log('Response: ', JSON.stringify(response));
  
    const streamingResult = await generativeModel.generateContentStream(request);
    const contentResponse = await streamingResult.response;
    const markDown = contentResponse.candidates[0].content.parts[0].text;
    console.log(markDown);

    const json = markDown.substring(9, markDown.length-3);
    console.log(json);
    res.send(json);

  }
  generateContent();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
