// **** load mongoose ****
const mongoose = require("mongoose");

// Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
// by default, you need to set it to false.
mongoose.set("useFindAndModify", false);

// **** connect to MongoDB (from configuration file) ****
console.log("connecting to MongoDB...");
mongoose
  .connect("mongodb://localhost/images", { useNewUrlParser: true })
  .then(() => {
    console.log("connected to MongoDB!!!");
  })
  .catch(err => {
    console.error("could NOT connect to MongoDB", err);
  });

// **** define a schema (completely against No-SQL and MongoDB) ****
const imageSchema = new mongoose.Schema({
  name: String,
  patient: String,
  tags: [String],
  date: { type: Date, default: Date.now },
  reviewed: { type: Boolean, default: false },
  width: Number,
  height: Number
});

// **** compile the schema to a model ****
const Image = mongoose.model("image", imageSchema);

/*
 * Should pass parameters.
 * Insert a document into the database.
 */
async function createImage() {
  // **** instantiate an image ****
  const image = new Image({
    name: "12345111112222222222333333333399",
    patient: "Jane Smith",
    tags: ["left arm", "side"],
    width: 512,
    height: 1024
  });

  // **** save the image to the database (async method - returns a promise) ****
  const result = await image.save();

  // **** display result ****
  console.log("result: " + result);
}

/*
 * Get all image documents from MongoDB.
 * Must decorate with async due to await.
 */
async function getImages() {
  // ???? inform the user what is going on ????
  console.log("finding images ...");

  // **** for paging ****
  // e.g., /api/images?pageNumber=2&pageSize=10
  const pageNumber = 2;
  const pageSize = 5;

  // **** find all images in the database ****
  // const images = await Image.find();

  // **** find image(s) for specified patient(s) ****
  const images = await Image.find({ patient: /$/ })
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .sort({ patient: 1 }) // -1 == desc, 1 == asc
    .select({ _id: 1, patient: 1, name: 1, tags: 1, width: 1, height: 1 });

  // ???? inform the user what is going on ????
  console.log("images found:\n" + images);
}

// **** create an image *****
// createImage();

// // **** get all images ****
// getImages();

/*
 * Update the metadata for the specified image.
 * id  image id to be updated
 *
 * Query first approach:
 *  findByID()
 *  modify its properties
 *  save()
 */
async function updateImage(id) {
  // ???? display image id ????
  console.log("updateImage <<< id: " + id);

  // **** query for the image ****
  const image = await Image.findById(id);

  // **** check if image not found ****
  if (!image) {
    console.log(`updateImage <<< id: ${id} not found`);
    return;
  }

  // **** update the image (flag image has been reviewed) approach 1 ****
  image.reviewed = true;
  image.patient = "Mike Pence";

  // **** update the image (flag image has been reviewed) approach 2 ****
  // image.set({
  //   reviewed: true,
  //   patient: "Mike Pence"
  // });

  // **** save to db updated record ****
  const result = await image.save();

  // ???? display updated record ????
  console.log("updateImage <<< result: " + result);
}

/*
 * Update the metadata for the specified image.
 * id  image id to be updated
 *
 * Update first approach:
 *  update directly
 *  optionally: get the updated document
 */
async function updateImage2(id) {
  // ???? display the id ????
  console.log(`updateImage2 <<< id: ${id}`);

  // // **** update the specified image (returns update info) ****
  // const result = await Image.updateOne(
  //   { _id: id },
  //   {
  //     $set: {
  //       reviewed: false,
  //       patient: "John Canessa Coca Cola"
  //     }
  //   }
  // );

  // **** update the specified image (returns updated image) ****
  // const image = await Image.findByIdAndUpdate(id, {
  const image = await Image.findOneAndUpdate(
    id,
    {
      $set: {
        patient: "John Coca Cola",
        reviewed: false
      }
    },
    { new: true } // to return the updated record
  );

  // ???? display the update results ????
  // console.log("updateImage2 <<< result: ", result);
  console.log("updateImage2 <<< image: ", image);
}

// **** call the update image function ****
// updateImage("5cc75789c4523c19504f7acd");
// updateImage2("5cc705ebe05a6911b0c11d8b");

/*
 * Remove the specified image from the database.
 */
async function removeImage(id) {
  // ???? display the id ????
  console.log(`removeImage <<< id: ${id}`);

  // // **** delete the image from the database ****
  // const result = await Image.deleteOne({ _id: id });

  // **** delete the image from the database ****
  const image = await Image.findByIdAndRemove(id);

  // ???? display the removed image ????
  // console.log("removeImage <<< result: ", result);
  console.log("removeImage <<< image: ", image);
}

// **** remove the specified image ****
removeImage("5cc705ebe05a6911b0c11d8b");
