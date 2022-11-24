const router = require("express").Router();
const fetchUser = require("../middleware/fetchUser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

// Route: 1 >>> Get all the notes of loggedin user - http://localhost:5000/api/notes/fetchallnotes >> login Required
router.get("/fetchallnotes", fetchUser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.status(200).json(notes);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
});

// Route: 2 >>> Add a new note - http://localhost:5000/api/notes/addnote >> login Required
router.post(
  "/addnote",
  fetchUser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Enter a valid description").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      // If there errors, return bad request and the error
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();
      res.status(201).json(savedNote);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

// Route: 3 >>> Update an exitsting note - http://localhost:5000/api/notes/updatenote >> login Required
router.put("/updatenote/:id", fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
    //Create a new note Object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    // Find a note to be updated to update it
    let note = await Notes.findById(req.params.id);
    if (!note) {
      res.status(404).send("Not Found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).json("Not Allowed");
    }

    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
});

// Route: 4 >>> Delete a note - http://localhost:5000/api/notes/deletenote >> login Required
router.delete("/deletenote/:id", fetchUser, async (req, res) => {
  // Find a note to be dleted to delete it
  try {
    let note = await Notes.findById(req.params.id);
    if (!note) {
      res.status(404).send("Not Found");
    }
    //Allow deletion only if owns this note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json("Not Allowed");
    }
    note = await Notes.findByIdAndDelete(req.params.id);
    res.status(201).json({ Success: "Note has been deleted", note: note });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
});
module.exports = router;
