const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
    origin: [
        'http://localhost:5174',
        'https://smart-tech-project.web.app',
        'https://vercel.com/kawsers-projects-01660197/smart-tech-spot-server/6rn3XYfJJxbZVNWoHed4qo6iSb94'
    ]
}));
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.euq4zn2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const queryCollection = client.db('querieDB').collection('querie')
        const recommendCollection = client.db('querieDB').collection('recommend')


        // for query
        app.post("/add-query", async (req, res) => {
            const newQuery = req.body
            const result = await queryCollection.insertOne(newQuery);
            res.send(result)
        })

        app.get("/recent-queries", async (req, res) => {
            const cursor = queryCollection.find().sort({ _id: -1 });
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/recent-queries/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const singleQuery = await queryCollection.findOne(query)
            res.send(singleQuery);
        })

        app.get("/myQueries/:email", async (req, res) => {
            const result = await queryCollection.find({
                'userInfo.userEmail': req.params.email
            }).sort({ _id: -1 }).toArray();
            res.send(result)
        })

        app.delete('/myQueries/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const deletedQuery = await queryCollection.deleteOne(query)
            res.send(deletedQuery);
        })

        app.put('/recent-queries/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateQuery = req.body;
            const upArt = {
                $set: {
                    productName: updateQuery.productName,
                    brandName: updateQuery.brandName,
                    queryTitle: updateQuery.queryTitle,
                    productPhoto: updateQuery.productPhoto,
                    boycottDetails: updateQuery.boycottDetails,
                    date: updateQuery.date, processing_time: updateQuery.processing_time,
                }
            }
            const result = await queryCollection.updateOne(filter, upArt, options)
            res.send(result);
        })

        // for recommend

        app.post("/add-recommendation", async (req, res) => {
            const newRecommend = req.body
            const result = await recommendCollection.insertOne(newRecommend);
            res.send(result)
        })

        app.get("/all-recommendation", async (req, res) => {
            const cursor = recommendCollection.find().sort({ _id: -1 });
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get("/myRecommendation/:email", async (req, res) => {
            const result = await recommendCollection.find({
                recommenderEmail: req.params.email
            }).sort({ _id: -1 }).toArray();
            res.send(result)
        })

        app.delete('/myRecommendation/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const deletedRecommend = await recommendCollection.deleteOne(query)
            res.send(deletedRecommend);
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server is running')
})
app.listen(port, () => {
    console.log(`server is running on port: ${port}`);
})