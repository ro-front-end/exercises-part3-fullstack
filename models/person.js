const mongoose = require("mongoose");

require("dotenv").config({ path: ".env.local" });

mongoose.set("strictQuery", false);

const url = process.env.MONGODB_URI;

console.log("connecting to:", url);

mongoose
  .connect(url)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.error("error connecting to MongoDB", error.message);
  });

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Person = mongoose.model("Person", personSchema);

module.exports = Person;

// if (process.argv.length === 5) {
//   const name = process.argv[3];
//   const number = process.argv[4];

//   const person = new Person({
//     name: name,
//     number: number,
//   });

//   person.save().then(() => {
//     console.log(`added ${name} number ${number} to phonebook`);
//     mongoose.connection.close();
//   });
// } else if (process.argv.length === 3) {
//   Person.find({}).then((result) => {
//     console.log("phonebook:");
//     result.forEach((person) => {
//       console.log(`${person.name} ${person.number}`);
//     });
//     mongoose.connection.close();
//   });
// } else {
//   console.log("Invalid number of arguments");
//   mongoose.connection.close();
// }
