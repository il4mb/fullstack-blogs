const mongoose = require('mongoose');

module.exports = async () => {
    // Close the database connection
    await mongoose.connection.close();
    // Exit the process
    process.exit(0);
};
