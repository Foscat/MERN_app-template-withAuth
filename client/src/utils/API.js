import axios from "axios";

export default {
// Use this as working boilerplate and copy code for new table in db

  ///// User CRUD \\\\\

  // Add a user
  addUser: function(userData) {
    console.log("Add user data: ", userData);
    return axios.post("/api/users", userData);
  },
  // Gets all users
  getUsers: function() {
    return axios.get("/api/users");
  },
  // Update info on a user
  updateUser: function(id, updateData) {
    console.log("Update user id and data: ", id, updateData);
    return axios.put("/api/users/" + id, updateData)
  },
  // Delete a user
  deleteUser: function(id) {
    console.log("Delete user with id: ", id);
    return axios.delete("/api/users/" + id);
  },
  // Sign in a user
  signInUser: function(signInData){
    console.log("Sign in user data:", signInData);
    return axios.post("/api/users/signIn", signInData);
  },
  // Authenticate a user
  currentUser: function(token){
    return axios.post("/api/users/current", token);
  }
}