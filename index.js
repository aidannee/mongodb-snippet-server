import express from "express";
import { nanoid } from "nanoid";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const conn = mongoose.createConnection(process.env.MONGO_URI);

const SnippetSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    shortId: String,
  },
  { timestamps: true }
);

const Snippet = conn.model("Snippet", SnippetSchema);

Snippet.find();

const app = express();
app.use(express.json());
app.use(cors());

app.get("/snippets", async function (request, response) {
  const snips = await Snippet.find();
  response.send(snips);
});

app.get("/snippets/:shortId", async function (request, response) {
  const { shortId } = request.params;
  const foundDocument = await Snippet.findOne({ shortId: shortId });
  if (foundDocument) {
    response.send(foundDocument);
  } else {
    response.status(404).send("snippet not found");
  }
});
app.post("/snippets", async function (request, response) {
  const newDocument = {
    shortId: nanoid(8),
    title: request.body.title,
    content: request.body.content,
  };
  const createdSnippet = await Snippet.create(newDocument);
  response.send(createdSnippet);
});

app.delete("/snippets/:shortId", async function (request, response) {
  const { shortId } = request.params;
  const foundDocument = await Snippet.findOne({ shortId: shortId });
  const deletedSnippet = await Snippet.deleteOne({ shortId: shortId });
  if (deletedSnippet.deletedCount > 0) {
    response.send("snippet deleted");
  } else {
    response.status(404).send("snippet not found");
  }
});

app.put("/snippets/:shortId", async function (request, response) {
  const { shortId } = request.params;
  const updatedSnippet = await Snippet.findOneAndUpdate(
    { shortId: shortId },
    { title: request.body.title, content: request.body.content },
    { new: true }
  );

  response.send(updatedSnippet);
});

app.listen(process.env.PORT, function () {
  console.log("listening on http://localhost:9000" + process.env.PORT);
});
