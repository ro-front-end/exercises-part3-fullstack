const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const Person = require("./models/person");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("dist"));
app.use(morgan("dev"));

// let persons = [
//   {
//     id: 1,
//     name: "Arto Hellas",
//     number: "040-123456",
//   },
//   {
//     id: 2,
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//   },
//   {
//     id: 3,
//     name: "Dan Abramov",
//     number: "12-43-234345",
//   },
//   {
//     id: 4,
//     name: "Mary Poppendieck",
//     number: "39-23-6423122",
//   },
// ];

// const generateId = () => {
//   const maxId = persons.length > 0 ? Math.max(...persons.map((p) => p.id)) : 0;

//   return maxId + 1;
// };

const date = new Date();
const formmatedDate = date.toString();

// app.get("/", (request, response) => {
//   response.send("<h1>Hello World!</h1>");
// });

app.get("/api/persons", (request, response) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => {
      console.error(error.message);
      response.status(500).json({ error: "Error retrieving persons" });
    });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error)); // Usa el middleware errorHandler
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ error: "name or number missing" });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;

  Person.findByIdAndUpdate(request.params.id)
    .then((person) => {
      if (!person) {
        return response.status(404).end();
      }

      person.name = name;
      person.number = number;

      return person.save().then((updatedPerson) => {
        response.json(updatedPerson);
      });
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.get("/api/persons/info", async (request, response) => {
  try {
    const count = await Person.countDocuments();
    response.send(
      `<h3>Phonebook has info for ${count} people</h3><p>${formmatedDate}</p>`
    );
  } catch (error) {
    console.error(error.message);
    response.status(500).send("Internal Server Error");
  }
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformed id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
