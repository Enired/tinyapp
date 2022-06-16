// Check if user is in the database based on email input.
const getUserFromDataBase = (email, userDatabase) => {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user];
    }
  }
};

module.exports = {getUserFromDataBase}